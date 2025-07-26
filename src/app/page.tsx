
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DollarSign, ShieldCheck, Code, Globe, Zap, Users, Shuffle, Settings, AppWindow, FileText, Repeat, Briefcase, Link as LinkIcon, LayoutGrid, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import RealWorldMap from "@/components/RealWorldMap";

const features = [
  {
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    title: "Multi-Currency Support",
    description: "Accept payments in Indian UPI (Paytm, PhonePe) and International Cryptocurrencies (USDT, BTC, ETH).",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "AI Fraud Prevention",
    description: "Our smart fraud prevention system flags suspicious activity and maintains user/merchant risk scores.",
  },
  {
    icon: <Code className="w-8 h-8 text-primary" />,
    title: "Developer Friendly",
    description: "Integrate easily with our SDKs for PHP, Node.js, Flutter, React, and a JS Embedded Checkout Widget.",
  },
  {
    icon: <Globe className="w-8 h-8 text-primary" />,
    title: "Global Payment Methods",
    description: "Enable local payment methods for customers worldwide. They pay locally, you get settled globally in crypto.",
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Simplified Crypto Payouts",
    description: "Receive all your payments directly in your preferred cryptocurrency, eliminating cross-border complexity.",
  },
    {
    icon: <Repeat className="w-8 h-8 text-primary" />,
    title: "Subscription Models",
    description: "Create and manage recurring billing plans for your customers to automate monthly payments.",
  },
  {
    icon: <Shuffle className="w-8 h-8 text-primary" />,
    title: "Automatic Currency Conversion",
    description: "Customers pay in their native currency, and our system automatically converts it to your chosen crypto.",
  },
   {
    icon: <AppWindow className="w-8 h-8 text-primary" />,
    title: "White-Label Solution",
    description: "Use your own domain and branding. Resellers can manage client merchants under their own brand.",
  },
   {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Invoicing System",
    description: "Create and send professional online invoices with payment links directly from your dashboard.",
  },
   {
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    title: "Reseller Program",
    description: "Run your own payment gateway business. Onboard clients, manage their sales, and earn a commission.",
  },
  {
    icon: <LinkIcon className="w-8 h-8 text-primary" />,
    title: "Dynamic Payment Links",
    description: "Easily generate and share payment links for single or multiple use, with fixed or dynamic amounts.",
  },
  {
    icon: <LayoutGrid className="w-8 h-8 text-primary" />,
    title: "Comprehensive Dashboard",
    description: "Manage all your transactions, analytics, withdrawals, and customers from one powerful dashboard.",
  },
];

const faqItems = [
    {
        question: "What is UniversalPay?",
        answer: "UniversalPay is a comprehensive payment gateway platform that allows businesses to accept a wide range of payments, including Indian UPI, international cryptocurrencies, and other country-specific methods. It's designed to be secure, scalable, and developer-friendly."
    },
    {
        question: "What currencies are supported?",
        answer: "We support all major Indian UPI platforms like Paytm, PhonePe, and BharatPe, as well as major cryptocurrencies such as Bitcoin (BTC), Ethereum (ETH), and Tether (USDT). We also support local payment methods from various countries, which are automatically converted for you."
    },
    {
        question: "Is it secure?",
        answer: "Absolutely. Security is our top priority. We use an AI-powered fraud detection engine, maintain risk scores, and provide tools for manual oversight. All transactions are protected with industry-standard security protocols."
    },
    {
        question: "Can I use my own branding?",
        answer: "Yes! Our white-label feature on the Premium plan allows you to use your own domain, logo, and branding to provide a seamless checkout experience for your customers."
    },
    {
        question: "How do global payments work?",
        answer: "Your customers pay using their local payment method (like a credit card in the US or SEPA in Europe). Our system automatically converts the payment into your preferred cryptocurrency (like USDT or BTC) and settles it to your wallet."
    },
    {
        question: "What do you have for developers?",
        answer: "We provide comprehensive SDKs for popular languages like PHP, Node.js, and Python, as well as frameworks like React and Flutter. We also offer a simple embedded Javascript widget for easy integration on any website."
    },
    {
        question: "Can I set up recurring payments or subscriptions?",
        answer: "Yes, our platform supports subscription models. You can create different billing plans and manage recurring payments directly from your merchant dashboard, automating your monthly revenue stream."
    },
    {
        question: "How does the automatic currency conversion work?",
        answer: "When a customer from another country pays, they see the price in their local currency. Our system handles the real-time conversion at competitive rates and settles the final amount in your chosen cryptocurrency, so you don't have to worry about exchange rate fluctuations."
    },
    {
        question: "What is the white-label solution?",
        answer: "The white-label solution, available on our Premium plan, allows you to completely rebrand the payment gateway as your own. You can use your custom domain, logo, and color scheme. It's perfect for agencies and resellers."
    },
    {
        question: "How does the reseller program work?",
        answer: "Our reseller program allows you to act as a payment provider for your own clients. You can onboard and manage multiple sub-merchants under your reseller account, track their sales, and earn a commission on their transaction volume."
    }
]

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
    popular: true,
  },
  {
    name: "Premium",
    price: "$99",
    freq: "/month",
    description: "For established businesses and enterprises at scale.",
    features: [
      "Unlimited transactions",
      "White-Label & Reseller Mode",
      "Advanced Fraud Controls",
      "All Country-Specific Methods",
      "24/7 Dedicated Support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];


export default function Home() {
  const halfLength = Math.ceil(faqItems.length / 2);
  const firstHalfFaqs = faqItems.slice(0, halfLength);
  const secondHalfFaqs = faqItems.slice(halfLength);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="text-center py-20 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">The Future of Payments is Here</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A secure, scalable, and globally functional payment gateway. Integrate UPI, Crypto, and more with our powerful APIs and SDKs.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful Features for Modern Businesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card border group" variant="interactive">
                  <CardHeader className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110">
                      <div className="transition-transform duration-300 group-hover:animate-bounce-subtle">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 px-4 md:px-8 bg-card/50">
            <div className="container mx-auto text-center">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform, Global Reach</h2>
                 <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                    From local payments in India to cross-border crypto transactions, UniversalPay provides the infrastructure you need to scale.
                 </p>
                 <div className="rounded-lg shadow-2xl mx-auto overflow-hidden bg-background">
                    <RealWorldMap />
                 </div>
            </div>
        </section>

        <section id="pricing" className="py-20 px-4 md:px-8">
            <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
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
                        <Button className={`w-full ${tier.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`} variant={tier.popular ? 'default' : 'outline'}>
                          {tier.cta}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
            </div>
        </section>

        <section id="faq" className="py-20 px-4 md:px-8 bg-card/50">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {firstHalfFaqs.map((item, index) => (
                            <AccordionItem value={`item-1-${index}`} key={index}>
                                <AccordionTrigger className="text-lg font-medium text-left">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Accordion type="single" collapsible className="w-full">
                        {secondHalfFaqs.map((item, index) => (
                            <AccordionItem value={`item-2-${index}`} key={index}>
                                <AccordionTrigger className="text-lg font-medium text-left">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
