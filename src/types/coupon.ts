export type DiscountType = "FLAT" | "PERCENT";

export interface Eligibility {
  // User-based attributes
  allowedUserTiers?: string[];
  minLifetimeSpend?: number;
  minOrdersPlaced?: number;
  firstOrderOnly?: boolean;
  allowedCountries?: string[];
  
  // Cart-based attributes
  minCartValue?: number;
  applicableCategories?: string[];
  excludedCategories?: string[];
  minItemsCount?: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimitPerUser?: number;
  eligibility: Eligibility;
}

export interface UserContext {
  userId: string;
  userTier: string;
  country: string;
  lifetimeSpend: number;
  ordersPlaced: number;
}

export interface CartItem {
  productId: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface BestCouponRequest {
  user: UserContext;
  cart: Cart;
  usageHistory?: Record<string, number>; // userId -> usage count
}

export interface BestCouponResponse {
  coupon: Coupon | null;
  discountAmount: number;
  message: string;
}
