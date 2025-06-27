// FILE: PricingPage.tsx
// Description: Pricing plans UI for SoulLift Audio

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleUpgrade = (plan: string) => {
    // TODO: Integrate payment flow (e.g., Stripe)
    alert(`${plan} upgrade flow will be implemented soon. You'll be redirected to secure payment processing.`);
  };

  const features = {
    free: [
      { name: "3 free credits on signup", included: true },
      { name: "Basic Soul Hug creation", included: true },
      { name: "Limited music library (3 tracks)", included: true },
      { name: "Standard cover images", included: true },
      { name: "30-second audio messages", included: true },
      { name: "Basic sharing features", included: true },
      { name: "Prompt regeneration", included: false },
      { name: "Premium music library", included: false },
      { name: "Extended audio messages (up to 2 min)", included: false },
      { name: "Custom cover uploads", included: false },
      { name: "Priority support", included: false }
    ],
    starter: [
      { name: "10 credits monthly", included: true },
      { name: "All free features", included: true },
      { name: "Prompt regeneration (1 credit each)", included: true },
      { name: "Premium music library (7 tracks)", included: true },
      { name: "Extended audio messages (up to 1 min)", included: true },
      { name: "Custom cover uploads", included: true },
      { name: "Advanced sharing options", included: true },
      { name: "Email support", included: true },
      { name: "Extended audio messages (up to 2 min)", included: false },
      { name: "Unlimited regenerations", included: false },
      { name: "Priority support", included: false }
    ],
    premium: [
      { name: "30 credits monthly", included: true },
      { name: "All starter features", included: true },
      { name: "Extended audio messages (up to 2 min)", included: true },
      { name: "Full premium music library", included: true },
      { name: "Unlimited custom covers", included: true },
      { name: "Advanced AI personalization", included: true },
      { name: "Priority support", included: true },
      { name: "Early access to new features", included: true },
      { name: "Analytics dashboard", included: true },
      { name: "Bulk creation tools", included: true },
      { name: "API access", included: false }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Unlock the full potential of Soul Hug creation with our flexible pricing plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Free Tier */}
          <Card className="bg-white/10 border-white/20 text-white relative">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-4xl font-bold">$0</div>
              <div className="text-white/70">Forever</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${!feature.included ? 'text-white/50' : ''}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-6" 
                variant="outline"
                disabled={!user}
                onClick={() => setLocation("/")}
              >
                {user ? "Current Plan" : "Sign Up Free"}
              </Button>
            </CardContent>
          </Card>

          {/* Starter Tier */}
          <Card className="bg-white/15 border-white/30 text-white relative scale-105 shadow-2xl">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Starter</CardTitle>
              <div className="text-4xl font-bold">$9.99</div>
              <div className="text-white/70">per month</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.starter.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${!feature.included ? 'text-white/50' : ''}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                onClick={() => handleUpgrade("Starter")}
              >
                Upgrade to Starter
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-white/10 border-white/20 text-white relative">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="text-4xl font-bold">$19.99</div>
              <div className="text-white/70">per month</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${!feature.included ? 'text-white/50' : ''}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                onClick={() => handleUpgrade("Premium")}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Credit System Explanation */}
        <Card className="bg-white/10 border-white/20 text-white mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">How Credits Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">1 Credit</div>
                <div className="text-sm">Basic Soul Hug Creation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">1 Credit</div>
                <div className="text-sm">AI Prompt Regeneration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">2 Credits</div>
                <div className="text-sm">Premium Audio Features</div>
              </div>
            </div>
            <div className="text-center mt-6 text-white/80">
              Credits refresh monthly with your subscription. Unused credits don't roll over.
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-white/10 border-white/20 text-white mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-white/80 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens to unused credits?</h3>
              <p className="text-white/80 text-sm">Credits are refreshed monthly and don't carry over. Use them to create amazing Soul Hugs!</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-white/80 text-sm">Every new user starts with 3 free credits to experience the platform. No trial needed!</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-white/80 text-sm">You can cancel anytime from your account settings. You'll keep access until the end of your billing period.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={() => setLocation("/")}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}