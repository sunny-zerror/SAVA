/*
 * The shopping assistant's replies: scripted, from the store's own copy and data. Keyword rules pick
 * one intent per message, checked in a fixed order. Product questions go through the site search
 * (/api/search) and the range SiteLayout already loads; orders and offers through the shopper's own
 * session. Every answer quotes copy the site already shows (the home FAQ in src/data/faqs.ts, the bag,
 * the announcement bar, the contact page), so when that copy changes, change it here too.
 *
 * getAssistantReply(text, context) is the one way in: an AI model can answer behind it later, with
 * the same reply shape, without the chat changing.
 */
import { productPickers } from "@/config/shop";
import { siteConfig } from "@/config/site";
import { faqAnswer } from "@/data/faqs";
import { productContent } from "@/data/product-content";
import type { Order, Promotion, SearchPost, SearchProduct, SearchResults, User } from "@/types";
import { formatDate, formatPrice, humanize } from "@/utils/format";

// ---------- Shapes -----------------------------------------------------------

export type AssistantIntent =
  | "leave-message"
  | "navigate"
  | "policies"
  | "returns"
  | "change-order"
  | "orders"
  | "payment"
  | "medical"
  | "sensitive-skin"
  | "ingredients"
  | "packaging"
  | "lasting"
  | "delivery"
  | "subscribe"
  | "offers"
  | "how-to-use"
  | "deodorant"
  | "price"
  | "sizes"
  | "scents"
  | "account"
  | "contact"
  | "about"
  | "range"
  | "thanks"
  | "greeting"
  | "products"
  | "fallback";

export interface ReplyLink {
  label: string;
  href: string;
}

/** An order as the chat lists it */
export interface OrderLine {
  id: string;
  title: string;
  date: string;
  status: string;
  total: string;
  href: string;
}

/** An offer as the chat lists it, with its code to copy */
export interface OfferLine {
  code: string;
  title: string;
  detail: string;
}

/** What a reply can carry under its text */
export interface ReplyExtras {
  products?: SearchProduct[];
  posts?: SearchPost[];
  orders?: OrderLine[];
  offers?: OfferLine[];
  links?: ReplyLink[];
  /** Follow-ups to tap: each sends its label */
  chips?: string[];
}

/** createContact's input, as the contact page's form sends it */
export interface ContactInput {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
}

type ContactField = "name" | "email" | "phoneNumber" | "subject" | "message";

/** "Leave a message": the step it's on, and the answers so far */
export interface ContactFlow {
  step: ContactField | "confirm";
  values: Record<ContactField, string>;
}

export type ReplyAction =
  { type: "navigate"; href: string } | { type: "open-bag" } | { type: "send-contact"; input: ContactInput };

export interface AssistantReply extends ReplyExtras {
  intent: AssistantIntent;
  text: string;
  /** The "leave a message" flow to carry on with, or null when there's none */
  contactFlow: ContactFlow | null;
  action?: ReplyAction;
}

/** The reads the replies need, supplied by the assistant (AssistantOverlay) */
export interface AssistantLoaders {
  /** The range as the search drawer starts from it: in stock, in catalogue order */
  range: SearchProduct[];
  /** The site search (/api/search): a few products and Sweat School posts */
  search: (term: string) => Promise<SearchResults>;
  /** The signed-in shopper's orders; null once there's no session */
  orders: () => Promise<Order[] | null>;
  /** The offers running now */
  offers: () => Promise<Promotion[]>;
}

export interface ReplyContext {
  /** The "leave a message" flow under way, if any */
  contactFlow?: ContactFlow | null;
  /** The signed-in shopper, or null */
  user?: User | null;
  loaders: AssistantLoaders;
}

// ---------- Copy -------------------------------------------------------------

const { email } = siteConfig.contact;

/** "1, 2 or 4": the packs every stick comes in (the product page's pack cards) */
const packs = Object.keys(productPickers.packTiers).map((choice) => Number.parseInt(choice.replace(/\D+/g, ""), 10));
const packList = packs.length > 1 ? `${packs.slice(0, -1).join(", ")} or ${packs.at(-1)}` : String(packs[0] ?? 1);

/** The directions on the product pages' at-a-glance rows */
const directions =
  Object.values(productContent)
    .flatMap((content) => content.highlights)
    .find((row) => row.icon === "apply")?.value ?? "Twist up and apply to clean, dry underarms";

export const assistantCopy = {
  welcome: "Hi, I'm the SAVA assistant. Ask me about our sticks, your scent, delivery or an order, or tap one below.",
  greeting:
    "Hi! I can help you find your scent, answer questions about SAVA, check your orders or pass a message to the team. What would you like?",
  thanks: "Happy to help! Anything else?",
  fallback:
    "I can help with our sticks and scents, delivery and returns and your orders, or pass a message to the team.",
  unsure: "I don't have an answer to that one, but the team will. Shall I pass your question on?",
  delivery:
    "Shipping and taxes are calculated at checkout, so you'll see the cost for your address before you pay. For anything about a delivery, the team replies within one working day.",
  returns: `Every order comes with 30-day returns. To start one, email ${email} with your order number, or leave a message here and I'll pass it on.`,
  changeOrder: `To change or cancel an order, email ${email} with your order number, or leave a message here and I'll pass it on.`,
  payment: "You pay securely online at checkout: the ways you can pay are shown on the payment step.",
  offersIntro: "Here's what's running now. Enter a code at checkout:",
  offersNone: "There are no offers running right now. If you have a code, you can enter it at checkout.",
  subscribe: `Subscribe & save is coming soon. Until then, every stick comes in packs of ${packList}.`,
  medical:
    "If you're pregnant, have a skin condition or are buying for a child, please check with your doctor first. Each product page lists the key ingredients, and the team can answer anything else.",
  howToUse: `${directions}.`,
  deodorant:
    "SAVA is an antiperspirant with a refined fragrance: it works in the sweat ducts where you apply it, so less sweat reaches your skin, while the scent keeps you fresh.",
  sizes: `Every SAVA stick comes in packs of ${packList}. Pick the size and pack on the product page, and the price updates as you choose.`,
  price: "Here's the range. Each stick's price depends on the size and pack you pick:",
  scents: "Every SAVA stick has the same sweat control; the scent is yours to choose. Which way do you lean?",
  range: "Here's the SAVA range, each with its own scent:",
  shopOnly: "Browse the whole range in the shop:",
  contact: `You can email the team at ${email}, use the contact page, or leave a message right here and I'll pass it on. They reply within one working day.`,
  accountGuest: "Sign in to see your orders and saved addresses, or create an account.",
  ordersGuest: "Sign in to see your orders and where they've got to.",
  ordersNone: "You haven't placed an order with this account yet.",
  ordersIntro: "Here are your latest orders:",
  openBag: "Opening your bag.",
  contactStart: "Sure, I'll pass a message to the team.",
  contactSent: "Thanks! Your message is with the team, and they'll reply within one working day.",
  contactCancelled: "No problem, I haven't sent anything.",
  contactConfirm: "Send it to the team?",
  contactConfirmHelp: "Tap Send to pass it on, Edit to change it, or Cancel.",
  contactAgain: "Let's go again.",
  networkError: "I couldn't reach the store just now. Please try again.",
};

/** The chips under the welcome message. Each must still find its answer if the rules change */
export const QUICK_ACTIONS = [
  "Shop the range",
  "Find my scent",
  "Sensitive skin",
  "Delivery & returns",
  "Track my order",
  "Talk to us",
];

/** Each finds a stick by its scent or tagline (src/data/product-content.ts): check them when the range changes */
const SCENT_CHIPS = ["Citrus", "Energising", "Fresh green", "Warm & woody"];

const SHOP_LINK: ReplyLink = { label: "Shop all", href: "/shop" };
const CONTACT_LINK: ReplyLink = { label: "Contact page", href: "/contact" };
const ORDERS_PATH = "/account?tab=orders";
const SIGN_IN_LINK: ReplyLink = { label: "Sign in", href: `/login?next=${encodeURIComponent(ORDERS_PATH)}` };

const THINKING: Partial<Record<AssistantIntent, string>> = {
  products: "Looking through the range…",
  range: "Looking through the range…",
  scents: "Looking through the range…",
  price: "Looking through the range…",
  orders: "Finding your orders…",
  offers: "Checking today's offers…",
  policies: "Checking our policies…",
  returns: "Checking our policies…",
  delivery: "Checking our policies…",
  payment: "Checking our policies…",
  "change-order": "Checking our policies…",
  deodorant: "Looking that up…",
};

/** The line shown while a reply is on its way */
export const thinkingPhrase = (intent: AssistantIntent | null) => (intent && THINKING[intent]) || "One moment…";

/** How long a reply takes to reveal (ms), by its length */
export const revealDuration = (text: string) => Math.round(Math.min(1600, Math.max(500, text.length * 14)));

// ---------- Matching ---------------------------------------------------------

/** Lower case, plain apostrophes; letters, digits, hyphens and single spaces */
const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const LEAVE_MESSAGE =
  /\b(leave (a |me a |the team a )?(message|note)|send (a |the team a )?message|message the team|write to (you|the team)|drop (a |us a )?(line|note))\b/;

const NAVIGATION = [
  // No page: the bag opens as its drawer
  { words: "bag|cart|basket|checkout|check out", label: "your bag" },
  { words: "sweat school|blogs?|journal|articles?", href: "/blogs", label: "Sweat School" },
  { words: "about(?: us| page)?|(?:your |our )?story", href: "/about", label: "our story" },
  { words: "sign ?up|register|create (?:an |my )?account", href: "/signup", label: "sign up" },
  { words: "sign ?in|log ?in|login", href: "/login", label: "sign in" },
  { words: "account|profile", href: "/account", label: "your account" },
  { words: "contact(?: page| form| us)?", href: "/contact", label: "the contact page" },
  { words: "shop|store", href: "/shop", label: "the shop" },
  { words: "home(?: ?page)?", href: "/", label: "the home page" },
].map((target) => ({
  ...target,
  // A command right before the page: "take me to the shop", "open my bag"…
  command: new RegExp(
    `\\b(?:go|open|take me|bring me|navigate|visit|show me)(?: (?:to|back|me|the|my|our|your|us)){0,3} (?:${target.words})\\b`,
  ),
  // …or the page on its own: "my bag", "sweat school"
  alone: new RegExp(`^(?:the |my )?(?:${target.words})$`),
}));

type NavigationTarget = (typeof NAVIGATION)[number];

/** Checked in order: the first that matches wins */
const RULES: [AssistantIntent, RegExp][] = [
  ["policies", /\b(delivery|shipping) (and )?returns?\b/],
  [
    "returns",
    /\b(returns?|returning|refunds?|refunded|exchanges?|exchanging|replace|replacement|damaged|broken|leak(s|ing|ed)?|defective|faulty|wrong (item|product|scent|size|order))\b/,
  ],
  ["change-order", /\b(cancel\w*|change|edit|modify|update) (my |an |the |this )?(order|address)\b/],
  [
    "orders",
    /\b(track|tracking|where'?s my|where is my|my orders?|(last|latest|recent|previous|past) orders?|order status|status of my|order history|my purchases?|(has|is|did) my (order|parcel|package)|delivered yet|shipped yet|dispatched yet)\b/,
  ],
  [
    "payment",
    /\b(payments?|pay (with|by|using|via|online|later)|how (do|can|should) i pay|upi|cash on delivery|cod|net ?banking|credit card|debit card|emi|wallet|gpay|paytm|phonepe)\b/,
  ],
  [
    "medical",
    /\b(pregnan\w*|breastfeed\w*|nursing|bab(y|ies)|kids?|child|children|cancer|medical|doctor|eczema|psoriasis|wounds?|broken skin|skin condition)\b/,
  ],
  [
    "sensitive-skin",
    /\b(sensitive|skin types?|irritat\w*|rash(es)?|itch\w*|hypoallergenic|dermatolog\w*|allerg\w*|gentle|burn(s|ing)?|sting(s|ing)?|comedogenic|shav(e|ing))\b/,
  ],
  [
    "ingredients",
    /\b(ingredients?|parabens?|alcohol|dyes?|safe|safety|chemicals?|toxins?|toxic|formula|gmp|iso|certified|certification|made of|what'?s in it)\b/,
  ],
  ["packaging", /\b(packaging|recycl\w*|eco|sustainab\w*|plastic|environment\w*|planet|waste)\b/],
  [
    "lasting",
    /\b(lasts?|lasting|long-lasting|longevity|fades?|fading|wears? off|all day|24 ?(h|hrs?|hours?)|48 ?(h|hrs?|hours?)|stay fresh|reapply)\b/,
  ],
  [
    "delivery",
    /\b(ship|ships|shipping|shipped|deliver|delivers|delivery|deliveries|dispatch|courier|how long (will|does|until|till)|when will|arrive|arrives|arrival|international(ly)?|abroad|overseas|outside india|pin ?code)\b/,
  ],
  ["subscribe", /\b(subscribe|subscription|subscriptions|auto ?ship|auto ?replenish|refill plan)\b/],
  ["offers", /\b(offers?|coupons?|discounts?|promos?|promo ?codes?|promotions?|sales?|deals?|vouchers?|codes?)\b/],
  ["how-to-use", /\b(how (do|should|to|can) i (use|apply)|how to (use|apply)|apply(ing)?|application|use it|twist)\b/],
  [
    "deodorant",
    /\b(deodorants?|antiperspirants?)\b.*\b(difference|differ|vs|versus|or|same|better)\b|\b(difference|differ|vs|versus)\b.*\b(deodorants?|antiperspirants?)\b|\bis (it|sava|this) an? (deodorant|antiperspirant)\b/,
  ],
  ["price", /\b(price|prices|pricing|cost|costs|how much|expensive|cheap|cheapest|affordable|mrp)\b/],
  ["sizes", /\b(sizes?|\d+ ?ml|ml|packs?|multi ?packs?|bundles?|how many sticks|quantity)\b/],
  [
    "scents",
    /\b(scents?|fragrances?|smells?|aromas?|perfumes?|notes|recommend\w*|suggest\w*|which (one|stick|scent)|best for|find my)\b/,
  ],
  ["account", /\b(account|password|sign ?in|log ?in|login|sign ?up|register|profile)\b/],
  [
    "contact",
    /\b(contact|talk to|speak (to|with)|human|real person|agent|support|customer (care|service)|email|e-mail|phone number|call (you|us)|whatsapp|complain\w*|collab\w*|wholesale|bulk order|feedback)\b/,
  ],
  ["about", /\b(about (sava|the brand)|who is sava|what is sava|what'?s sava|your story|brand story|founders?)\b/],
  [
    "range",
    /\b(range|bestsellers?|best ?sellers?|popular|new|newest|latest|all products|everything|what do you (sell|have|make|offer)|collections?|catalog(ue)?|sticks?|antiperspirants?|deodorants?|products)\b/,
  ],
];

const THANKS =
  /^(thanks?( you)?( so much)?|thank u|thx|ty|great|cool|ok|okay|perfect|awesome|nice|bye|goodbye|see you|got it)( thanks?)?$/;
const GREETING =
  /^(hi+|hello|hey+|hiya|yo|namaste|hola|good (morning|afternoon|evening))( there)?$|^(help|help me|what can you do|who are you|how does this work)$/;
const PRODUCT_CUES =
  /\b(show|find|search|looking|look for|have|got|want|need|buy|shop|sell|stock|carry|any|price|cost)\b/;
const QUESTION_START = /^(does|do|is|are|can|could|will|would|should|why|how|what|when|where|who|which)\b/;

const FILLER_WORDS = new Set(
  (
    "a an the some any me my i i'm im you your yours we us our for in of on at by with to and or but is are am be " +
    "was were do does did have has had got get gets show shows find search searching want wants need needs like " +
    "love buy shop shopping see look looking please pls plz thanks thank hi hello hey can could would will should " +
    "may might it its this that these those there here what which who where when how something anything stuff " +
    "thing things item items product products piece pieces one ones kind sort type new also just really very more " +
    "other another available availability price prices cost costs much many sell sells stock carry tell about " +
    "stick sticks antiperspirant antiperspirants deodorant deodorants sava scent scents fragrance fragrances smell " +
    "smells aroma aromas recommend suggest best"
  ).split(" "),
);

/** The product words of a message, at most five: "something citrusy please" → "citrusy" */
export const extractProductTerm = (said: string) =>
  normalise(said)
    .replace(/'s\b/g, "")
    .split(" ")
    .map((word) => word.replace(/^[-']+|[-']+$/g, ""))
    .filter((word) => word.length > 1 && /[a-z]/.test(word) && !FILLER_WORDS.has(word))
    .slice(0, 5)
    .join(" ");

type IntentMatch =
  | { intent: "navigate"; target: NavigationTarget }
  | { intent: "products"; term: string }
  | { intent: Exclude<AssistantIntent, "navigate" | "products"> };

/** The message's intent, with what it needs: the page for navigation, the words for a product search */
export function matchAssistantIntent(text: string): IntentMatch {
  const said = normalise(text);
  if (!said) return { intent: "fallback" };
  if (LEAVE_MESSAGE.test(said)) return { intent: "leave-message" };
  const target = NAVIGATION.find((item) => item.command.test(said) || item.alone.test(said));
  if (target) return { intent: "navigate", target };
  const rule = RULES.find(([, pattern]) => pattern.test(said));
  if (rule) return { intent: rule[0] as Exclude<AssistantIntent, "navigate" | "products"> };
  if (THANKS.test(said)) return { intent: "thanks" };
  if (GREETING.test(said)) return { intent: "greeting" };
  const cue = PRODUCT_CUES.test(said);
  // A long message with no shopping words isn't a product search
  if (said.split(" ").length > 8 && !cue) return { intent: "fallback" };
  const term = extractProductTerm(said);
  if (term) return { intent: "products", term };
  return { intent: cue ? "range" : "fallback" };
}

// ---------- Answers ----------------------------------------------------------

const reply = (intent: AssistantIntent, text: string, extras: Partial<AssistantReply> = {}): AssistantReply => ({
  intent,
  text,
  contactFlow: null,
  ...extras,
});

/** The searches to try, in turn: all the words, the last one, the longest, then "-y"/"-s" words trimmed */
function searchAttempts(term: string) {
  const words = term.split(" ").filter((word) => word.length > 2);
  const attempts = [term];
  if (words.length > 1) {
    attempts.push(words.at(-1)!, [...words].sort((a, b) => b.length - a.length)[0]);
  }
  // "citrusy" → "citrus", "woody" → "wood"
  for (const word of words) if (word.length > 4 && /[ys]$/.test(word)) attempts.push(word.slice(0, -1));
  return [...new Set(attempts)];
}

const searchHref = (path: "/shop" | "/blogs", term: string) => `${path}?q=${encodeURIComponent(term)}`;

/** The first search that finds a stick; or, failing that, the first that finds Sweat School posts */
async function findProducts(term: string, loaders: AssistantLoaders) {
  let posts: { term: string; posts: SearchPost[] } | null = null;
  for (const attempt of searchAttempts(term)) {
    const results = await loaders.search(attempt);
    if (results.products.length) return { term: attempt, products: results.products.slice(0, 4), posts: null };
    if (!posts && results.posts.length) posts = { term: attempt, posts: results.posts.slice(0, 2) };
  }
  return { term, products: [], posts };
}

const foundText = (term: string) => `Here's what I found for “${term}”:`;

async function replyWithProducts(term: string, question: boolean, loaders: AssistantLoaders) {
  const found = await findProducts(term, loaders);
  if (found.products.length) {
    return reply("products", foundText(found.term), {
      products: found.products,
      links: [{ label: "See all results", href: searchHref("/shop", found.term) }],
    });
  }
  if (found.posts) {
    return reply("products", `Sweat School has something on “${found.posts.term}”:`, {
      posts: found.posts.posts,
      links: [{ label: "More from Sweat School", href: searchHref("/blogs", found.posts.term) }],
    });
  }
  if (question) return reply("fallback", assistantCopy.unsure, { chips: ["Leave a message", "Talk to us"] });
  return reply("products", `I couldn't find “${term}”. Try a scent, or browse the range:`, {
    chips: SCENT_CHIPS,
    links: [SHOP_LINK],
  });
}

function replyWithRange(loaders: AssistantLoaders, text = assistantCopy.range, chips?: string[]) {
  if (!loaders.range.length) return reply("range", assistantCopy.shopOnly, { links: [SHOP_LINK] });
  return reply("range", text, { products: loaders.range.slice(0, 4), links: [SHOP_LINK], chips });
}

/**
 * A question about one stick ("what does citrus tide cost?") gets that stick; anything else, or a
 * search that fails, gets the range under `text`
 */
async function replyWithRangeOrMatch(message: string, loaders: AssistantLoaders, text: string, chips?: string[]) {
  const term = extractProductTerm(message);
  if (term) {
    try {
      const found = await findProducts(term, loaders);
      if (found.products.length) return reply("products", foundText(found.term), { products: found.products, chips });
    } catch {
      // The range answers it well enough
    }
  }
  return replyWithRange(loaders, text, chips);
}

/** Up to two Sweat School posts on `term`: a bonus under an answer, so a failed search just leaves them out */
async function relatedPosts(term: string, loaders: AssistantLoaders) {
  try {
    return (await loaders.search(term)).posts.slice(0, 2);
  } catch {
    return [];
  }
}

const toTime = (value: string) => (/^\d+$/.test(value) ? Number(value) : Date.parse(value)) || 0;

/** An order as a row: its number, when it was placed, where it's got to and its total */
export const toOrderLine = (order: Order): OrderLine => ({
  id: order._id,
  title: order.orderNo ? `Order #${order.orderNo}` : "Your order",
  date: order.createdAt ? formatDate(order.createdAt) : "",
  status: humanize(order.shipmentStatus || order.fulfillmentStatus || order.paymentStatus),
  total: formatPrice(order.orderPrice ?? order.totalprice),
  href: ORDERS_PATH,
});

const guestOrders = () => reply("orders", assistantCopy.ordersGuest, { links: [SIGN_IN_LINK] });

async function replyWithOrders(user: User | null, loaders: AssistantLoaders) {
  if (!user) return guestOrders();
  const orders = await loaders.orders();
  // The session ended along the way
  if (!orders) return guestOrders();
  const lines = [...orders]
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .slice(0, 3)
    .map(toOrderLine);
  if (!lines.length) return reply("orders", assistantCopy.ordersNone, { chips: ["Shop the range"] });
  return reply("orders", assistantCopy.ordersIntro, {
    orders: lines,
    links: [{ label: "All my orders", href: ORDERS_PATH }],
  });
}

/** An offer in words, from the server's own values: "10% off, on orders over ₹500, until 31 Dec 2026" */
export function describeOffer(promotion: Promotion): OfferLine {
  const type = promotion.promotionType ?? "";
  const discount = Number(promotion.discount);
  const minimum = Number(promotion.minimumSubtotal);
  const parts: string[] = [];
  if (discount > 0) {
    if (/percent/i.test(type)) parts.push(`${discount}% off`);
    else if (/fixed|flat|amount/i.test(type)) parts.push(`${formatPrice(discount)} off`);
  }
  if (/ship/i.test(type)) parts.push("free shipping");
  if (minimum > 0) parts.push(`on orders over ${formatPrice(minimum)}`);
  if (promotion.endDate && toTime(promotion.endDate)) parts.push(`until ${formatDate(promotion.endDate)}`);
  return {
    code: promotion.promotionCode,
    title: promotion.promotionName || promotion.promotionCode,
    detail: parts.join(", "),
  };
}

async function replyWithOffers(loaders: AssistantLoaders) {
  let promotions: Promotion[] = [];
  try {
    promotions = await loaders.offers();
  } catch {
    // Without the list, the answer still says where a code goes
  }
  const offers = promotions
    .filter((promotion) => promotion?.promotionCode)
    .slice(0, 5)
    .map(describeOffer);
  if (!offers.length) return reply("offers", assistantCopy.offersNone, { chips: ["Shop the range"] });
  return reply("offers", assistantCopy.offersIntro, { offers });
}

// ---------- Leave a message --------------------------------------------------

const CONTACT_STEPS: ContactField[] = ["name", "email", "phoneNumber", "subject", "message"];

const CONTACT_QUESTIONS: Record<ContactField, string> = {
  name: "What's your name?",
  email: "What's your email, so the team can reply?",
  phoneNumber: "And a phone number? It's optional: tap Skip if you'd rather not.",
  subject: "What's it about? A few words is enough.",
  message: "Go ahead: what would you like to tell the team?",
};

const CONTACT_ERRORS: Record<ContactField, string> = {
  name: "Could you tell me your name?",
  email: "That email doesn't look right. Could you check it?",
  phoneNumber: "That doesn't look like a phone number. Try again, or tap Skip.",
  subject: "A few words about the topic, please.",
  message: "Could you write a little more? At least 5 characters.",
};

/** Each answer checked: the cleaned-up value, or null when it won't do */
const CONTACT_CHECKS: Record<ContactField, (answer: string) => string | null> = {
  name: (answer) => (answer && answer.length <= 80 ? answer : null),
  email: (answer) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(answer) ? answer : null),
  phoneNumber: (answer) => {
    const phone = answer.replace(/[\s().-]/g, "");
    return /^\+?\d{7,15}$/.test(phone) ? phone : null;
  },
  subject: (answer) => (answer && answer.length <= 120 ? answer : null),
  message: (answer) => (answer.length >= 5 ? answer : null),
};

const SUBJECT_CHIPS = ["My order", "Returns", "My scent", "Something else"];
const CONFIRM_CHIPS = ["Send", "Edit", "Cancel"];

const CANCEL = /^(cancel|stop|never ?mind|exit|quit|forget it|no thanks|don't send( it)?)$/;
const SKIP = /^(skip|no|none|nope|no thanks|rather not|n a|na|no phone)$/;
const SEND = /^(send( it)?|yes|yep|yeah|ok|okay|sure|confirm|go ahead)$/;
const EDIT = /^(edit|change( it)?|no|start (over|again))$/;

/** Questions that end the flow (it answers them instead) rather than count as an answer */
const LEAVING_INTENTS = new Set<AssistantIntent>([
  "navigate",
  "policies",
  "returns",
  "change-order",
  "orders",
  "payment",
  "delivery",
  "offers",
  "subscribe",
  "sensitive-skin",
  "ingredients",
  "packaging",
  "lasting",
  "how-to-use",
  "deodorant",
  "price",
  "sizes",
  "scents",
  "range",
]);
/** The steps where such a question can arrive: the topic and message take any text */
const LEAVABLE_STEPS = new Set<ContactFlow["step"]>(["name", "email", "phoneNumber"]);

const isLeavingQuestion = (answer: string) => LEAVING_INTENTS.has(matchAssistantIntent(answer).intent);

const emptyValues = (): ContactFlow["values"] => ({ name: "", email: "", phoneNumber: "", subject: "", message: "" });

/** The next step after `after` still to answer (an answer given ahead, like a signed-in name, is skipped) */
const nextStep = (values: ContactFlow["values"], after?: ContactField): ContactFlow["step"] =>
  CONTACT_STEPS.slice(after ? CONTACT_STEPS.indexOf(after) + 1 : 0).find((step) => !values[step]) ?? "confirm";

/** The message as it will be sent */
export const summariseContact = (values: ContactFlow["values"]) =>
  [
    "Here's your message:",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phoneNumber || "—"}`,
    `Topic: ${values.subject}`,
    `Message: ${values.message}`,
    "",
    assistantCopy.contactConfirm,
  ].join("\n");

function askContactStep(flow: ContactFlow, lead = "") {
  if (flow.step === "confirm") {
    return reply("leave-message", summariseContact(flow.values), { contactFlow: flow, chips: CONFIRM_CHIPS });
  }
  const question = CONTACT_QUESTIONS[flow.step];
  return reply("leave-message", lead ? `${lead} ${question}` : question, {
    contactFlow: flow,
    chips: flow.step === "subject" ? SUBJECT_CHIPS : flow.step === "phoneNumber" ? ["Skip", "Cancel"] : ["Cancel"],
  });
}

/** Starts "leave a message". A signed-in shopper's name and email come from their profile; Edit changes them */
export function startContactFlow(user: User | null) {
  const values = emptyValues();
  values.name = CONTACT_CHECKS.name([user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()) ?? "";
  values.email = CONTACT_CHECKS.email(user?.email?.trim() ?? "") ?? "";
  const lead =
    values.name && values.email
      ? `${assistantCopy.contactStart} I'll send it as ${values.name} (${values.email}); you can change that before it goes.`
      : assistantCopy.contactStart;
  return askContactStep({ step: nextStep(values), values }, lead);
}

/** The flow's reply to `text`, or null when the shopper asked something else (answered instead; the flow ends) */
export function advanceContactFlow(flow: ContactFlow, text: string): AssistantReply | null {
  const answer = text.trim();
  const said = normalise(answer);

  // "No thanks" skips the phone; anywhere else it's a cancel
  if (flow.step === "phoneNumber" && SKIP.test(said)) {
    return askContactStep({ step: nextStep(flow.values, "phoneNumber"), values: flow.values });
  }
  if (CANCEL.test(said)) return reply("leave-message", assistantCopy.contactCancelled, { chips: QUICK_ACTIONS });

  if (flow.step === "confirm") {
    if (SEND.test(said)) {
      const values = flow.values;
      const valid = CONTACT_STEPS.every((step) => step === "phoneNumber" || CONTACT_CHECKS[step](values[step]));
      if (valid) {
        return reply("leave-message", "", {
          contactFlow: flow,
          action: {
            type: "send-contact",
            input: {
              name: values.name,
              email: values.email,
              phoneNumber: values.phoneNumber || undefined,
              subject: values.subject,
              message: values.message,
            },
          },
        });
      }
    }
    // Edit starts again; so would a Send that doesn't check out (every answer was checked, but a bad
    // message is never sent)
    if (EDIT.test(said) || SEND.test(said)) {
      return askContactStep({ step: "name", values: emptyValues() }, assistantCopy.contactAgain);
    }
    if (isLeavingQuestion(answer)) return null;
    return reply("leave-message", assistantCopy.contactConfirmHelp, { contactFlow: flow, chips: CONFIRM_CHIPS });
  }

  const step = flow.step;
  const value = CONTACT_CHECKS[step](answer);
  if (!value || (step === "name" && isLeavingQuestion(answer))) {
    // A name passes almost any check, so a question asked there is caught here too
    if (LEAVABLE_STEPS.has(step) && isLeavingQuestion(answer)) return null;
    return reply("leave-message", CONTACT_ERRORS[step], {
      contactFlow: flow,
      chips: step === "phoneNumber" ? ["Skip", "Cancel"] : ["Cancel"],
    });
  }
  const values = { ...flow.values, [step]: value };
  const lead = step === "name" ? `Thanks, ${value.split(" ")[0]}.` : "";
  return askContactStep({ step: nextStep(values, step), values }, lead);
}

/** Once createContact has taken the message */
export const contactSentReply = () =>
  reply("leave-message", assistantCopy.contactSent, { chips: ["Shop the range", "Track my order"] });

// ---------- The way in -------------------------------------------------------

/**
 * The reply to `text`. A loader that fails (the search, the orders) rejects it, and the assistant
 * shows its error; the offers and the related posts are extras, left out when they fail.
 */
export async function getAssistantReply(
  text: string,
  { contactFlow = null, user = null, loaders }: ReplyContext,
): Promise<AssistantReply> {
  if (contactFlow) {
    const next = advanceContactFlow(contactFlow, text);
    if (next) return next;
  }

  const match = matchAssistantIntent(text);
  switch (match.intent) {
    case "leave-message":
      return startContactFlow(user);
    case "navigate": {
      const { href, label } = match.target;
      if (!href) return reply("navigate", assistantCopy.openBag, { action: { type: "open-bag" } });
      return reply("navigate", `Taking you to ${label}.`, { action: { type: "navigate", href } });
    }
    case "policies":
      return reply("policies", `${assistantCopy.delivery} ${assistantCopy.returns}`, {
        chips: ["Track my order", "Leave a message"],
      });
    case "returns":
      return reply("returns", assistantCopy.returns, { chips: ["Leave a message", "Track my order"] });
    case "change-order":
      return reply("change-order", assistantCopy.changeOrder, { chips: ["Leave a message", "Track my order"] });
    case "orders":
      return replyWithOrders(user, loaders);
    case "payment":
      return reply("payment", assistantCopy.payment, { chips: ["Delivery & returns", "Shop the range"] });
    case "medical":
      return reply("medical", assistantCopy.medical, { chips: ["Leave a message", "Sensitive skin"] });
    case "sensitive-skin":
      return reply("sensitive-skin", faqAnswer("sensitive-skin"), { chips: ["Is it safe?", "Find my scent"] });
    case "ingredients":
      return reply("ingredients", faqAnswer("safety"), { chips: ["Sensitive skin", "How long does it last?"] });
    case "packaging":
      return reply("packaging", faqAnswer("packaging"), { chips: ["Shop the range", "Find my scent"] });
    case "lasting":
      return reply("lasting", faqAnswer("lasting"), { chips: ["How do I apply it?", "Find my scent"] });
    case "delivery":
      return reply("delivery", assistantCopy.delivery, { chips: ["Track my order", "Delivery & returns"] });
    case "subscribe":
      return reply("subscribe", assistantCopy.subscribe, { chips: ["Shop the range"] });
    case "offers":
      return replyWithOffers(loaders);
    case "how-to-use":
      return reply("how-to-use", assistantCopy.howToUse, { chips: ["How long does it last?", "Sensitive skin"] });
    case "deodorant":
      return reply("deodorant", assistantCopy.deodorant, {
        posts: await relatedPosts("deodorant", loaders),
        chips: ["Find my scent"],
      });
    case "price":
      return replyWithRangeOrMatch(text, loaders, assistantCopy.price);
    case "sizes":
      return reply("sizes", assistantCopy.sizes, { chips: ["Shop the range", "Find my scent"] });
    case "scents":
      return replyWithRangeOrMatch(text, loaders, assistantCopy.scents, SCENT_CHIPS);
    case "account":
      return user
        ? reply(
            "account",
            `You're signed in as ${user.firstName}. Your orders, addresses and details are in your account.`,
            {
              links: [{ label: "My account", href: "/account" }],
            },
          )
        : reply("account", assistantCopy.accountGuest, {
            links: [SIGN_IN_LINK, { label: "Create an account", href: "/signup" }],
          });
    case "contact":
      return reply("contact", assistantCopy.contact, { links: [CONTACT_LINK], chips: ["Leave a message"] });
    case "about":
      return reply("about", siteConfig.description, {
        links: [{ label: "Our story", href: "/about" }],
        chips: ["Shop the range", "Find my scent"],
      });
    case "range":
      return replyWithRange(loaders);
    case "thanks":
      return reply("thanks", assistantCopy.thanks, { chips: ["Shop the range", "Talk to us"] });
    case "greeting":
      return reply("greeting", assistantCopy.greeting, { chips: QUICK_ACTIONS });
    case "products":
      return replyWithProducts(match.term, /\?\s*$/.test(text) || QUESTION_START.test(normalise(text)), loaders);
    default:
      return reply("fallback", assistantCopy.fallback, { chips: QUICK_ACTIONS });
  }
}
