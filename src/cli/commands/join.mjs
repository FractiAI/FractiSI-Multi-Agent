/** Join the validation initiative. Receipts are read only after explicit consent. */
import fs from 'node:fs';
import path from 'node:path';
import { shareJoinInterest, shareResults } from '../../share/index.mjs';
import { logShareResult } from '../context.mjs';
import { ask, isYes, openPrompt } from '../prompt.mjs';
import { writeReport } from './report.mjs';

export async function join(ctx) {
  const { log, reports, shareTo } = ctx;
  log('Join the Tiny Footprint industry-wide validation initiative');
  log(`Results share address: ${shareTo}`);
  const rl = openPrompt();
  try {
    const name = await ask(rl, 'Your name');
    const email = await ask(rl, 'Work email');
    const org = await ask(rl, 'Organization');
    const role = await ask(rl, 'Role', 'Infrastructure / MLOps');
    const hardware = await ask(rl, 'Hardware interest', 'local GPU / HBM cluster');
    const notes = await ask(rl, 'Notes (optional)', '');
    const share = isYes(await ask(rl, 'Share your latest benchmark results, with this machine\'s hostname, platform and Node version, with the validation desk? (y/N)', 'N'));

    const joinPath = path.join(reports, 'validation-join.json');
    fs.mkdirSync(reports, { recursive: true });
    const record = {
      product: 'Tiny Footprint Validation Initiative',
      at: new Date().toISOString(),
      name,
      email,
      org,
      role,
      hardware,
      notes,
      shareResults: share,
      shareTo,
    };
    fs.writeFileSync(joinPath, JSON.stringify(record, null, 2), { encoding: 'utf8', mode: 0o600 });
    log(`saved ${joinPath}`);

    if (share) {
      // Receipts are read only after explicit consent.
      writeReport(ctx);
      const result = shareResults({ name, email, org, role, notes: `${notes}\nHardware: ${hardware}`, openMail: true }, { reportsDir: reports });
      logShareResult(log, result, 'Results share');
      log(`Packet on disk: ${result.jsonPath}`);
    } else {
      // Contact-only message; shareJoinInterest never reads benchmark receipts.
      const result = shareJoinInterest({ name, email, org, role, hardware, notes, openMail: true });
      logShareResult(log, result, 'Join interest');
      log('No benchmark receipts were read or attached.');
    }
    return 0;
  } finally {
    rl.close();
  }
}
