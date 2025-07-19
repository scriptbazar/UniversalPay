import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DollarSign, ShieldCheck, Code, Globe, Zap, Users, Shuffle, Settings, AppWindow, FileText, Repeat, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    description: "Run your own payment gateway business. Onboard clients, manage their sales, and earn commissions.",
  },
];

const faqItems = [
    {
        question: "What is UniversalPay?",
        answer: "UniversalPay is a comprehensive payment gateway platform that allows businesses to accept a wide range of payments, including Indian UPI, international cryptocurrencies, and other country-specific methods. It's designed to be secure, scalable, and developer-friendly."
    },
    {
        question: "What currencies are supported?",
        answer: "We support all major Indian UPI platforms like Paytm, PhonePe, and BharatPe, as well as major cryptocurrencies such as Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Binance Coin (BNB). We also support local payment methods from various countries."
    },
    {
        question: "Is it secure?",
        answer: "Absolutely. Security is our top priority. We use an AI-powered fraud detection engine, maintain risk scores, and provide tools for manual oversight. All transactions are protected with industry-standard security protocols."
    },
    {
        question: "Can I use my own branding?",
        answer: "Yes! Our white-label feature allows you to use your own domain, logo, and branding to provide a seamless experience for your customers."
    },
    {
        question: "How do global payments work?",
        answer: "Your customers pay using their local payment method (like a credit card in the US or SEPA in Europe). Our system automatically converts the payment into your preferred cryptocurrency (like USDT or BTC) and settles it to your wallet."
    }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="text-center py-20 px-4 bg-card">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">The Future of Payments is Here</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A secure, scalable, and globally functional payment gateway. Integrate UPI, Crypto, and more with our powerful APIs and SDKs.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful Features for Modern Businesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg rounded-xl">
                  <CardHeader className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                      {feature.icon}
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
        
        <section className="py-20 px-4 md:px-8 bg-card">
            <div className="container mx-auto text-center">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform, Global Reach</h2>
                 <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                    From local payments in India to cross-border crypto transactions, UniversalPay provides the infrastructure you need to scale.
                 </p>
                 <Image 
                    src="https://placehold.co/1200x600/E5F5F9/29ABE2"
                    alt="Global Payments Map"
                    width={1200}
                    height={600}
                    data-ai-hint="world map payments"
                    className="rounded-lg shadow-2xl mx-auto"
                 />
            </div>
        </section>

        <section id="pricing" className="py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="flex flex-col rounded-xl shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">Free</CardTitle>
                  <CardDescription>For startups and small businesses</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold text-center mb-6">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Up to 100 transactions/month</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Basic UPI Support</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Email Support</li>
                  </ul>
                </CardContent>
                <div className="p-6">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </div>
              </Card>
              <Card className="flex flex-col rounded-xl shadow-lg border-2 border-primary relative">
                 <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold text-center mb-6">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Up to 1000 transactions/month</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> UPI & Crypto Support</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> API & SDK Access</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Priority Email Support</li>
                  </ul>
                </CardContent>
                <div className="p-6">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Choose Pro</Button>
                </div>
              </Card>
              <Card className="flex flex-col rounded-xl shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">Premium</CardTitle>
                  <CardDescription>For large-scale enterprises</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold text-center mb-6">$99<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> Unlimited transactions</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> White-Label & Reseller Mode</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> AI Fraud Prevention</li>
                    <li className="flex items-center"><Zap className="w-4 h-4 mr-2 text-green-500" /> 24/7 Dedicated Support</li>
                  </ul>
                </CardContent>
                <div className="p-6">
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 px-4 md:px-8 bg-card">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-medium">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
