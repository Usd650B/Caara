// Shipping rates based on location
export const SHIPPING_RATES: Record<string, number> = {
  // US States
  'AL': 5.99, 'AK': 15.99, 'AZ': 6.99, 'AR': 5.99, 'CA': 7.99, 'CO': 6.99, 'CT': 5.99, 'DE': 5.99, 'FL': 6.99, 'GA': 5.99,
  'HI': 19.99, 'ID': 7.99, 'IL': 5.99, 'IN': 5.99, 'IA': 6.99, 'KS': 6.99, 'KY': 5.99, 'LA': 6.99, 'ME': 6.99, 'MD': 5.99,
  'MA': 5.99, 'MI': 5.99, 'MN': 6.99, 'MS': 6.99, 'MO': 6.99, 'MT': 7.99, 'NE': 6.99, 'NV': 7.99, 'NH': 6.99, 'NJ': 5.99,
  'NM': 7.99, 'NY': 5.99, 'NC': 5.99, 'ND': 7.99, 'OH': 5.99, 'OK': 6.99, 'OR': 7.99, 'PA': 5.99, 'RI': 5.99, 'SC': 5.99,
  'SD': 7.99, 'TN': 5.99, 'TX': 6.99, 'UT': 6.99, 'VT': 6.99, 'VA': 5.99, 'WA': 7.99, 'WV': 5.99, 'WI': 6.99, 'WY': 7.99,
  'DC': 5.99,
  
  // Canada Provinces
  'AB': 12.99, 'BC': 12.99, 'SK': 12.99, 'MB': 12.99, 'ON': 11.99, 'QC': 11.99, 'NB': 11.99, 'NS': 11.99, 
  'PE': 12.99, 'NL': 12.99, 'YT': 14.99, 'NT': 14.99, 'NU': 14.99,
  
  // International
  'UK': 18.99, 'AU': 24.99, 'MX': 14.99, 'GER': 16.99, 'FRA': 16.99, 'JP': 22.99, 'IND': 20.99,
  'DEFAULT': 8.99
};

export const getShippingCost = (state: string | undefined): number => {
  if (!state) return SHIPPING_RATES['DEFAULT'];
  
  const stateCode = state.toUpperCase().slice(0, 2);
  return SHIPPING_RATES[stateCode] || SHIPPING_RATES['DEFAULT'];
};

export const getExpressShippingCost = (state: string | undefined): number => {
  const baseShipping = getShippingCost(state);
  return baseShipping * 1.5; // 50% premium for express
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
