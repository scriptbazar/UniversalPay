import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    freq: "/month",
    description: "Perfect for individuals and small businesses getting started.",
    features: [
      "Up to 100 transactions/month",
      "Basic UPI Gateway Support",
      "Standard Fraud Detection",
      "Email Support",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    freq: "/month",
    description: "Ideal for growing businesses that need more power and flexibility.",
    features: [
      "Up to 1,000 transactions/month",
      "UPI & Crypto Support",
      "AI-Powered Fraud Detection",
      "Developer API & SDK Access",
      "Priority Email Support",
    ],
    cta: "Choose Pro",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "$99",
    freq: "/month",
    description: "For established businesses and enterprises at scale.",
    features: [
      "Unlimited transactions",
      "White-Label Solution",
      "Advanced Fraud Controls",
      "All Country-Specific Methods",
      "24/7 Dedicated Support",
    ],
    cta: "Contact Sales",
    href: "mailto:support@universalpay.com",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Flexible Pricing for Every Business</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that&apos;s right for you. No hidden fees, no surprises.
            </p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`flex flex-col rounded-xl shadow-lg ${tier.popular ? 'border-2 border-primary' : ''}`}>
                  {tier.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="text-center mb-6">
                      <span className="text-5xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.freq}</span>
                    </div>
                    <ul className="space-y-4 flex-grow">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6">
                    <Button asChild className={`w-full ${tier.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`} variant={tier.popular ? 'default' : 'outline'}>
                      <a href={tier.href}>{tier.cta}</a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
