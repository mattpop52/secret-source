import "server-only";

/**
 * Persists admin edits by committing a JSON file straight to the main
 * branch on GitHub — Vercel is already wired to redeploy on every push to
 * this repo, so saving in the admin panel ships the same way any other
 * content change does, just from a form instead of an editor. Changes are
 * live roughly as long as a normal deploy takes, not instantly.
 *
 * Needs GITHUB_TOKEN: a fine-grained personal access token scoped to just
 * this repo, with Contents: Read and write permission.
 */

const OWNER = "mattpop52";
const REPO = "secret-source";
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

/** Overwrites `filePath` on the main branch with `data` and commits it. */
export async function commitJsonFile(
  filePath: string,
  data: unknown,
  message: string,
): Promise<void> {
  const getResponse = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`,
  );

  if (!getResponse.ok) {
    throw new Error(`Could not read ${filePath} from GitHub.`);
  }

  const current = (await getResponse.json()) as { sha: string };
  const content = `${JSON.stringify(data, null, 2)}\n`;

  const putResponse = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: current.sha,
        branch: BRANCH,
      }),
    },
  );

  if (!putResponse.ok) {
    const errorData = (await putResponse.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      errorData?.message ?? `Could not save changes to ${filePath}.`,
    );
  }
}

/** Reads and JSON-parses `filePath` from the main branch. */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const response = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`,
  );

  if (!response.ok) {
    throw new Error(`Could not read ${filePath} from GitHub.`);
  }

  const current = (await response.json()) as { content: string };
  const decoded = Buffer.from(current.content, "base64").toString("utf-8");
  return JSON.parse(decoded) as T;
}

/** Appends `item` to the JSON array at `filePath` and commits the result. */
export async function appendToJsonArray(
  filePath: string,
  item: unknown,
  message: string,
): Promise<void> {
  const current = await readJsonFile<unknown[]>(filePath);
  await commitJsonFile(filePath, [...current, item], message);
}

/** Creates a new binary file (a product photo) at `filePath` and commits it.
 *  Only for paths that don't already exist — the Contents API rejects a PUT
 *  without a `sha` if something is already there, which is the right
 *  failure mode here rather than silently overwriting a real photo. */
export async function commitBinaryFile(
  filePath: string,
  data: Buffer,
  message: string,
): Promise<void> {
  const putResponse = await githubFetch(
    `/repos/${OWNER}/${REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: data.toString("base64"),
        branch: BRANCH,
      }),
    },
  );

  if (!putResponse.ok) {
    const errorData = (await putResponse.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(errorData?.message ?? `Could not upload ${filePath}.`);
  }
}
