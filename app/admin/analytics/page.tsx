import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  getAnalyticsSummary,
  isVercelAnalyticsConfigured,
} from "@/lib/admin/vercel-analytics";

export const metadata: Metadata = { title: "Analytics" };
// Always fetch fresh numbers — a static build-time snapshot of "today"'s
// traffic would just go stale the moment the deploy finishes.
export const dynamic = "force-dynamic";

const STAT_CLASS = "ss-docket px-5 py-5";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className={STAT_CLASS}>
      <p className="ss-stencil text-[0.6rem] text-[var(--ss-smoke)]">{label}</p>
      <p className="ss-num mt-2 text-3xl">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  if (!isVercelAnalyticsConfigured()) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <AdminNav active="analytics" />
        <h1 className="ss-display text-3xl">Analytics</h1>
        <p className="mt-4 max-w-prose text-[var(--ss-smoke)] text-sm leading-relaxed">
          Not wired up yet. Two things need doing in the Vercel dashboard, both
          free and one-off:
        </p>
        <ol className="mt-4 max-w-prose list-decimal space-y-2 pl-5 text-[var(--ss-smoke)] text-sm leading-relaxed">
          <li>
            Open the secret-source project → the Analytics tab → Enable Web
            Analytics.
          </li>
          <li>
            Create a token at vercel.com/account/tokens (read-only is enough),
            then add it to the project's Environment Variables as{" "}
            <code className="text-[var(--ss-bone)]">VERCEL_API_TOKEN</code>.
          </li>
        </ol>
        <p className="mt-4 max-w-prose text-[var(--ss-smoke)] text-sm leading-relaxed">
          Numbers appear here once both are done and the site's had a bit of
          traffic.
        </p>
      </div>
    );
  }

  let summary: Awaited<ReturnType<typeof getAnalyticsSummary>> | null = null;
  let loadError = false;

  try {
    summary = await getAnalyticsSummary();
  } catch {
    loadError = true;
  }

  if (!summary || loadError) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <AdminNav active="analytics" />
        <h1 className="ss-display text-3xl">Analytics</h1>
        <p className="mt-4 max-w-prose text-[var(--ss-smoke)] text-sm leading-relaxed">
          Couldn't load traffic data. Web Analytics may not be enabled for this
          project yet, or the token's wrong — check the Analytics tab in the
          Vercel dashboard.
        </p>
      </div>
    );
  }

  const maxDayCount = Math.max(1, ...summary.byDay.map((day) => day.count));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
      <AdminNav active="analytics" />
      <h1 className="ss-display text-3xl">Analytics</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Today" value={summary.today} />
        <StatTile label="Last 7 days" value={summary.last7Days} />
        <StatTile label="Last 30 days" value={summary.last30Days} />
      </div>

      {summary.byDay.length > 0 && (
        <div className="ss-docket mt-6 px-5 py-5">
          <p className="ss-stencil text-[0.6rem] text-[var(--ss-smoke)]">
            Last 30 days
          </p>
          <div className="mt-4 flex h-28 items-end gap-1">
            {summary.byDay.map((day) => (
              <div
                className="min-w-0 flex-1 bg-[var(--ss-orange)]"
                key={day.date}
                style={{
                  height: `${Math.max(4, (day.count / maxDayCount) * 100)}%`,
                }}
                title={`${day.date}: ${day.count.toLocaleString()} visits`}
              />
            ))}
          </div>
        </div>
      )}

      {summary.topPaths.length > 0 && (
        <div className="ss-docket mt-6 px-5 py-5">
          <p className="ss-stencil text-[0.6rem] text-[var(--ss-smoke)]">
            Top pages, last 30 days
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            {summary.topPaths.map((path) => (
              <div className="flex justify-between gap-4" key={path.path}>
                <span className="min-w-0 truncate text-[var(--ss-smoke)]">
                  {path.path}
                </span>
                <span className="ss-num shrink-0">
                  {path.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
