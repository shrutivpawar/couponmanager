import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for coupons
const coupons = new Map<string, any>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST to create coupons.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const coupon = await req.json();

    // Validate required fields
    if (!coupon.code || !coupon.description || !coupon.discountType || 
        coupon.discountValue === undefined || !coupon.startDate || !coupon.endDate) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: code, description, discountType, discountValue, startDate, endDate' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate discount type
    if (coupon.discountType !== 'FLAT' && coupon.discountType !== 'PERCENT') {
      return new Response(
        JSON.stringify({ error: 'discountType must be either FLAT or PERCENT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon code already exists
    if (coupons.has(coupon.code)) {
      return new Response(
        JSON.stringify({ 
          error: `Coupon with code '${coupon.code}' already exists. Overwriting existing coupon.`,
          warning: 'Existing coupon was replaced'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure eligibility object exists
    if (!coupon.eligibility) {
      coupon.eligibility = {};
    }

    // Store the coupon
    coupons.set(coupon.code, coupon);

    console.log(`Coupon created: ${coupon.code}`, { totalCoupons: coupons.size });

    return new Response(
      JSON.stringify({ 
        message: 'Coupon created successfully',
        coupon: coupon,
        totalCoupons: coupons.size
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating coupon:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
