import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BestCouponResponse } from "@/types/coupon";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const BestCouponFinder = () => {
  const [userContext, setUserContext] = useState(`{
  "userId": "u123",
  "userTier": "NEW",
  "country": "IN",
  "lifetimeSpend": 1200,
  "ordersPlaced": 2
}`);

  const [cartData, setCartData] = useState(`{
  "items": [
    {
      "productId": "p1",
      "category": "electronics",
      "unitPrice": 1500,
      "quantity": 1
    },
    {
      "productId": "p2",
      "category": "fashion",
      "unitPrice": 500,
      "quantity": 2
    }
  ]
}`);

  const [result, setResult] = useState<BestCouponResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindBestCoupon = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const user = JSON.parse(userContext);
      const cart = JSON.parse(cartData);

      const { data, error } = await supabase.functions.invoke("best-coupon", {
        body: { user, cart },
      });

      if (error) throw error;

      setResult(data);
      
      if (data.coupon) {
        toast.success(`Best coupon found: ${data.coupon.code}`);
      } else {
        toast.info("No eligible coupons found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to find best coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-medium border-border">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              Find Best Coupon
            </h2>
            <p className="text-sm text-muted-foreground">Test your coupons with user and cart data</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userContext">User Context (JSON)</Label>
            <Textarea
              id="userContext"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              className="font-mono text-sm h-32"
              placeholder='{"userId": "u123", "userTier": "NEW", ...}'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cartData">Cart Data (JSON)</Label>
            <Textarea
              id="cartData"
              value={cartData}
              onChange={(e) => setCartData(e.target.value)}
              className="font-mono text-sm h-40"
              placeholder='{"items": [...]}'
            />
          </div>

          <Button 
            onClick={handleFindBestCoupon}
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading}
          >
            {isLoading ? "Finding..." : "Find Best Coupon"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 shadow-medium border-border animate-in fade-in-50 duration-500">
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Result</h3>
            
            {result.coupon ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="default" className="text-lg px-3 py-1 mb-2">
                      {result.coupon.code}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{result.coupon.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">
                      ₹{result.discountAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Discount Amount</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="font-medium">
                      {result.coupon.discountType === "FLAT" ? "Flat Amount" : "Percentage"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Value</div>
                    <div className="font-medium">
                      {result.coupon.discountType === "FLAT" 
                        ? `₹${result.coupon.discountValue}` 
                        : `${result.coupon.discountValue}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Valid Until</div>
                    <div className="font-medium">
                      {new Date(result.coupon.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{result.message}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
