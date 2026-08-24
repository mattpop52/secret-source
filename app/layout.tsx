import type { Metadata, Viewport } from "next";
import { Archivo, Barlow_Condensed, Lilita_One } from "next/font/google";
import { Toaster } from "sonner";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRANDS } from "@/lib/catalog";
import { SHOP_NAME, SHOP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const META_BRAND_LIST = `${BRANDS.slice(0, 3)
  .map((brand) => brand.name)
  .join(", ")} and ${BRANDS.length - 3} more brands`;
import "./shop.css";

/*
 * The logo's lettering is a bubbled graffiti hand; Lilita One is the closest
 * face that ships as a webfont, so headlines read as the same hand as the
 * badge. Barlow Condensed does the stencil work — labels, sizes, prices,
 * buttons — the way a shipping crate is stamped. Archivo carries paragraphs
 * and nothing else.
 */
const displayFont = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ss-display",
  display: "swap",
});

const stencilFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-ss-stencil",
  display: "swap",
});

const bodyFont = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ss-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SHOP_NAME} — ${SHOP_TAGLINE}`,
    template: `%s — ${SHOP_NAME}`,
  },
  description: `${META_BRAND_LIST}, held in hand and checked before it ships. Tracked worldwide delivery, 14-day returns.`,
  icons: {
    icon: "/brand/logo-badge-256.png",
    apple: "/brand/logo-badge-256.png",
  },
  openGraph: {
    title: `${SHOP_NAME} — ${SHOP_TAGLINE}`,
    description: `The plug's shelf: ${META_BRAND_LIST}. Checked, boxed, tracked.`,
    images: ["/brand/logo-badge.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

const DIRECTION_CONTRACT = `<!--
SECRET SOURCE — DIRECTION CONTRACT
THESIS: a resale plug's shelf, presented as a checked shipment. Refuses the white Shopify grid the category defaults to.
OWN-WORLD: pitch black ground, hazard-orange tape, bone lettering. Bubbled graffiti display off the logo, condensed stencil for every label, square corners, hard offset shadows, no soft gradients.
STORY: this is a real person's stock, in hand, checked, and it ships this week — so buy the size before it goes.
FIRST VIEWPORT: taped announcement strip, logo-left header, then a full-height black hero with the shop's promise set at crate scale, the week's featured drop pinned right, and one orange action.
FORM: brand-led storefront (home / collection / product / basket), pinned by the brief to the reference shop's structure.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

/*
 * Runs before first paint: a visitor who has already been through the
 * landing card this session should never see it flash up again, and the
 * page must not be scroll-locked for them either.
 */
const SPLASH_SCRIPT = `(function(){
  try {
    var d = document.documentElement;
    d.classList.remove("no-js");
    if (sessionStorage.getItem("ss-splash-v1") === "1" || location.pathname !== "/") {
      d.setAttribute("data-splash", "skip");
    }
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="no-js" lang="en-GB">
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: must run before first paint to avoid a flash of the landing card
          dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }}
        />
      </head>
      <body
        className={`${displayFont.variable} ${stencilFont.variable} ${bodyFont.variable} min-h-dvh bg-[var(--ss-black)] text-[var(--ss-bone)]`}
        data-ss-root=""
      >
        <div
          aria-hidden="true"
          className="hidden"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: emits the design direction contract as an auditable HTML comment
          dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
        />

        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <AnnouncementBar />
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
              <CartDrawer />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>

        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
