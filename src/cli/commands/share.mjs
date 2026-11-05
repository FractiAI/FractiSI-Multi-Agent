/** Send the latest results to the validation desk, after confirmation. */
import { shareResults } from '../../share/index.mjs';
import { logShareResult } from '../context.mjs';
import { ask, isYes, openPrompt } from '../prompt.mjs';
import { writeReport } from './report.mjs';

export async function share(ctx) {
  const { log, shareTo } = ctx;
  log(`share · opt-in send to ${shareTo}`);
  const rl = ctx.flag('--yes') || ctx.flag('-y') ? null : openPrompt();
  try {
    let meta = {
      name: process.env.TINY_FOOTPRINT_PARTICIPANT_NAME || '',
      email: process.env.TINY_FOOTPRINT_PARTICIPANT_EMAIL || '',
      org: process.env.TINY_FOOTPRINT_PARTICIPANT_ORG || '',
    };
    if (rl) {
      if (!isYes(await ask(rl, `Email latest results, with this machine's hostname, platform and Node version, to ${shareTo}? (y/N)`, 'N'))) {
        log('Share cancelled — nothing sent.');
        return 0;
      }
      meta = {
        name: await ask(rl, 'Your name', meta.name),
        email: await ask(rl, 'Your email', meta.email),
        org: await ask(rl, 'Organization', meta.org),
      };
    }
    writeReport(ctx);
    const result = shareResults({ ...meta, openMail: true }, { reportsDir: ctx.reports });
    logShareResult(log, result, 'Share');
    log(`Packet on disk: ${result.jsonPath}`);
    return 0;
  } finally {
    rl?.close();
  }
}
