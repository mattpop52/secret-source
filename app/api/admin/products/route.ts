import { NextResponse } from "next/server";
import {
  appendToJsonArray,
  commitBinaryFile,
  isGithubConfigured,
} from "@/lib/admin/github-content";
import {
  brandCode,
  defaultShapeForCategory,
  generateCopy,
  sizesForCategory,
} from "@/lib/admin/product-templates";
import { BRANDS, CATEGORIES, PRODUCTS } from "@/lib/catalog";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** One global sequence across the whole catalogue, matching the existing
 *  docket numbers (SS-TNF-0001, SS-FOG-0002, …) rather than one per brand. */
function nextCode(brandSlug: string): string {
  let max = 0;

  for (const product of PRODUCTS) {
    const match = product.code.match(/-(\d+)$/);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }

  return `SS-${brandCode(brandSlug)}-${String(max + 1).padStart(4, "0")}`;
}

function uniqueSlug(base: string): string {
  const existing = new Set(PRODUCTS.map((p) => p.slug));
  let candidate = base;
  let suffix = 2;

  while (existing.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function extensionFor(file: File): string {
  const type = file.type.split("/")[1] ?? "jpg";
  return type === "jpeg" ? "jpg" : type;
}

export async function POST(request: Request) {
  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: "GitHub isn't configured yet — add GITHUB_TOKEN in Vercel." },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);

  if (!form) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const category = String(form.get("category") ?? "");
  const brandSlug = String(form.get("brand") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const colourwayName = String(form.get("colourwayName") ?? "").trim();
  const fill = String(form.get("fill") ?? "#B7B7B4");
  const accent = String(form.get("accent") ?? "#141414");
  const priceCents = Math.round(
    Number.parseFloat(String(form.get("price") ?? "")) * 100,
  );
  const sizeLabel = String(form.get("sizeLabel") ?? "One size").trim();
  const frontImage = form.get("frontImage");
  const backImage = form.get("backImage");

  const brand = BRANDS.find((b) => b.slug === brandSlug);

  if (!CATEGORIES.some((c) => c.slug === category)) {
    return NextResponse.json({ error: "Pick a category." }, { status: 400 });
  }

  if (!brand) {
    return NextResponse.json({ error: "Pick a brand." }, { status: 400 });
  }

  if (!name || !colourwayName) {
    return NextResponse.json(
      { error: "Name and colourway are both required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    return NextResponse.json(
      { error: "Enter a valid price." },
      { status: 400 },
    );
  }

  if (!(frontImage instanceof File) || frontImage.size === 0) {
    return NextResponse.json(
      { error: "A front photo is required." },
      { status: 400 },
    );
  }

  const hasBackImage = backImage instanceof File && backImage.size > 0;

  if (
    frontImage.size > MAX_IMAGE_BYTES ||
    (hasBackImage && (backImage as File).size > MAX_IMAGE_BYTES)
  ) {
    return NextResponse.json(
      { error: "Photos must be under 8MB each." },
      { status: 400 },
    );
  }

  const slug = uniqueSlug(slugify(`${brandSlug}-${name}-${colourwayName}`));
  const frontExt = extensionFor(frontImage);
  const frontBuffer = Buffer.from(await frontImage.arrayBuffer());

  let backExt = "";
  let backBuffer: Buffer | null = null;

  if (hasBackImage) {
    backExt = extensionFor(backImage as File);
    backBuffer = Buffer.from(await (backImage as File).arrayBuffer());
  }

  try {
    await commitBinaryFile(
      `public/products/${slug}.${frontExt}`,
      frontBuffer,
      `Add photo for ${slug}`,
    );

    if (backBuffer) {
      await commitBinaryFile(
        `public/products/${slug}-back.${backExt}`,
        backBuffer,
        `Add back photo for ${slug}`,
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not upload photos.",
      },
      { status: 502 },
    );
  }

  const { blurb, details } = generateCopy(
    category,
    brand.name,
    name,
    colourwayName,
  );

  const product = {
    slug,
    name,
    category,
    brand: brandSlug,
    shape: defaultShapeForCategory(category),
    colourway: { name: colourwayName, fill, accent },
    priceCents,
    sizes: sizesForCategory(category, sizeLabel),
    code: nextCode(brandSlug),
    blurb,
    details,
    image: `/products/${slug}.${frontExt}`,
    ...(backBuffer ? { imageBack: `/products/${slug}-back.${backExt}` } : {}),
    badge: "just-in" as const,
  };

  try {
    await appendToJsonArray(
      "lib/new-products.json",
      product,
      `Add ${brand.name} ${name} (${colourwayName}) via the admin panel`,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Photos uploaded, but the product listing didn't save — ${error.message}`
            : "Could not save the new product.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, slug });
}
