import { NextResponse } from "next/server";
import { z } from "zod";
import { commitJsonFile, isGithubConfigured } from "@/lib/admin/github-content";

const saveSchema = z.object({
  overrides: z.record(z.string(), z.record(z.string(), z.boolean())),
  prices: z.record(z.string(), z.number().int().positive()),
});

export async function POST(request: Request) {
  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: "GitHub isn't configured yet — add GITHUB_TOKEN in Vercel." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stock data." }, { status: 400 });
  }

  try {
    await commitJsonFile(
      "lib/stock.json",
      parsed.data.overrides,
      "Update stock from the admin panel",
    );
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

  try {
    await commitJsonFile(
      "lib/prices.json",
      parsed.data.prices,
      "Update prices from the admin panel",
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Stock saved, but prices didn't — ${error instanceof Error ? error.message : "try saving again."}`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
