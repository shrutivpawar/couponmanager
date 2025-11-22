import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shared in-memory storage with create-coupon (simulated)
// In a real scenario, this would be a shared database
const coupons = new Map<string, any>();

// Helper function to check if a date is within range
const isDateInRange = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};

// Helper function to check user eligibility
const checkUserEligibility = (eligibility: any, user: any): boolean => {
  // Check allowed user tiers
  if (eligibility.allowedUserTiers && eligibility.allowedUserTiers.length > 0) {
    if (!eligibility.allowedUserTiers.includes(user.userTier)) {
      return false;
    }
  }

  // Check minimum lifetime spend
  if (eligibility.minLifetimeSpend !== undefined && user.lifetimeSpend < eligibility.minLifetimeSpend) {
    return false;
  }

  // Check minimum orders placed
  if (eligibility.minOrdersPlaced !== undefined && user.ordersPlaced < eligibility.minOrdersPlaced) {
    return false;
  }

  // Check first order only
  if (eligibility.firstOrderOnly === true && user.ordersPlaced > 0) {
    return false;
  }

  // Check allowed countries
  if (eligibility.allowedCountries && eligibility.allowedCountries.length > 0) {
    if (!eligibility.allowedCountries.includes(user.country)) {
      return false;
    }
  }

  return true;
};

// Helper function to check cart eligibility
const checkCartEligibility = (eligibility: any, cart: any, cartValue: number): boolean => {
  // Check minimum cart value
  if (eligibility.minCartValue !== undefined && cartValue < eligibility.minCartValue) {
    return false;
  }

  // Check applicable categories
  if (eligibility.applicableCategories && eligibility.applicableCategories.length > 0) {
    const hasApplicableCategory = cart.items.some((item: any) => 
      eligibility.applicableCategories.includes(item.category)
    );
    if (!hasApplicableCategory) {
      return false;
    }
  }

  // Check excluded categories
  if (eligibility.excludedCategories && eligibility.excludedCategories.length > 0) {
    const hasExcludedCategory = cart.items.some((item: any) => 
      eligibility.excludedCategories.includes(item.category)
    );
    if (hasExcludedCategory) {
      return false;
    }
  }

  // Check minimum items count
  if (eligibility.minItemsCount !== undefined) {
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    if (totalItems < eligibility.minItemsCount) {
      return false;
    }
  }

  return true;
};

// Helper function to calculate cart value
const calculateCartValue = (cart: any): number => {
  return cart.items.reduce((sum: number, item: any) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);
};

// Helper function to calculate discount amount
const calculateDiscount = (coupon: any, cartValue: number): number => {
  if (coupon.discountType === 'FLAT') {
    return Math.min(coupon.discountValue, cartValue);
  } else if (coupon.discountType === 'PERCENT') {
    const discount = (coupon.discountValue / 100) * cartValue;
    if (coupon.maxDiscountAmount !== undefined) {
      return Math.min(discount, coupon.maxDiscountAmount);
    }
    return discount;
  }
  return 0;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST to find best coupon.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { user, cart, usageHistory = {} } = body;

    // Validate input
    if (!user || !cart || !cart.items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user, cart, cart.items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate cart value
    const cartValue = calculateCartValue(cart);

    console.log(`Finding best coupon for user ${user.userId} with cart value ${cartValue}`);
    console.log(`Total coupons available: ${coupons.size}`);

    // Evaluate all coupons
    const eligibleCoupons: Array<{ coupon: any; discount: number }> = [];

    for (const [code, coupon] of coupons.entries()) {
      // Check date validity
      if (!isDateInRange(coupon.startDate, coupon.endDate)) {
        console.log(`Coupon ${code} not valid by date`);
        continue;
      }

      // Check usage limit
      if (coupon.usageLimitPerUser !== undefined) {
        const userUsage = usageHistory[user.userId] || 0;
        if (userUsage >= coupon.usageLimitPerUser) {
          console.log(`Coupon ${code} exceeded usage limit for user`);
          continue;
        }
      }

      // Check user eligibility
      if (coupon.eligibility && !checkUserEligibility(coupon.eligibility, user)) {
        console.log(`Coupon ${code} not eligible for user`);
        continue;
      }

      // Check cart eligibility
      if (coupon.eligibility && !checkCartEligibility(coupon.eligibility, cart, cartValue)) {
        console.log(`Coupon ${code} not eligible for cart`);
        continue;
      }

      // Calculate discount
      const discount = calculateDiscount(coupon, cartValue);
      
      console.log(`Coupon ${code} is eligible with discount ${discount}`);
      eligibleCoupons.push({ coupon, discount });
    }

    // If no eligible coupons, return null
    if (eligibleCoupons.length === 0) {
      return new Response(
        JSON.stringify({
          coupon: null,
          discountAmount: 0,
          message: 'No eligible coupons found for this user and cart.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by discount (highest first), then by endDate (earliest first), then by code (lexicographic)
    eligibleCoupons.sort((a, b) => {
      if (b.discount !== a.discount) {
        return b.discount - a.discount;
      }
      
      const dateA = new Date(a.coupon.endDate);
      const dateB = new Date(b.coupon.endDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      return a.coupon.code.localeCompare(b.coupon.code);
    });

    const best = eligibleCoupons[0];

    console.log(`Best coupon: ${best.coupon.code} with discount ${best.discount}`);

    return new Response(
      JSON.stringify({
        coupon: best.coupon,
        discountAmount: best.discount,
        message: `Best coupon found: ${best.coupon.code}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error finding best coupon:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
