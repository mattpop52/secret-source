"use client";

import { useLanguage } from "./language-provider";

/** Translated category name, falling back to the English source data for
 *  any slug the dictionary hasn't got (there shouldn't be one). */
export function CategoryName({
  slug,
  fallback,
}: {
  slug: string;
  fallback: string;
}) {
  const { categoryName } = useLanguage();
  return <>{categoryName(slug, fallback)}</>;
}
