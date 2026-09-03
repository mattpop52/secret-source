import { NextResponse } from "next/server";
import { z } from "zod";
import {
  commitStockOverrides,
  isGithubConfigured,
} from "@/lib/admin/github-stock";

const stockSchema = z.object({
  overrides: z.record(z.string(), z.record(z.string(), z.boolean())),
});

export async function POST(request: Request) {
  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: "GitHub isn't configured yet — add GITHUB_TOKEN in Vercel." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = stockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stock data." }, { status: 400 });
  }

  try {
    await commitStockOverrides(parsed.data.overrides);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save stock changes.",
      },
      { status: 502 },
    );
  }
}
