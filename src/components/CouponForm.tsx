import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Coupon, DiscountType } from "@/types/coupon";

export const CouponForm = ({ onCouponCreated }: { onCouponCreated: () => void }) => {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("FLAT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  
  // User eligibility
  const [allowedUserTiers, setAllowedUserTiers] = useState("");
  const [minLifetimeSpend, setMinLifetimeSpend] = useState("");
  const [minOrdersPlaced, setMinOrdersPlaced] = useState("");
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState("");
  
  // Cart eligibility
  const [minCartValue, setMinCartValue] = useState("");
  const [applicableCategories, setApplicableCategories] = useState("");
  const [excludedCategories, setExcludedCategories] = useState("");
  const [minItemsCount, setMinItemsCount] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const coupon: Coupon = {
        code: code.trim(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
        startDate,
        endDate,
        usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : undefined,
        eligibility: {
          allowedUserTiers: allowedUserTiers ? allowedUserTiers.split(",").map(t => t.trim()) : undefined,
          minLifetimeSpend: minLifetimeSpend ? parseFloat(minLifetimeSpend) : undefined,
          minOrdersPlaced: minOrdersPlaced ? parseInt(minOrdersPlaced) : undefined,
          firstOrderOnly: firstOrderOnly || undefined,
          allowedCountries: allowedCountries ? allowedCountries.split(",").map(c => c.trim()) : undefined,
          minCartValue: minCartValue ? parseFloat(minCartValue) : undefined,
          applicableCategories: applicableCategories ? applicableCategories.split(",").map(c => c.trim()) : undefined,
          excludedCategories: excludedCategories ? excludedCategories.split(",").map(c => c.trim()) : undefined,
          minItemsCount: minItemsCount ? parseInt(minItemsCount) : undefined,
        }
      };

      const { data, error } = await supabase.functions.invoke("create-coupon", {
        body: coupon,
      });

      if (error) throw error;

      toast.success("Coupon created successfully!");
      
      // Reset form
      setCode("");
      setDescription("");
      setDiscountValue("");
      setMaxDiscountAmount("");
      setStartDate("");
      setEndDate("");
      setUsageLimitPerUser("");
      setAllowedUserTiers("");
      setMinLifetimeSpend("");
      setMinOrdersPlaced("");
      setFirstOrderOnly(false);
      setAllowedCountries("");
      setMinCartValue("");
      setApplicableCategories("");
      setExcludedCategories("");
      setMinItemsCount("");
      
      onCouponCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-medium border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">Create Coupon</h2>
          <p className="text-sm text-muted-foreground">Define a new coupon with eligibility rules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., WELCOME100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type *</Label>
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                <SelectItem value="PERCENT">Percentage (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">Discount Value *</Label>
            <Input
              id="discountValue"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "FLAT" ? "100" : "10"}
              required
            />
          </div>

          {discountType === "PERCENT" && (
            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder="500"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the coupon"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
            <Input
              id="usageLimitPerUser"
              type="number"
              value={usageLimitPerUser}
              onChange={(e) => setUsageLimitPerUser(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-display font-semibold mb-4">User Eligibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allowedUserTiers">Allowed User Tiers</Label>
              <Input
                id="allowedUserTiers"
                value={allowedUserTiers}
                onChange={(e) => setAllowedUserTiers(e.target.value)}
                placeholder="NEW, REGULAR, GOLD"
              />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedCountries">Allowed Countries</Label>
              <Input
                id="allowedCountries"
                value={allowedCountries}
                onChange={(e) => setAllowedCountries(e.target.value)}
                placeholder="IN, US"
              />
              <p className="text-xs text-muted-foreground">Comma-separated country codes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minLifetimeSpend">Min Lifetime Spend (₹)</Label>
              <Input
                id="minLifetimeSpend"
                type="number"
                value={minLifetimeSpend}
                onChange={(e) => setMinLifetimeSpend(e.target.value)}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrdersPlaced">Min Orders Placed</Label>
              <Input
                id="minOrdersPlaced"
                type="number"
                value={minOrdersPlaced}
                onChange={(e) => setMinOrdersPlaced(e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstOrderOnly"
                checked={firstOrderOnly}
                onCheckedChange={(checked) => setFirstOrderOnly(checked as boolean)}
              />
              <Label htmlFor="firstOrderOnly" className="cursor-pointer">First Order Only</Label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-display font-semibold mb-4">Cart Eligibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minCartValue">Min Cart Value (₹)</Label>
              <Input
                id="minCartValue"
                type="number"
                value={minCartValue}
                onChange={(e) => setMinCartValue(e.target.value)}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minItemsCount">Min Items Count</Label>
              <Input
                id="minItemsCount"
                type="number"
                value={minItemsCount}
                onChange={(e) => setMinItemsCount(e.target.value)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicableCategories">Applicable Categories</Label>
              <Input
                id="applicableCategories"
                value={applicableCategories}
                onChange={(e) => setApplicableCategories(e.target.value)}
                placeholder="electronics, fashion"
              />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excludedCategories">Excluded Categories</Label>
              <Input
                id="excludedCategories"
                value={excludedCategories}
                onChange={(e) => setExcludedCategories(e.target.value)}
                placeholder="sale, clearance"
              />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Coupon"}
        </Button>
      </form>
    </Card>
  );
};
