import { mockProducts } from "@/data/mock-products";
import { createLocalStore } from "@/lib/localStore";
import type { Address, AuthPayload, Cart, CartLine, Order, User } from "@/types";
import { primaryImage } from "@/utils/media";
import { findVariant, isOutOfStock } from "@/utils/product";

/*
 * LOCAL STORE, FOR TESTING: until .env.local points at z-commerce (isApiConfigured), the shop runs
 * on this browser's localStorage instead: accounts, bags, orders, addresses, wishlists and contact
 * messages, over the demo catalogue (src/data/mock-products.ts). Any password signs in to an
 * account created on this device, and passwords are never stored. The hooks (useAuth, useCart,
 * useWishlist…) pick this or the API, so the pages don't change; connect z-commerce and it's unused.
 */

/** A bag line as stored: the variant and how many */
interface StoredLine {
  productId: string;
  variantId: string;
  qty: number;
}

export interface ContactMessage {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
  sentAt: string;
}

/** Every account created on this device, by lower-cased email */
export const accountsStore = createLocalStore<Record<string, User>>("sava-accounts", {});
/** Bags by owner: an account's id, or "guest" */
export const cartsStore = createLocalStore<Record<string, StoredLine[]>>("sava-carts", {});
/** Every order placed on this device, newest first */
export const ordersStore = createLocalStore<Order[]>("sava-orders", []);
/** Saved addresses by account id */
export const addressesStore = createLocalStore<Record<string, Address[]>>("sava-addresses", {});
/** Saved product ids by account id */
export const wishlistsStore = createLocalStore<Record<string, string[]>>("sava-wishlists", {});
/** Messages from the contact form and the assistant, newest first */
export const messagesStore = createLocalStore<ContactMessage[]>("sava-messages", []);

const GUEST = "guest";

/** Whose bag: the signed-in shopper's, or this device's guest bag */
export const cartOwner = (userId?: string | null) => userId || GUEST;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const emailKey = (email: string) => email.trim().toLowerCase();

// ---------- Accounts ---------------------------------------------------------

/** The session the auth store keeps; the tokens only mark it as signed in */
const session = (user: User): AuthPayload => ({ user, accessToken: "local", refreshToken: "local" });

/** The guest bag joins the account's, as z-commerce merges them at sign-in */
function mergeGuestCart(userId: string) {
  cartsStore.write((carts) => {
    const guest = carts[GUEST] ?? [];
    if (!guest.length) return carts;
    let merged = carts[userId] ?? [];
    for (const line of guest) {
      const same = merged.find((l) => l.productId === line.productId && l.variantId === line.variantId);
      merged = same ? merged.map((l) => (l === same ? { ...l, qty: l.qty + line.qty } : l)) : [...merged, line];
    }
    return { ...carts, [userId]: merged, [GUEST]: [] };
  });
}

export function localSignIn(email: string): AuthPayload {
  const account = accountsStore.read()[emailKey(email)];
  if (!account) throw new Error("No account with that email on this device yet. Create one first.");
  mergeGuestCart(account._id);
  return session(account);
}

export function localSignUp(input: Omit<User, "_id">): AuthPayload {
  const key = emailKey(input.email);
  if (accountsStore.read()[key]) throw new Error("An account with this email already exists.");
  const account: User = {
    ...input,
    _id: newId(),
    email: key,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    status: "ACTIVE",
  };
  accountsStore.write((all) => ({ ...all, [key]: account }));
  mergeGuestCart(account._id);
  return session(account);
}

export function localUpdateUser(user: User) {
  accountsStore.write((all) => ({ ...all, [emailKey(user.email)]: user }));
}

// ---------- Bag --------------------------------------------------------------

const productById = (id: string) => mockProducts.find((p) => p._id === id);

/** The variant of a listed product with these choices (every option's pick), if it's in stock */
export function localVariant(slug: string, selectedOptions: string[]) {
  const product = mockProducts.find((p) => p.slug === slug);
  const variants = product?.variants ?? [];
  const variant = selectedOptions.length ? findVariant(variants, selectedOptions) : variants[0];
  return variant && !isOutOfStock(variant) ? variant : null;
}

/** The stored lines as the cart z-commerce would return; lines whose product has gone are dropped */
export function toLocalCart(lines: StoredLine[], owner: string): Cart {
  const cart: CartLine[] = lines.flatMap((line) => {
    const product = productById(line.productId);
    const variant = product?.variants?.find((v) => v._id === line.variantId);
    if (!product || !variant) return [];
    const { _id, ...detail } = variant;
    return [
      {
        productId: product._id,
        name: product.name,
        qty: line.qty,
        price: variant.variantPrice,
        finalPrice: variant.variantPrice * line.qty,
        asset: primaryImage(product.assets),
        variantDetail: { ...detail, variantDetailId: _id },
        product: { _id: product._id, name: product.name, slug: product.slug },
      },
    ];
  });
  const total = cart.reduce((sum, line) => sum + line.finalPrice, 0);
  return {
    _id: `local-cart-${owner}`,
    itemcount: cart.reduce((n, line) => n + line.qty, 0),
    totalprice: total,
    discountedPrice: total,
    totalDiscount: 0,
    totalTax: 0,
    cart,
    coupon: null,
  };
}

export function localAddToCart(owner: string, productId: string, variantId: string, qty = 1) {
  cartsStore.write((carts) => {
    const lines = carts[owner] ?? [];
    const same = lines.find((l) => l.productId === productId && l.variantId === variantId);
    return {
      ...carts,
      [owner]: same
        ? lines.map((l) => (l === same ? { ...l, qty: l.qty + qty } : l))
        : [...lines, { productId, variantId, qty }],
    };
  });
}

/** Takes one off the line, or the whole line */
export function localRemoveFromCart(owner: string, productId: string, variantId: string, completely: boolean) {
  cartsStore.write((carts) => ({
    ...carts,
    [owner]: (carts[owner] ?? []).flatMap((l) => {
      if (l.productId !== productId || l.variantId !== variantId) return [l];
      return completely || l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }];
    }),
  }));
}

// ---------- Orders and addresses ---------------------------------------------

/** Places the bag as an order (no payment is taken) and empties it */
export function localPlaceOrder({
  owner,
  userId,
  shippingAddress,
  billingAddress,
}: {
  owner: string;
  userId?: string | null;
  shippingAddress: Address;
  billingAddress: Address;
}): Order {
  const cart = toLocalCart(cartsStore.read()[owner] ?? [], owner);
  const order: Order = {
    _id: newId(),
    orderNo: `SV${Date.now().toString().slice(-6)}`,
    orderPrice: cart.totalprice,
    totalprice: cart.totalprice,
    discountedPrice: cart.totalprice,
    totalDiscount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    itemcount: cart.itemcount,
    currency: "INR",
    paymentStatus: "PAID",
    fulfillmentStatus: "PROCESSING",
    shipmentStatus: "PROCESSING",
    cart: cart.cart,
    shippingAddress,
    billingAddress,
    createdAt: new Date().toISOString(),
  };
  ordersStore.write((orders) => [{ ...order, ...(userId ? { userId } : {}) }, ...orders]);
  cartsStore.write((carts) => ({ ...carts, [owner]: [] }));
  return order;
}

/** An account's orders, newest first */
export const ordersOf = (orders: Order[], userId: string) =>
  orders.filter((order) => (order as Order & { userId?: string }).userId === userId);

/** Saves an address (or updates it, given its id); a new default takes over from the old one */
export function localSaveAddress(userId: string, address: Omit<Address, "_id" | "userId">, id?: string) {
  addressesStore.write((all) => {
    const list = all[userId] ?? [];
    const saved: Address = { ...address, _id: id ?? newId(), userId };
    const others = list.filter((a) => a._id !== saved._id).map((a) => (saved.primary ? { ...a, primary: false } : a));
    // The default first, as the API sorts them
    return { ...all, [userId]: saved.primary ? [saved, ...others] : [...others, saved] };
  });
}

export function localSendMessage(message: Omit<ContactMessage, "sentAt">) {
  messagesStore.write((all) => [{ ...message, sentAt: new Date().toISOString() }, ...all]);
}
