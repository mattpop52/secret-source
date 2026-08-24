/**
 * Language switching for the shop's own chrome — header, footer, basket and
 * checkout flow, plus the category names used throughout. This does not
 * translate product copy (blurbs, details, docket notes): 133 products'
 * worth of garment-construction language, machine-translated, risks getting
 * a material or a claim wrong in a way a shopper could reasonably rely on.
 * That copy stays in English; everything a shopper needs to browse, size,
 * and pay in their own language is covered here.
 */

export type LanguageCode = "en" | "fr" | "es" | "de";

export type Language = {
  code: LanguageCode;
  /** Shown in its own language, in the picker. */
  label: string;
  locale: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", locale: "en-GB" },
  { code: "fr", label: "Français", locale: "fr-FR" },
  { code: "es", label: "Español", locale: "es-ES" },
  { code: "de", label: "Deutsch", locale: "de-DE" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}
