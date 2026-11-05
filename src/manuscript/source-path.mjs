/**
 * Read a value from the analysis summary by a recorded path, such as
 * `heap.rows[workload=ai_context,sessions=1024,condition=tiny].heap.estimate`.
 * A missing or non-finite value throws: there is no fallback for absent evidence.
 */
const SEGMENT = /^([^[]+)(?:\[(.+)\])?$/;

function selectRow(rows, selector, where) {
  if (!Array.isArray(rows)) throw new Error(`not a list at ${where}`);
  const criteria = selector.split(',').map((pair) => pair.split('='));
  const matches = rows.filter((row) => criteria.every(([key, value]) => String(row[key]) === value));
  if (matches.length !== 1) throw new Error(`expected one row for [${selector}] at ${where}, found ${matches.length}`);
  return matches[0];
}

/**
 * @param {object} root
 * @param {string} sourcePath
 */
export function readPath(root, sourcePath) {
  let current = root;
  const walked = [];
  for (const segment of sourcePath.split('.')) {
    const match = SEGMENT.exec(segment);
    if (!match) throw new Error(`malformed path segment: ${segment}`);
    walked.push(segment);
    current = current?.[match[1]];
    if (match[2]) current = selectRow(current, match[2], walked.join('.'));
    if (current === undefined || current === null) throw new Error(`missing evidence at ${walked.join('.')}`);
  }
  if (typeof current === 'number' && !Number.isFinite(current)) throw new Error(`non-finite value at ${sourcePath}`);
  return current;
}
