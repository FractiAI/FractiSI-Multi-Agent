/**
 * Byte-stable JSON and content hashing for receipts.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';

/**
 * JSON with recursively sorted object keys and a trailing newline. Non-finite
 * numbers throw instead of silently becoming `null`, because a NaN in a receipt
 * means a measurement went wrong.
 *
 * @param {unknown} value
 */
export function canonicalStringify(value) {
  return `${JSON.stringify(sortKeys(value, '$'), null, 2)}\n`;
}

function sortKeys(value, where) {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new TypeError(`non-finite number at ${where}: ${value}`);
  }
  if (Array.isArray(value)) return value.map((item, i) => sortKeys(item, `${where}[${i}]`));
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeys(value[key], `${where}.${key}`);
    return out;
  }
  return value;
}

/** @param {string | Buffer} content */
export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/** @param {string} filePath */
export function sha256File(filePath) {
  return sha256(fs.readFileSync(filePath));
}
