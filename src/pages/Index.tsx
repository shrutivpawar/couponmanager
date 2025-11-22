import { useState } from "react";
import { CouponForm } from "@/components/CouponForm";
import { BestCouponFinder } from "@/components/BestCouponFinder";
import { CouponList } from "@/components/CouponList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCouponCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Tag className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Coupon Management System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create powerful coupons with complex eligibility rules and find the best deals for your customers
          </p>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="create" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
            <TabsTrigger value="create" className="font-medium">Create</TabsTrigger>
            <TabsTrigger value="test" className="font-medium">Test</TabsTrigger>
            <TabsTrigger value="list" className="font-medium">List</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <CouponForm onCouponCreated={handleCouponCreated} />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <BestCouponFinder />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <CouponList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
