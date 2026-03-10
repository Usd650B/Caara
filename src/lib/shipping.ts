// Fixed shipping rates
export const STANDARD_SHIPPING_COST = 1.48; // $1.48 USD for standard shipping
export const EXPRESS_SHIPPING_COST = 3.50; // $3.50 USD for express shipping

export const getShippingCost = (state: string | undefined): number => {
  return STANDARD_SHIPPING_COST;
};

export const getExpressShippingCost = (state: string | undefined): number => {
  return EXPRESS_SHIPPING_COST;
};

export const getFreeShippingThreshold = (): number => {
  return 0; // No free shipping - always charge shipping
};

export const calculateShippingCost = (subtotal: number, state: string | undefined, isExpress: boolean = false): number => {
  // Always charge shipping - no free shipping
  return isExpress ? getExpressShippingCost(state) : getShippingCost(state);
};
