/**
 * Chrome translations — header, footer, basket, checkout flow and category
 * names. Scope is deliberately bounded: see the doc comment on
 * `lib/i18n.ts` for why product copy (blurbs, details) stays English-only.
 */

import type { LanguageCode } from "./i18n";

export type TranslationKey =
  | "openMenu"
  | "basket"
  | "everything"
  | "everythingInStock"
  | "theShelf"
  | "help"
  | "delivery"
  | "returns"
  | "sizing"
  | "contact"
  | "straightToThePlug"
  | "afterSomething"
  | "footerBlurb"
  | "copyright"
  | "paymentMethods"
  | "regionLanguage"
  | "regionLanguageBlurb"
  | "currency"
  | "language"
  | "close"
  | "nothingHereYet"
  | "everythingOneOfOne"
  | "shopTheShelf"
  | "remove"
  | "subtotal"
  | "freeDeliveryUnlocked"
  | "moreForFreeDelivery"
  | "checkout"
  | "openingCheckout"
  | "viewFullBasket"
  | "loadingBasket"
  | "shelfMovesFast"
  | "orderSummary"
  | "trackedDelivery"
  | "free"
  | "total"
  | "moreUnlocksFreeDelivery"
  | "checkoutSecurely"
  | "paymentNote"
  | "keepShopping"
  | "oneSize"
  | "size"
  | "sizingHelp"
  | "pickASizeFirst"
  | "soldOut"
  | "thisOnesGone"
  | "lineTotal"
  | "addToBasket"
  | "buyItNow"
  | "badgeJustIn"
  | "badgeRestock"
  | "badgeLastPair"
  | "soldOutRestockListed"
  | "noticeChecked"
  | "noticeWorldwideDelivery"
  | "noticeFreeDeliveryOver"
  | "noticeReturns";

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  openMenu: "Open menu",
  basket: "Basket",
  everything: "Everything",
  everythingInStock: "Everything in stock",
  theShelf: "The shelf",
  help: "Help",
  delivery: "Delivery",
  returns: "Returns",
  sizing: "Sizing",
  contact: "Contact",
  straightToThePlug: "Straight to the plug",
  afterSomething:
    "After something that isn't on the shelf? Ask — most of it can be sourced within a week.",
  footerBlurb:
    "One plug, checked stock, no waiting list. Everything on the shelf is in hand in the UK and ships tracked worldwide.",
  copyright:
    "© {year} Secret Source. Tracked delivery in {window}. {returns} returns.",
  paymentMethods: "PayPal · Cards — secured by PayPal",
  regionLanguage: "Region & language",
  regionLanguageBlurb: "Prices convert live. The shop's own text follows suit.",
  currency: "Currency",
  language: "Language",
  close: "Close",
  nothingHereYet: "Nothing in here yet",
  everythingOneOfOne:
    "Everything in the shop is one of one on the shelf. When it's gone, it's gone.",
  shopTheShelf: "Shop the shelf",
  remove: "Remove",
  subtotal: "Subtotal",
  freeDeliveryUnlocked: "Free tracked delivery unlocked.",
  moreForFreeDelivery:
    "{amount} more for free tracked delivery — otherwise {shipping}.",
  checkout: "Checkout",
  openingCheckout: "Opening checkout…",
  viewFullBasket: "View full basket",
  loadingBasket: "Loading your basket…",
  shelfMovesFast: "The shelf moves fast — what's listed is in hand today.",
  orderSummary: "Order summary",
  trackedDelivery: "Tracked delivery",
  free: "Free",
  total: "Total",
  moreUnlocksFreeDelivery: "{amount} more unlocks free tracked delivery.",
  checkoutSecurely: "Checkout securely",
  paymentNote:
    "PayPal or card, handled by PayPal. Packed same day, with you in {window}. {returns} to send it back.",
  keepShopping: "Keep shopping",
  oneSize: "One size",
  size: "Size",
  sizingHelp: "Sizing help",
  pickASizeFirst: "Pick a size first",
  soldOut: "Sold out",
  thisOnesGone:
    "This one's gone. Message the shop and you'll be told the moment the size lands again.",
  lineTotal: "{price} total",
  addToBasket: "Add to basket",
  buyItNow: "Buy it now",
  badgeJustIn: "Just in",
  badgeRestock: "Restocked",
  badgeLastPair: "Last one",
  soldOutRestockListed: "Sold out — restock listed",
  noticeChecked: "Checked in-house before it ships",
  noticeWorldwideDelivery: "Tracked worldwide delivery",
  noticeFreeDeliveryOver: "Free delivery over {amount}",
  noticeReturns: "{returns} returns",
};

const fr: Dictionary = {
  openMenu: "Ouvrir le menu",
  basket: "Panier",
  everything: "Tout",
  everythingInStock: "Tout le stock",
  theShelf: "Le rayon",
  help: "Aide",
  delivery: "Livraison",
  returns: "Retours",
  sizing: "Tailles",
  contact: "Contact",
  straightToThePlug: "Une pièce en tête ?",
  afterSomething:
    "Vous cherchez une pièce qui n'est pas en rayon ? Demandez — la plupart peuvent être trouvées sous une semaine.",
  footerBlurb:
    "Un seul plug, un stock contrôlé, pas de liste d'attente. Tout ce qui est en rayon est en main au Royaume-Uni et expédié partout dans le monde, suivi.",
  copyright:
    "© {year} Secret Source. Livraison suivie en {window}. Retours sous {returns}.",
  paymentMethods: "PayPal · Cartes — sécurisé par PayPal",
  regionLanguage: "Région et langue",
  regionLanguageBlurb:
    "Les prix se convertissent en direct. Le texte du site suit.",
  currency: "Devise",
  language: "Langue",
  close: "Fermer",
  nothingHereYet: "Rien ici pour l'instant",
  everythingOneOfOne:
    "Chaque pièce du magasin est unique et en rayon. Une fois partie, elle est partie.",
  shopTheShelf: "Voir le rayon",
  remove: "Retirer",
  subtotal: "Sous-total",
  freeDeliveryUnlocked: "Livraison suivie gratuite débloquée.",
  moreForFreeDelivery:
    "Encore {amount} pour la livraison suivie gratuite — sinon {shipping}.",
  checkout: "Commander",
  openingCheckout: "Ouverture du paiement…",
  viewFullBasket: "Voir le panier complet",
  loadingBasket: "Chargement de votre panier…",
  shelfMovesFast:
    "Le rayon bouge vite — ce qui est listé est en main aujourd'hui.",
  orderSummary: "Récapitulatif",
  trackedDelivery: "Livraison suivie",
  free: "Gratuite",
  total: "Total",
  moreUnlocksFreeDelivery:
    "Encore {amount} débloque la livraison suivie gratuite.",
  checkoutSecurely: "Paiement sécurisé",
  paymentNote:
    "PayPal ou carte, gérés par PayPal. Emballé le jour même, chez vous en {window}. {returns} pour le retourner.",
  keepShopping: "Continuer mes achats",
  oneSize: "Taille unique",
  size: "Taille",
  sizingHelp: "Aide aux tailles",
  pickASizeFirst: "Choisissez d'abord une taille",
  soldOut: "Épuisé",
  thisOnesGone:
    "Cette pièce est partie. Écrivez à la boutique et vous serez prévenu dès qu'elle revient.",
  lineTotal: "{price} au total",
  addToBasket: "Ajouter au panier",
  buyItNow: "Acheter maintenant",
  badgeJustIn: "Nouveauté",
  badgeRestock: "Réapprovisionné",
  badgeLastPair: "Dernière pièce",
  soldOutRestockListed: "Épuisé — réassort à venir",
  noticeChecked: "Contrôlé en interne avant expédition",
  noticeWorldwideDelivery: "Livraison suivie partout dans le monde",
  noticeFreeDeliveryOver: "Livraison gratuite dès {amount}",
  noticeReturns: "Retours sous {returns}",
};

const es: Dictionary = {
  openMenu: "Abrir menú",
  basket: "Cesta",
  everything: "Todo",
  everythingInStock: "Todo el stock",
  theShelf: "El estante",
  help: "Ayuda",
  delivery: "Envío",
  returns: "Devoluciones",
  sizing: "Tallas",
  contact: "Contacto",
  straightToThePlug: "¿Buscas algo en concreto?",
  afterSomething:
    "¿Buscas algo que no está en el estante? Pregunta — la mayoría se puede conseguir en una semana.",
  footerBlurb:
    "Un solo proveedor, stock revisado, sin listas de espera. Todo lo que hay en el estante está en mano en el Reino Unido y se envía con seguimiento a cualquier parte del mundo.",
  copyright:
    "© {year} Secret Source. Envío con seguimiento en {window}. Devoluciones en {returns}.",
  paymentMethods: "PayPal · Tarjetas — protegido por PayPal",
  regionLanguage: "Región e idioma",
  regionLanguageBlurb:
    "Los precios se convierten al momento. El texto de la tienda también cambia.",
  currency: "Moneda",
  language: "Idioma",
  close: "Cerrar",
  nothingHereYet: "Aún no hay nada aquí",
  everythingOneOfOne:
    "Todo en la tienda es una sola unidad en el estante. Cuando se agota, se agota.",
  shopTheShelf: "Ver el estante",
  remove: "Quitar",
  subtotal: "Subtotal",
  freeDeliveryUnlocked: "Envío con seguimiento gratis desbloqueado.",
  moreForFreeDelivery:
    "{amount} más para el envío con seguimiento gratis — si no, {shipping}.",
  checkout: "Pagar",
  openingCheckout: "Abriendo el pago…",
  viewFullBasket: "Ver cesta completa",
  loadingBasket: "Cargando tu cesta…",
  shelfMovesFast: "El estante se mueve rápido — lo listado está en mano hoy.",
  orderSummary: "Resumen del pedido",
  trackedDelivery: "Envío con seguimiento",
  free: "Gratis",
  total: "Total",
  moreUnlocksFreeDelivery:
    "{amount} más desbloquea el envío con seguimiento gratis.",
  checkoutSecurely: "Pagar de forma segura",
  paymentNote:
    "PayPal o tarjeta, gestionados por PayPal. Empaquetado el mismo día, contigo en {window}. {returns} para devolverlo.",
  keepShopping: "Seguir comprando",
  oneSize: "Talla única",
  size: "Talla",
  sizingHelp: "Ayuda con tallas",
  pickASizeFirst: "Elige una talla primero",
  soldOut: "Agotado",
  thisOnesGone:
    "Esta pieza ya no está. Escribe a la tienda y te avisarán en cuanto vuelva.",
  lineTotal: "{price} en total",
  addToBasket: "Añadir a la cesta",
  buyItNow: "Comprar ahora",
  badgeJustIn: "Recién llegado",
  badgeRestock: "Reposición",
  badgeLastPair: "Última unidad",
  soldOutRestockListed: "Agotado — reposición prevista",
  noticeChecked: "Revisado internamente antes de enviarlo",
  noticeWorldwideDelivery: "Envío con seguimiento a cualquier parte del mundo",
  noticeFreeDeliveryOver: "Envío gratis a partir de {amount}",
  noticeReturns: "Devoluciones en {returns}",
};

const de: Dictionary = {
  openMenu: "Menü öffnen",
  basket: "Warenkorb",
  everything: "Alles",
  everythingInStock: "Gesamter Bestand",
  theShelf: "Das Regal",
  help: "Hilfe",
  delivery: "Versand",
  returns: "Rückgabe",
  sizing: "Größen",
  contact: "Kontakt",
  straightToThePlug: "Etwas Bestimmtes gesucht?",
  afterSomething:
    "Suchst du etwas, das nicht im Regal steht? Frag einfach — das meiste lässt sich innerhalb einer Woche besorgen.",
  footerBlurb:
    "Ein Anbieter, geprüfter Bestand, keine Warteliste. Alles im Regal ist im Vereinigten Königreich vorrätig und wird weltweit verfolgt versandt.",
  copyright:
    "© {year} Secret Source. Versand mit Sendungsverfolgung in {window}. {returns} Rückgaberecht.",
  paymentMethods: "PayPal · Karten — abgesichert von PayPal",
  regionLanguage: "Region & Sprache",
  regionLanguageBlurb:
    "Preise werden live umgerechnet. Der Text der Seite folgt.",
  currency: "Währung",
  language: "Sprache",
  close: "Schließen",
  nothingHereYet: "Hier ist noch nichts",
  everythingOneOfOne:
    "Jedes Stück im Shop gibt es nur einmal im Regal. Wenn es weg ist, ist es weg.",
  shopTheShelf: "Zum Regal",
  remove: "Entfernen",
  subtotal: "Zwischensumme",
  freeDeliveryUnlocked:
    "Kostenloser Versand mit Sendungsverfolgung freigeschaltet.",
  moreForFreeDelivery:
    "Noch {amount} bis zum kostenlosen Versand mit Sendungsverfolgung — sonst {shipping}.",
  checkout: "Zur Kasse",
  openingCheckout: "Kasse wird geöffnet…",
  viewFullBasket: "Ganzen Warenkorb ansehen",
  loadingBasket: "Warenkorb wird geladen…",
  shelfMovesFast:
    "Das Regal bewegt sich schnell — was gelistet ist, ist heute vorrätig.",
  orderSummary: "Bestellübersicht",
  trackedDelivery: "Versand mit Sendungsverfolgung",
  free: "Kostenlos",
  total: "Gesamt",
  moreUnlocksFreeDelivery: "Noch {amount} schaltet kostenlosen Versand frei.",
  checkoutSecurely: "Sicher zur Kasse",
  paymentNote:
    "PayPal oder Karte, abgewickelt über PayPal. Am selben Tag verpackt, bei dir in {window}. {returns} zum Zurücksenden.",
  keepShopping: "Weiter einkaufen",
  oneSize: "Einheitsgröße",
  size: "Größe",
  sizingHelp: "Hilfe bei Größen",
  pickASizeFirst: "Wähle zuerst eine Größe",
  soldOut: "Ausverkauft",
  thisOnesGone:
    "Dieses Stück ist weg. Schreib dem Shop und du erfährst sofort, wenn die Größe wieder da ist.",
  lineTotal: "{price} gesamt",
  addToBasket: "In den Warenkorb",
  buyItNow: "Jetzt kaufen",
  badgeJustIn: "Neu eingetroffen",
  badgeRestock: "Wieder da",
  badgeLastPair: "Letztes Stück",
  soldOutRestockListed: "Ausverkauft — Nachschub gelistet",
  noticeChecked: "Intern geprüft vor dem Versand",
  noticeWorldwideDelivery: "Versand mit Sendungsverfolgung weltweit",
  noticeFreeDeliveryOver: "Kostenloser Versand ab {amount}",
  noticeReturns: "{returns} Rückgaberecht",
};

const DICTIONARIES: Record<LanguageCode, Dictionary> = { en, fr, es, de };

/** GBP pence figures and other numbers are always interpolated in, already
 *  formatted in the shopper's chosen currency — this only translates the
 *  surrounding sentence. */
export function t(
  language: LanguageCode,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[language][key];

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

/** Category names shown in nav, footer and breadcrumbs, keyed by slug. */
export const CATEGORY_NAMES: Record<LanguageCode, Record<string, string>> = {
  en: {
    tracksuits: "Tracksuits",
    jumpers: "Jumpers",
    "short-sets": "Short Sets",
    coats: "Coats",
    shoes: "Shoes",
    bags: "Bags",
    "t-shirts": "T-Shirts",
    jeans: "Jeans",
    hats: "Hats",
  },
  fr: {
    tracksuits: "Survêtements",
    jumpers: "Pulls",
    "short-sets": "Ensembles Short",
    coats: "Manteaux",
    shoes: "Chaussures",
    bags: "Sacs",
    "t-shirts": "T-Shirts",
    jeans: "Jeans",
    hats: "Casquettes",
  },
  es: {
    tracksuits: "Chándales",
    jumpers: "Jerséis",
    "short-sets": "Conjuntos Cortos",
    coats: "Abrigos",
    shoes: "Zapatillas",
    bags: "Bolsos",
    "t-shirts": "Camisetas",
    jeans: "Vaqueros",
    hats: "Gorras",
  },
  de: {
    tracksuits: "Trainingsanzüge",
    jumpers: "Pullover",
    "short-sets": "Short-Sets",
    coats: "Mäntel",
    shoes: "Schuhe",
    bags: "Taschen",
    "t-shirts": "T-Shirts",
    jeans: "Jeans",
    hats: "Mützen",
  },
};

/** Named apart from `lib/catalog`'s own `getCategoryName` (English source
 *  data) so both can be imported into the same file without collision. */
export function translateCategoryName(
  language: LanguageCode,
  slug: string,
  fallback: string,
): string {
  return CATEGORY_NAMES[language][slug] ?? fallback;
}
