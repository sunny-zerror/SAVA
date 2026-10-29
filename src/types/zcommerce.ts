/*
 * Shapes returned by the z-commerce GraphQL API (client-side resolvers).
 * Only the fields the queries in src/graphql select are listed — add a field
 * here when you add it to a query.
 */

export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK";
export type ProductStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type UserStatus = "ACTIVE" | "DEACTIVE" | "BLOCKED";
export type EmailSubscribedStatus = "SUBSCRIBED" | "UNSUBSCRIBED" | "NEVER_SUBSCRIBED";

export interface Asset {
  _id?: string;
  path: string;
  type?: string; // "image" | "video"
  altText?: string | null;
  isFeatured?: boolean | null;
  isHover?: boolean | null;
  isSizeGuide?: boolean | null;
}

export interface SeoMeta {
  title?: string | null;
  description?: string | null;
  keywords?: string[] | string | null;
  robots?: string | null;
  og?: { title?: string | null; description?: string | null; image?: string | null } | null;
}

export interface ProductOption {
  optionName: string; // "Size", "Colour"
  choices: { name: string; assetsId?: string[] | null }[];
  showInProductPageAs?: string | null; // "dropdown" | "swatch" | "list"
}

export interface Variant {
  _id?: string;
  selectedOptions: string[]; // choice names, e.g. ["M", "Black"]
  priceDifference?: number | null;
  variantPrice: number;
  sku?: string | null;
  variantCostOfGoods?: number | null;
  shippingWeight?: number | null;
  trackInventory?: boolean | null;
  stockQuantity?: number | null;
  stockStatus?: StockStatus | null;
  status?: string | null;
  visibility?: boolean | null;
}

/** Variant as stored on a cart line / sent to addItemToCart */
export interface VariantDetail extends Omit<Variant, "_id"> {
  variantDetailId?: string;
}

export interface Ribbon {
  name: string;
  ribbonId?: string;
}

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
}

/** Product as listed on grids (getClientSideProducts / category products) */
export interface ProductSummary {
  _id: string;
  name: string;
  slug: string;
  price?: number | null;
  discountedPrice?: number | null;
  assets: Asset[];
  ribbon?: Ribbon | null;
  variants?: Pick<Variant, "variantPrice" | "stockQuantity" | "stockStatus" | "status">[] | null;
  categoryIds?: string[] | null;
}

/** Full product (getClientSideProductById) */
export interface Product extends Omit<ProductSummary, "variants"> {
  description?: string | null;
  additionalInfo?: { title: string; description: string }[] | null;
  categories?: CategoryRef[] | null;
  productOptions?: ProductOption[] | null;
  variants?: Variant[] | null;
  status?: ProductStatus | null;
  meta?: SeoMeta | null;
}

export interface Category extends CategoryRef {
  imgsrc?: string | null;
  description?: string | null;
  meta?: SeoMeta | null;
}

// --- Cart ---------------------------------------------------------------------

export interface CartLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
  finalPrice: number;
  asset?: Asset | null;
  variantDetail?: VariantDetail | null;
  product?: { _id: string; name: string; slug: string } | null;
}

export interface Cart {
  _id: string;
  userId?: string | null;
  guestId?: string | null;
  itemcount: number;
  totalprice: number;
  discountedPrice?: number | null;
  totalDiscount?: number | null;
  totalTax?: number | null;
  isFreeShippingEnabled?: boolean | null;
  cart: CartLine[];
  coupon?: { couponId?: string | null; couponCode?: string | null } | null;
}

// --- Account --------------------------------------------------------------------

export interface Address {
  _id?: string;
  userId?: string;
  firstname: string;
  lastname: string;
  email?: string;
  addressType?: string | null; // "Home", "Work"
  flat?: string | null;
  addressline1: string;
  addressline2?: string | null;
  landmark?: string | null;
  countryCode: string; // dialling code, e.g. "+91"
  phone: string;
  city: string;
  states: string;
  country: string;
  pincode: string;
  primary?: boolean | null;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  countryCode?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  profileImg?: string | null;
  emailSubscribedStatus?: EmailSubscribedStatus | null;
  status?: UserStatus | null;
  addresses?: Address[] | null;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// --- Orders -------------------------------------------------------------------

export interface Order {
  _id: string;
  orderNo: string;
  orderPrice?: number | null;
  totalprice: number;
  discountedPrice?: number | null;
  totalDiscount?: number | null;
  shippingAmount?: number | null;
  taxAmount?: number | null;
  itemcount: number;
  currency?: string | null;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  shipmentStatus?: string | null;
  invoiceUrl?: string | null;
  cart: CartLine[];
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  createdAt: string;
}

export interface PaymentRecord {
  _id: string;
  currentStatus?: string | null;
  totalAmount?: number | null;
  order: Order;
}

export interface Paginated<T> {
  data: T[];
  totalCount: number;
}
