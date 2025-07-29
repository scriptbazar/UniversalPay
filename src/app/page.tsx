
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DollarSign, ShieldCheck, Code, Globe, Zap, Users, Shuffle, Settings, AppWindow, FileText, Repeat, Briefcase, Link as LinkIcon, LayoutGrid, Check, ArrowRight, UserCircle, Quote } from "lucide-react";
import OrbitingCurrencies from "@/components/OrbitingCurrencies";
import Link from "next/link";
import React from "react";
import Image from "next/image";

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

const testimonials = [
  {
    quote: "UniversalPay has been a game-changer for our business. The ability to accept payments globally has allowed us to scale faster than ever.",
    name: "Aarav Sharma",
    title: "Founder, TechInnovate",
    avatar: "https://placehold.co/100x100.png?text=AS"
  },
  {
    quote: "The developer-friendly APIs and clear documentation made integration a breeze. We were up and running in a single afternoon.",
    name: "Priya Singh",
    title: "Lead Developer, CreativeGoods",
    avatar: "https://placehold.co/100x100.png?text=PS"
  },
  {
    quote: "As a reseller, the white-label solution is exactly what I needed. I can manage my clients under my own brand.",
    name: "Rohan Mehta",
    title: "CEO, PayRight Solutions",
    avatar: "https://placehold.co/100x100.png?text=RM"
  },
  {
    quote: "The fraud detection system saved us from a major headache. It's incredibly smart and gives us peace of mind.",
    name: "Sneha Gupta",
    title: "E-commerce Manager, DesiCrafts",
    avatar: "https://placehold.co/100x100.png?text=SG"
  },
  {
    quote: "Receiving all our international payments in crypto has simplified our accounting tremendously. Highly recommended!",
    name: "Vikram Reddy",
    title: "CFO, Global Exports",
    avatar: "https://placehold.co/100x100.png?text=VR"
  },
  {
    quote: "Their support team is top-notch. Quick, responsive, and always helpful whenever we have a question.",
    name: "Anjali Desai",
    title: "Operations Head, EventMasters",
    avatar: "https://placehold.co/100x100.png?text=AD"
  },
  {
    quote: "Payment links are so easy to create and share. It's perfect for our social media sales.",
    name: "Karan Kapoor",
    title: "Owner, The Style Hub",
    avatar: "https://placehold.co/100x100.png?text=KK"
  },
  {
    quote: "We switched from a traditional gateway and our transaction success rate went up by 15%. Incredible!",
    name: "Nidhi Jain",
    title: "Product Manager, LearnWell",
    avatar: "https://placehold.co/100x100.png?text=NJ"
  },
  {
    quote: "The invoicing feature is a lifesaver for our B2B clients. Professional, simple, and effective.",
    name: "Amit Patel",
    title: "Director, Visionary Solutions",
    avatar: "https://placehold.co/100x100.png?text=AP"
  },
  {
    quote: "Finally, a payment gateway that truly understands the Indian market and global aspirations.",
    name: "Deepika Verma",
    title: "Startup Advisor",
    avatar: "https://placehold.co/100x100.png?text=DV"
  },
  {
    quote: "The analytics dashboard gives us clear insights into our revenue streams. Data-driven decisions are now easier.",
    name: "Manish Kumar",
    title: "Analyst, DataWise",
    avatar: "https://placehold.co/100x100.png?text=MK"
  },
  {
    quote: "The white-label solution has allowed us to offer a branded payment experience without the development overhead.",
    name: "Sunita Rao",
    title: "Agency Owner, BrandUp",
    avatar: "https://placehold.co/100x100.png?text=SR"
  },
  {
    quote: "Accepting crypto payments has opened up a whole new international customer base for us.",
    name: "Rajesh Singh",
    title: "Digital Artist",
    avatar: "https://placehold.co/100x100.png?text=RS"
  },
  {
    quote: "The reliability is what impresses me the most. We've had zero downtime since we switched to UniversalPay.",
    name: "Pooja Hegde",
    title: "CTO, Reliable Hosting",
    avatar: "https://placehold.co/100x100.png?text=PH"
  },
  {
    quote: "Their currency conversion rates are very competitive, which saves us a lot of money on fees.",
    name: "Arjun Verma",
    title: "Importer/Exporter",
    avatar: "https://placehold.co/100x100.png?text=AV"
  },
  {
    quote: "The subscription feature is robust and easy to set up. It's perfect for our SaaS business model.",
    name: "Isha Malhotra",
    title: "Founder, AppSuite",
    avatar: "https://placehold.co/100x100.png?text=IM"
  },
  {
    quote: "Simple, powerful, and effective. UniversalPay just works, and it works beautifully.",
    name: "Harish Gupta",
    title: "Consultant",
    avatar: "https://placehold.co/100x100.png?text=HG"
  },
  {
    quote: "The ability to customize the checkout page with our own branding is a huge plus.",
    name: "Meera Krishnan",
    title: "Designer, Artful Things",
    avatar: "https://placehold.co/100x100.png?text=MK"
  },
  {
    quote: "UniversalPay's platform is incredibly intuitive. I didn't even need to read the docs to get started.",
    name: "Sanjay Reddy",
    title: "Indie Hacker",
    avatar: "https://placehold.co/100x100.png?text=SR"
  },
  {
    quote: "This is the payment solution we've been waiting for. It bridges the gap between traditional and digital finance.",
    name: "Anita Bose",
    title: "Fintech Blogger",
    avatar: "https://placehold.co/100x100.png?text=AB"
  }
];


const howItWorksSteps = [
    {
        icon: <UserCircle className="w-10 h-10 text-primary" />,
        title: "Create Your Account",
        description: "Sign up for a free account in minutes. No credit card required to get started."
    },
    {
        icon: <Settings className="w-10 h-10 text-primary" />,
        title: "Configure Your Wallet",
        description: "Link your preferred cryptocurrency wallet (USDT, BTC, etc.) to receive settlements."
    },
    {
        icon: <Zap className="w-10 h-10 text-primary" />,
        title: "Start Accepting Payments",
        description: "Use our SDKs, Payment Links, or Invoicing system to start receiving payments from anywhere in the world."
    },
     {
        icon: <LayoutGrid className="w-10 h-10 text-primary" />,
        title: "Track & Analyze",
        description: "Monitor your sales, track transactions, and gain insights with our comprehensive dashboard."
    }
]


export default function Home() {
  const halfLength = Math.ceil(faqItems.length / 2);
  const firstHalfFaqs = faqItems.slice(0, halfLength);
  const secondHalfFaqs = faqItems.slice(halfLength);
  
  const testimonialsRow1 = testimonials.slice(0, 10);
  const testimonialsRow2 = testimonials.slice(10, 20);

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
        
        <section className="py-20 px-4 md:px-8 bg-muted">
            <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Go Live in Minutes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {howItWorksSteps.map((step, index) => (
                        <Card key={index} className="text-center bg-card">
                            <CardContent className="pt-6">
                                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="features" className="py-20 px-4 md:px-8 bg-background">
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
        
        <section className="py-20 px-4 md:px-8 bg-muted overflow-hidden">
            <div className="container mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold">One Platform, Global Reach</h2>
                    <p className="text-lg text-muted-foreground">
                        From local payments in India to cross-border crypto transactions, UniversalPay provides the infrastructure you need to scale. Accept payments from customers worldwide in their local currencies, and receive settlements in yours.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                            <span>Unified dashboard for all your global and local transactions.</span>
                        </li>
                        <li className="flex items-start">
                             <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                            <span>Automatic currency conversion at competitive rates.</span>
                        </li>
                         <li className="flex items-start">
                             <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                            <span>Secure crypto settlements to your preferred wallet.</span>
                        </li>
                    </ul>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/#features">Explore Global Payments <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </div>
                <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                    <OrbitingCurrencies />
                 </div>
            </div>
        </section>
        
        <section id="testimonials" className="py-20 px-4 md:px-8 bg-background overflow-hidden">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Customers Say</h2>
             <div className="relative space-y-4">
                <div className="overflow-hidden">
                    <div className="flex animate-marquee-right space-x-4 w-max">
                        {[...testimonialsRow1, ...testimonialsRow1].map((testimonial, index) => (
                          <Card key={`r1-${index}`} className="flex-shrink-0" style={{width: '320px'}}>
                            <CardContent className="p-6 space-y-4">
                                <Quote className="w-8 h-8 text-primary/30" />
                                <p className="text-sm text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex flex-row items-center gap-4 pt-0">
                                <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <CardTitle className="text-sm font-bold">{testimonial.name}</CardTitle>
                                    <CardDescription>{testimonial.title}</CardDescription>
                                </div>
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                </div>
                 <div className="overflow-hidden">
                    <div className="flex animate-marquee-left space-x-4 w-max">
                        {[...testimonialsRow2, ...testimonialsRow2].map((testimonial, index) => (
                           <Card key={`r2-${index}`} className="flex-shrink-0" style={{width: '320px'}}>
                             <CardContent className="p-6 space-y-4">
                                <Quote className="w-8 h-8 text-primary/30" />
                                <p className="text-sm text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex flex-row items-center gap-4 pt-0">
                                <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <CardTitle className="text-sm font-bold">{testimonial.name}</CardTitle>
                                    <CardDescription>{testimonial.title}</CardDescription>
                                </div>
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-4 md:px-8 bg-muted">
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

        <section id="faq" className="py-20 px-4 md:px-8 bg-background">
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
