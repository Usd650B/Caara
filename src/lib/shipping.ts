// Fixed shipping rates
export const STANDARD_SHIPPING_COST = 2.00; // $2 USD for standard shipping
export const EXPRESS_SHIPPING_COST = 5.00; // $5 USD for express shipping

export const getShippingCost = (state: string | undefined): number => {
  return STANDARD_SHIPPING_COST;
};

export const getExpressShippingCost = (state: string | undefined): number => {
  return EXPRESS_SHIPPING_COST;
};

export const getFreeShippingThreshold = (): number => {
  return 50; // Free shipping on orders over $50
};

export const calculateShippingCost = (subtotal: number, state: string | undefined, isExpress: boolean = false): number => {
  // Free shipping on orders over threshold
  if (subtotal >= getFreeShippingThreshold()) {
    return 0;
  }
  
  return isExpress ? getExpressShippingCost(state) : getShippingCost(state);
};
