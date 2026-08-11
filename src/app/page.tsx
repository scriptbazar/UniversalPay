'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign, ShieldCheck, Code, Globe, Zap, Users, Shuffle, Settings, 
  FileText, Repeat, Link as LinkIcon, LayoutGrid, Check, ArrowRight, 
  UserCircle, Quote, Sparkles, QrCode, Wallet, ArrowUpRight, Copy, CheckCircle2,
  Lock, RefreshCw, CreditCard, ChevronRight, Activity, Terminal, ExternalLink,
  Shield, Cpu, Flame, CheckCircle, Smartphone
} from "lucide-react";
import OrbitingCurrencies from "@/components/OrbitingCurrencies";
import Link from "next/link";
import Image from "next/image";

// Sample live transaction feed stream
const sampleTransactions = [
  { id: "TX-9921", amount: "₹4,999.00", crypto: "$60.00 USDT", status: "Verified ⚡", source: "UPI / Paytm", country: "🇮🇳 India" },
  { id: "TX-9922", amount: "$149.00 USD", crypto: "0.00229 BTC", status: "Settled ⚡", source: "Credit Card", country: "🇺🇸 USA" },
  { id: "TX-9923", amount: "€210.00 EUR", crypto: "0.0617 ETH", status: "Settled ⚡", source: "SEPA Bank", country: "🇩🇪 Germany" },
  { id: "TX-9924", amount: "₹12,500.00", crypto: "$150.00 USDT", status: "Verified ⚡", source: "PhonePe UPI", country: "🇮🇳 India" },
];

const codeSnippets = {
  nodejs: `import { UniversalPay } from '@universalpay/sdk';

const pay = new UniversalPay({
  apiKey: process.env.UNIVERSALPAY_SECRET_KEY,
  environment: 'production'
});

// Create a multi-currency checkout session
const session = await pay.checkout.create({
  amount: 99.00,
  currency: 'USD',
  settlementAsset: 'USDT_TRC20',
  customerEmail: 'alex@startup.com',
  metadata: { orderId: 'ORD-2026-981' }
});

console.log('Live Payment Gateway URL:', session.url);`,
  python: `from universalpay import UniversalPay

client = UniversalPay(api_key="sk_live_universal_99812")

# Create instant UPI & Crypto checkout link
session = client.checkout.create(
    amount=99.00,
    currency="USD",
    settlement_asset="USDT_TRC20",
    customer_email="alex@startup.com"
)

print("Checkout Gateway Active:", session.url)`,
  go: `package main

import (
    "fmt"
    "github.com/universalpay/sdk-go"
)

func main() {
    client := universalpay.New("sk_live_universal_99812")

    session, _ := client.Checkout.Create(&universalpay.Params{
        Amount:          99.00,
        Currency:        "USD",
        SettlementAsset: "USDT_TRC20",
    })

    fmt.Println("Payment URL:", session.URL)
}`,
  php: `<?php
require_once('vendor/autoload.php');

$client = new \UniversalPay\Client('sk_live_universal_99812');

$session = $client->checkout->create([
    'amount' => 99.00,
    'currency' => 'USD',
    'settlement_asset' => 'USDT_TRC20'
]);

header("Location: " . $session->url);`,
  react: `import { UniversalCheckoutModal } from '@universalpay/react';

export default function PayButton() {
  return (
    <UniversalCheckoutModal
      apiKey="pk_live_public_88192"
      amount={99.00}
      settleIn="USDT"
      onSuccess={(tx) => console.log('Tx Verified:', tx.id)}
    >
      <button className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl">
        Pay via UPI or Crypto
      </button>
    </UniversalCheckoutModal>
  );
}`
};

const capabilities = [
  {
    icon: <Smartphone className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
    title: "Indian UPI Payment Rails",
    description: "Accept instant payments via Paytm, PhonePe, Google Pay, and BHIM with dynamic QR code generation.",
    badge: "Instant UPI"
  },
  {
    icon: <Wallet className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
    title: "Global Crypto Liquidity",
    description: "Direct self-custody settlements in USDT (TRC20/ERC20), BTC, ETH, and SOL without bank holding periods.",
    badge: "Zero Delays"
  },
  {
    icon: <Cpu className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
    title: "AI Fraud Prevention Shield",
    description: "Real-time AI risk assessment engine checks IP reputation, card risk score, and transaction anomaly telemetry.",
    badge: "99.9% Protection"
  },
  {
    icon: <Repeat className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
    title: "Recurring Billing Engine",
    description: "Automate SaaS subscriptions, trial periods, tiered memberships, and automatic invoice retry schedules.",
    badge: "Automated MRR"
  },
  {
    icon: <Code className="w-6 h-6 text-pink-500 dark:text-pink-400" />,
    title: "Developer REST & Webhook APIs",
    description: "Sub-100ms API response times with HMAC signatures, retry policies, and sandbox testing environments.",
    badge: "Developer First"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-500 dark:text-teal-400" />,
    title: "White-Label Brand Customization",
    description: "Deploy checkouts under your own custom domain, brand colors, logo, and localized multilingual text.",
    badge: "Custom Domain"
  },
  {
    icon: <FileText className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
    title: "Automated Digital Invoicing",
    description: "Create, send, and track PDF & digital invoices with integrated checkout links dispatched directly to client emails.",
    badge: "PDF Invoices"
  },
  {
    icon: <Zap className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
    title: "Dynamic Payment Links",
    description: "Generate single or reusable payment links for social media, WhatsApp, Telegram, and email sales in seconds.",
    badge: "Instant Links"
  }
];

const pricingTiers = [
  {
    name: "Starter",
    priceMonthly: "$0",
    priceAnnual: "$0",
    desc: "For indie developers and freelancers starting out.",
    features: [
      "Up to 100 transactions/mo",
      "Standard UPI & Crypto Checkout",
      "Standard Fraud Protection",
      "Community & Email Support",
      "Real-time Dashboard Analytics"
    ],
    cta: "Get Started Free",
    isPopular: false
  },
  {
    name: "Growth Scale",
    priceMonthly: "$39",
    priceAnnual: "$29",
    desc: "For scaling SaaS apps, startups & digital stores.",
    features: [
      "Up to 10,000 transactions/mo",
      "Instant USDT/BTC/ETH Auto-Settlement",
      "AI Anti-Fraud Security Shield",
      "Full REST API & Webhooks Access",
      "Custom Checkout Theme & Branding",
      "24/7 Priority Support"
    ],
    cta: "Start 14-Day Free Trial",
    isPopular: true
  },
  {
    name: "Enterprise",
    priceMonthly: "$99",
    priceAnnual: "$79",
    desc: "For high-volume merchants & enterprise platforms.",
    features: [
      "Unlimited Monthly Processing",
      "Full White-Label Custom Domain",
      "Dedicated Account Manager",
      "99.99% SLA Uptime Guarantee",
      "Direct Liquidity & Custom FX Spread",
      "Custom Webhook Integration"
    ],
    cta: "Contact Sales",
    isPopular: false
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upi' | 'crypto'>('upi');
  const [activeCodeLang, setActiveCodeLang] = useState<'nodejs' | 'python' | 'go' | 'php' | 'react'>('nodejs');
  const [copied, setCopied] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  
  // Converter States
  const [amount, setAmount] = useState<number>(100);
  const [fiat, setFiat] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [cryptoAsset, setCryptoAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'SOL'>('USDT');

  // Live transaction stream index
  const [txIndex, setTxIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTxIndex((prev) => (prev + 1) % sampleTransactions.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCryptoEstimate = () => {
    const inUsd = fiat === 'INR' ? amount / 83.5 : fiat === 'EUR' ? amount * 1.08 : amount;
    switch (cryptoAsset) {
      case 'USDT': return inUsd.toFixed(2);
      case 'BTC': return (inUsd / 65000).toFixed(6);
      case 'ETH': return (inUsd / 3400).toFixed(4);
      case 'SOL': return (inUsd / 145).toFixed(3);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-cyan-500/30 selection:text-cyan-300 font-sans overflow-x-hidden transition-colors duration-200">
      
      {/* Top Cyber Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/20 py-2.5 px-4 text-center text-xs font-medium text-cyan-300 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>UniversalPay 2.0 Active: Instant Zero-Slippage UPI to Crypto Liquidity Engine</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>

      <Header />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-28 md:pt-24 md:pb-36 px-4 bg-grid-cyber overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-5 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
              
              {/* Hero Left Content */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-semibold tracking-wide backdrop-blur-xl shadow-sm">
                  <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                  <span>The Hybrid Payment Standard for Web3 & Web2</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08]">
                  Accept Payments <br />
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient-text">
                    Globally & Settle
                  </span>{" "}
                  Instantly.
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Connect Indian UPI payment rails (Paytm, PhonePe, GPay) and global crypto assets (USDT, BTC, ETH) with zero friction. Receive direct settlements into your self-custody wallet.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white dark:text-black shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-[1.02]">
                    <Link href="/signup">
                      Start Integration Free <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-cyan-500/40 text-foreground hover:bg-cyan-500/10 backdrop-blur-xl">
                    <Link href="/#converter">
                      Try Converter Demo
                    </Link>
                  </Button>
                </div>

                {/* Live Stats */}
                <div className="pt-8 border-t border-border grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-foreground">$148.5M+</div>
                    <div className="text-xs text-muted-foreground font-medium">Volume Processed</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">&lt; 2.1s</div>
                    <div className="text-xs text-muted-foreground font-medium">Avg Settlement</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">99.99%</div>
                    <div className="text-xs text-muted-foreground font-medium">Platform Uptime</div>
                  </div>
                </div>

              </div>

              {/* Hero Right Interactive Checkout Simulation Card */}
              <div className="flex-1 w-full max-w-md lg:max-w-lg animate-float-slow">
                <div className="glass-panel-glow rounded-3xl p-6 relative space-y-5">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/40 text-[11px] font-mono">
                      Live Checkout Terminal
                    </Badge>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Merchant Invoice #8841</div>
                      <div className="text-2xl font-black text-foreground">₹4,999.00 <span className="text-xs text-muted-foreground font-normal">($60.00 USD)</span></div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Instant
                    </span>
                  </div>

                  {/* Method Toggle */}
                  <div className="grid grid-cols-2 gap-2 bg-muted p-1.5 rounded-xl border border-border">
                    <button 
                      onClick={() => setActiveTab('upi')}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'upi' ? 'bg-cyan-500 text-white dark:text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <QrCode className="w-4 h-4" /> UPI Dynamic QR
                    </button>
                    <button 
                      onClick={() => setActiveTab('crypto')}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'crypto' ? 'bg-cyan-500 text-white dark:text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Wallet className="w-4 h-4" /> Web3 Crypto
                    </button>
                  </div>

                  {/* View Display */}
                  {activeTab === 'upi' ? (
                    <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center space-y-3 text-center relative overflow-hidden shadow-sm">
                      <div className="p-3 bg-white rounded-2xl shadow-md border relative">
                        <QrCode className="w-32 h-32 text-slate-950" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-cyan-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">UPI</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Scan with Paytm, GPay, PhonePe, or BHIM</p>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Listening for incoming payload...
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card p-5 rounded-2xl border border-border space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Settlement Asset</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">USDT (TRC-20)</span>
                      </div>
                      <div className="bg-muted p-3 rounded-xl font-mono text-[11px] text-foreground flex items-center justify-between border border-border">
                        <span>T9yD14Nj9x...82mKL</span>
                        <Copy className="w-4 h-4 cursor-pointer hover:text-cyan-500" />
                      </div>
                      <div className="flex justify-between text-muted-foreground pt-1">
                        <span>Network Fee: <strong className="text-foreground">$0.00</strong></span>
                        <span>Confirmation: <strong className="text-emerald-600 dark:text-emerald-400">Instant</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Simulated Live Transaction Stream Widget */}
                  <div className="bg-muted p-3 rounded-xl border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      <span>Live Gateway Feed</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Streaming</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-foreground">{sampleTransactions[txIndex].amount}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-mono">{sampleTransactions[txIndex].crypto}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">{sampleTransactions[txIndex].status}</Badge>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* REAL-TIME CURRENCY CONVERTER TERMINAL */}
        <section id="converter" className="py-20 px-4 bg-muted/40 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center space-y-3 mb-12">
              <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 text-xs">
                Real-Time Calculator
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Instant Currency Settlement Estimator</h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Test how your collected customer payments convert automatically into self-custody crypto.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto space-y-6 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* Input Fiat */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer Pays</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="h-12 bg-card border-border text-lg font-bold text-foreground focus:border-cyan-500"
                    />
                    <select 
                      value={fiat}
                      onChange={(e) => setFiat(e.target.value as any)}
                      className="bg-card border border-border rounded-xl px-3 font-bold text-sm text-cyan-600 dark:text-cyan-400 focus:outline-none"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Output Crypto */}
                <div className="space-y-3 bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">You Receive</label>
                    <select 
                      value={cryptoAsset}
                      onChange={(e) => setCryptoAsset(e.target.value as any)}
                      className="bg-muted border border-border rounded-lg px-2 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400"
                    >
                      <option value="USDT">USDT (Tether)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="SOL">SOL (Solana)</option>
                    </select>
                  </div>

                  <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    {getCryptoEstimate()} <span className="text-base font-bold text-muted-foreground">{cryptoAsset}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                    <span>Slippage: <strong className="text-emerald-600 dark:text-emerald-400">0.00%</strong></span>
                    <span>Liquidity: <strong className="text-cyan-600 dark:text-cyan-400">Institutional</strong></span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES GRID */}
        <section id="features" className="py-28 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            
            <div className="text-center space-y-4 mb-20">
              <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 text-xs">
                Built for High-Growth Tech
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Engineered for Unlimited Scale
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                Everything required to accept global payments, manage customer subscriptions, and automate payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map((cap, idx) => (
                <div 
                  key={idx}
                  className="glass-panel p-6 rounded-3xl space-y-4 border border-border hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      {cap.icon}
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* DEVELOPER CODE STUDIO */}
        <section id="developers" className="py-28 px-4 bg-muted/30 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30 text-xs">
                Developer Documentation
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">Integrate in Minutes, Not Weeks</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Native SDKs with typed responses, Webhook retry queues, and pre-built checkout modals.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-2xl">
              
              {/* Window Header */}
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">universalpay-sdk</span>
                </div>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleCopyCode}
                  className="h-8 text-xs font-mono text-cyan-400 hover:bg-slate-800"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Code'}
                </Button>
              </div>

              {/* Language Selector */}
              <Tabs value={activeCodeLang} onValueChange={(v) => setActiveCodeLang(v as any)} className="w-full">
                <div className="bg-slate-900/50 border-b border-slate-800 px-6">
                  <TabsList className="bg-transparent h-12 gap-4">
                    <TabsTrigger value="nodejs" className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none font-mono text-xs">Node.js</TabsTrigger>
                    <TabsTrigger value="python" className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none font-mono text-xs">Python</TabsTrigger>
                    <TabsTrigger value="go" className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none font-mono text-xs">Go SDK</TabsTrigger>
                    <TabsTrigger value="php" className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none font-mono text-xs">PHP</TabsTrigger>
                    <TabsTrigger value="react" className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none font-mono text-xs">React Component</TabsTrigger>
                  </TabsList>
                </div>

                {Object.entries(codeSnippets).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="p-6 font-mono text-xs sm:text-sm text-cyan-100 leading-relaxed overflow-x-auto m-0">
                    <pre><code>{code}</code></pre>
                  </TabsContent>
                ))}
              </Tabs>

            </div>

          </div>
        </section>

        {/* PRICING GRID */}
        <section id="pricing" className="py-28 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 text-xs">
                Transparent Pricing
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-foreground">Simple Plans for Every Stage</h2>
              <p className="text-muted-foreground text-base">No hidden settlement charges or surprise maintenance fees.</p>

              {/* Billing Toggle */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                <button 
                  onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 p-1 flex items-center transition-all"
                >
                  <div className={`w-4 h-4 rounded-full bg-cyan-500 transition-transform ${billing === 'annual' ? 'translate-x-6' : ''}`} />
                </button>
                <span className={`text-sm font-semibold ${billing === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Annual <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-1">(Save 25%)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {pricingTiers.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`glass-panel p-8 rounded-3xl flex flex-col justify-between relative transition-all duration-300 ${tier.isPopular ? 'border-2 border-cyan-500 shadow-xl bg-card scale-105 z-10' : 'border border-border bg-card'}`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white dark:text-black font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</p>
                    
                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-4xl sm:text-5xl font-black text-foreground">
                        {billing === 'annual' ? tier.priceAnnual : tier.priceMonthly}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">/month</span>
                    </div>

                    <ul className="space-y-3 pt-6 border-t border-border text-xs sm:text-sm">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-foreground">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Button 
                      asChild 
                      className={`w-full h-12 font-bold ${tier.isPopular ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white dark:text-black shadow-md' : 'border-border text-foreground hover:bg-muted'}`}
                      variant={tier.isPopular ? 'default' : 'outline'}
                    >
                      <Link href="/signup">{tier.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FINAL CYBER CTA BANNER */}
        <section className="py-24 px-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-t border-cyan-500/30 text-white relative overflow-hidden">
          <div className="container mx-auto max-w-4xl text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to Upgrade Your Global Checkout?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
              Start receiving payments via Indian UPI and Crypto with instant automated settlements today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-xl transition-all hover:scale-105">
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold border-2 border-white/70 bg-slate-900/60 hover:bg-white text-white hover:text-slate-950 transition-all shadow-lg backdrop-blur-md">
                <Link href="/dashboard/developer">Read Integration Docs</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
