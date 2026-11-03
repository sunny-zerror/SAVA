/*
 * Reusable field selections, interpolated into the operations as plain text.
 * (Plain strings rather than GraphQL fragments, so we don't depend on the
 * server's internal type names.)
 */

export const ASSET = `path type altText isFeatured isHover`;

export const VARIANT = `
  _id selectedOptions priceDifference variantPrice sku variantCostOfGoods
  shippingWeight trackInventory stockQuantity stockStatus status visibility
`;

export const VARIANT_DETAIL = `
  variantDetailId selectedOptions priceDifference variantPrice variantCostOfGoods
  shippingWeight sku trackInventory stockQuantity stockStatus status
`;

export const SEO_META = `
  title description keywords robots
  og { title description image }
`;

export const PRODUCT_CARD = `
  _id name slug price discountedPrice categoryIds
  assets { ${ASSET} }
  ribbon { name ribbonId }
  productOptions { optionName choices { name } }
  variants { selectedOptions variantPrice stockQuantity stockStatus status }
`;

export const CART_LINE = `
  productId name qty price finalPrice
  asset { _id ${ASSET} }
  variantDetail { ${VARIANT_DETAIL} }
  product { _id name slug }
`;

export const CART = `
  _id userId guestId itemcount totalprice discountedPrice totalDiscount totalTax
  isFreeShippingEnabled
  cart { ${CART_LINE} }
  coupon { couponId couponCode }
`;

export const ADDRESS = `
  _id userId firstname lastname addressType flat addressline1 addressline2
  landmark countryCode phone city country states pincode primary
`;

export const USER = `
  _id firstName lastName email phoneNumber countryCode gender dateOfBirth
  profileImg emailSubscribedStatus status
  addresses { ${ADDRESS} }
`;

export const ORDER = `
  _id orderNo orderPrice totalprice discountedPrice totalDiscount shippingAmount
  taxAmount itemcount currency paymentStatus fulfillmentStatus shipmentStatus
  invoiceUrl createdAt
  cart { ${CART_LINE} }
`;
