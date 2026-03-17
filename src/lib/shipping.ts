// Fixed shipping rates
export const STANDARD_SHIPPING_COST = 0; // Free shipping
export const EXPRESS_SHIPPING_COST = 0; // Free shipping

export const getShippingCost = (state: string | undefined): number => {
  return STANDARD_SHIPPING_COST;
};

export const getExpressShippingCost = (state: string | undefined): number => {
  return EXPRESS_SHIPPING_COST;
};

export const getFreeShippingThreshold = (): number => {
  return 0; // Always free shipping
};

export const calculateShippingCost = (subtotal: number, state: string | undefined, isExpress: boolean = false): number => {
  // Always free shipping
  return 0;
};
