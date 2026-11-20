/** The cards sold on the landing page. Prices in Rwandan francs. */
export const PRODUCTS = {
  "business-card": { name: "Business Smart Card", price: 10_000 },
  "social-tag": { name: "Social Media Tag", price: 5_000 },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export const PRODUCT_IDS = Object.keys(PRODUCTS) as [ProductId, ...ProductId[]];
