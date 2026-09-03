import "server-only";

/**
 * Persists admin stock edits by committing lib/stock.json straight to the
 * main branch on GitHub — Vercel is already wired to redeploy on every push
 * to this repo, so saving in the admin panel ships the same way any other
 * content change does, just from a form instead of an editor. Changes are
 * live roughly as long as a normal deploy takes, not instantly.
 *
 * Needs GITHUB_TOKEN: a fine-grained personal access token scoped to just
 * this repo, with Contents: Read and write permission.
 */

const OWNER = "mattpop52";
const REPO = "secret-source";
const FILE_PATH = "lib/stock.json";
const BRANCH = "main";

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function githubFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GitHub is not configured.");
  }

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
}

export async function commitStockOverrides(
  overrides: Record<string, Record<string, boolean>>,
): Promise<void> {
  const getResponse = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
  );

  if (!getResponse.ok) {
    throw new Error("Could not read the current stock file from GitHub.");
  }

  const current = (await getResponse.json()) as { sha: string };
  const content = `${JSON.stringify(overrides, null, 2)}\n`;

  const putResponse = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update stock from the admin panel",
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: current.sha,
        branch: BRANCH,
      }),
    },
  );

  if (!putResponse.ok) {
    const data = (await putResponse.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message ?? "Could not save stock changes to GitHub.");
  }
}
