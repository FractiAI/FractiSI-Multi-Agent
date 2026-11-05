/** Write the HTML report and, only on request, share it. */
import { writeCustomerReport } from '../../reporting/customer-report.mjs';
import { shareResults } from '../../share/index.mjs';
import { logShareResult } from '../context.mjs';

export function writeReport(ctx) {
  const out = writeCustomerReport({ reportsDir: ctx.reports, config: ctx.config });
  ctx.log(`wrote ${out}`);
  return out;
}

export function report(ctx) {
  writeReport(ctx);
  if (ctx.flag('--share') || ctx.flag('-s')) {
    ctx.log(`share selected → preparing packet for ${ctx.shareTo}`);
    const result = shareResults(
      {
        name: process.env.TINY_FOOTPRINT_PARTICIPANT_NAME || '',
        email: process.env.TINY_FOOTPRINT_PARTICIPANT_EMAIL || '',
        org: process.env.TINY_FOOTPRINT_PARTICIPANT_ORG || '',
        openMail: true,
      },
      { reportsDir: ctx.reports },
    );
    logShareResult(ctx.log, result, 'Share');
  } else {
    ctx.log(`Tip: add --share to email results to the validation desk (${ctx.shareTo})`);
  }
  return 0;
}
