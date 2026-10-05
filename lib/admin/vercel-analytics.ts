import "server-only";

/**
 * Reads traffic numbers for the admin analytics page from Vercel's Web
 * Analytics API — the same data the `<Analytics />` component (see
 * app/layout.tsx) is collecting on every page view.
 *
 * Two things have to be true for this to return real numbers:
 *  1. Web Analytics is turned on for this project (Vercel dashboard →
 *     secret-source → Analytics tab → Enable — free, one click).
 *  2. VERCEL_API_TOKEN is set: a personal access token from
 *     vercel.com/account/tokens (read-only is enough) added as an env var
 *     on this project.
 * Until both are true, every call below throws and the page falls back to
 * a plain setup notice instead of a broken dashboard.
 */

const PROJECT_ID = "prj_ItgS8t8NdFYxfixyYIjkd7JYMPyp";
const TEAM_ID = "team_1kpOouijGRVLeYcY7Gdf2vl7";

export function isVercelAnalyticsConfigured(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN);
}

async function analyticsFetch(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  const token = process.env.VERCEL_API_TOKEN;

  if (!token) {
    throw new Error("Vercel analytics is not configured.");
  }

  const query = new URLSearchParams({
    projectId: PROJECT_ID,
    teamId: TEAM_ID,
    ...params,
  });

  const response = await fetch(
    `https://api.vercel.com/v1/query/web-analytics/${path}?${query}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(
      `[admin/analytics] ${path} failed: ${response.status} ${body}`,
    );
    throw new Error(`Vercel analytics request failed (${response.status}).`);
  }

  return response.json();
}

export type DayCount = { date: string; count: number };
export type PathCount = { path: string; count: number };

export type AnalyticsSummary = {
  today: number;
  last7Days: number;
  last30Days: number;
  byDay: DayCount[];
  topPaths: PathCount[];
};

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
  // The /visits/count endpoint snaps `until` down to day granularity, so
  // "now" on the same day as `since` collapses to a zero-width window and
  // silently returns 0. Use the start of tomorrow instead, which always
  // covers all of today regardless of what time it is.
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  const [today, last7Days, last30Days, byDayRaw, topPathsRaw] =
    await Promise.all([
      analyticsFetch("visits/count", {
        since: todayStart.toISOString(),
        until: tomorrowStart.toISOString(),
      }),
      analyticsFetch("visits/count", {
        since: sevenDaysAgo.toISOString(),
        until: tomorrowStart.toISOString(),
      }),
      analyticsFetch("visits/count", {
        since: thirtyDaysAgo.toISOString(),
        until: tomorrowStart.toISOString(),
      }),
      analyticsFetch("visits/aggregate", {
        by: "day",
        since: thirtyDaysAgo.toISOString(),
        until: now.toISOString(),
      }),
      analyticsFetch("visits/aggregate", {
        by: "requestPath",
        since: thirtyDaysAgo.toISOString(),
        until: now.toISOString(),
        limit: "5",
      }),
    ]);

  return {
    today: extractCount(today),
    last7Days: extractCount(last7Days),
    last30Days: extractCount(last30Days),
    byDay: extractByDay(byDayRaw),
    topPaths: extractTopPaths(topPathsRaw),
  };
}

function extractCount(payload: unknown): number {
  const data = (payload as { data?: { pageviews?: number } })?.data;
  return typeof data?.pageviews === "number" ? data.pageviews : 0;
}

function extractByDay(payload: unknown): DayCount[] {
  const rows = (payload as { data?: unknown[] })?.data;
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => {
    const r = row as { timestamp?: string; pageviews?: number };
    return { date: r.timestamp ?? "", count: r.pageviews ?? 0 };
  });
}

function extractTopPaths(payload: unknown): PathCount[] {
  const rows = (payload as { data?: unknown[] })?.data;
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => {
    const r = row as { requestPath?: string; pageviews?: number };
    return { path: r.requestPath ?? "(unknown)", count: r.pageviews ?? 0 };
  });
}
