/**
 * Cloud token resolution for FractiSI Deploy.
 * Only a cloud token (+ Git) is required to try the full path.
 */
export function resolveCloudToken(env = process.env) {
  const token =
    env.FRACTISI_CLOUD_TOKEN ||
    env.VERCEL_TOKEN ||
    env.CLOUD_TOKEN ||
    null;
  const provider = env.FRACTISI_CLOUD_PROVIDER || (token ? 'vercel' : null);
  return {
    ok: Boolean(token),
    token: token || null,
    provider,
    orgId: env.VERCEL_ORG_ID || env.FRACTISI_CLOUD_ORG_ID || null,
    projectId: env.VERCEL_PROJECT_ID || env.FRACTISI_CLOUD_PROJECT_ID || null,
  };
}

export function cloudPrereqMessage() {
  return 'Set FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN (Git repo + cloud token are the only required credentials).';
}
