import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Coupon } from "@/types/coupon";
import { Ticket, Calendar, Percent, DollarSign } from "lucide-react";

export const CouponList = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("list-coupons");
        
        if (error) throw error;
        
        setCoupons(data.coupons || []);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <Card className="p-6 shadow-medium border-border">
        <div className="text-center text-muted-foreground">Loading coupons...</div>
      </Card>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card className="p-6 shadow-medium border-border">
        <div className="text-center text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No coupons created yet. Create your first coupon above!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">Available Coupons</h2>
        <Badge variant="secondary">{coupons.length} Total</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <Card 
            key={coupon.code} 
            className="p-5 shadow-soft border-border hover:shadow-medium transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <Badge variant="default" className="font-mono">
                    {coupon.code}
                  </Badge>
                </div>
                <Badge 
                  variant={coupon.discountType === "FLAT" ? "secondary" : "outline"}
                  className="flex items-center gap-1"
                >
                  {coupon.discountType === "FLAT" ? (
                    <><DollarSign className="w-3 h-3" /> FLAT</>
                  ) : (
                    <><Percent className="w-3 h-3" /> PERCENT</>
                  )}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{coupon.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Discount</div>
                  <div className="font-semibold text-primary">
                    {coupon.discountType === "FLAT" 
                      ? `₹${coupon.discountValue}` 
                      : `${coupon.discountValue}%`}
                  </div>
                </div>
                {coupon.maxDiscountAmount && (
                  <div>
                    <div className="text-xs text-muted-foreground">Max Discount</div>
                    <div className="font-semibold text-primary">₹{coupon.maxDiscountAmount}</div>
                  </div>
                )}
                <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {coupon.eligibility && Object.keys(coupon.eligibility).length > 0 && (
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-1">Eligibility Rules:</div>
                  <div className="flex flex-wrap gap-1">
                    {coupon.eligibility.minCartValue && (
                      <Badge variant="outline" className="text-xs">
                        Cart ≥ ₹{coupon.eligibility.minCartValue}
                      </Badge>
                    )}
                    {coupon.eligibility.allowedUserTiers && coupon.eligibility.allowedUserTiers.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {coupon.eligibility.allowedUserTiers.join(", ")}
                      </Badge>
                    )}
                    {coupon.eligibility.firstOrderOnly && (
                      <Badge variant="outline" className="text-xs">
                        First Order
                      </Badge>
                    )}
                    {coupon.eligibility.minItemsCount && (
                      <Badge variant="outline" className="text-xs">
                        Items ≥ {coupon.eligibility.minItemsCount}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
