<p align="center">
  <img src="https://img.icons8.com/isometric/96/000000/cyber-security.png" alt="UniversalPay Logo" width="100">
</p>

<h1 align="center">UniversalPay — Hybrid Web3 & UPI Global Payment Gateway</h1>

<p align="center">
  A high-throughput, enterprise-grade payment infrastructure connecting local Indian UPI rails with global cryptocurrency liquidity. Built with Next.js 16, React 19, Turbopack, Firebase, Genkit AI, and Tailwind CSS.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-v16.3-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-v19.0-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Build-Turbopack-pink?logo=turbopack" alt="Turbopack">
  <img src="https://img.shields.io/badge/TypeScript-v5.8-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v3.4-blueviolet?logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Firebase-v10-orange?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/AI_Engine-Genkit_1.14-cyan?logo=google-gemini" alt="Genkit AI">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## 🌟 Executive Overview

**UniversalPay** is a full-stack, next-generation payment gateway engineered to eliminate cross-border financial friction. It allows merchants, SaaS platforms, digital creators, and e-commerce stores to accept payments from customers worldwide in their native local payment methods (such as **Indian UPI**, Debit/Credit cards, SEPA, etc.) while automatically settling proceeds into **self-custody cryptocurrency wallets (USDT, BTC, ETH, SOL)** in real time.

By integrating direct liquidity conversion, AI-driven fraud telemetry, and white-label checkout capabilities, UniversalPay provides a unified financial bridge between traditional fiat banking systems and decentralized crypto assets.

---

## ✨ Key Features & Architecture

### 1. 💳 Hybrid Payment Checkout Engine
- **Indian UPI Rails**: Dynamic QR code generation supporting Paytm, PhonePe, Google Pay, BHIM, and bank UPI apps.
- **Web3 Multi-Chain Crypto**: Direct wallet payments in Tether (USDT TRC20/ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL).
- **Simulated Real-Time Status Feed**: WebSocket & HTTP polling updates for instant order fulfillment signals.

### 2. 💱 Real-Time Institutional FX Conversion Engine
- Live zero-slippage rate calculator converting customer payments from **INR, USD, EUR, GBP, JPY** to **USDT, BTC, ETH, SOL**.
- Transparent fee estimation with guaranteed exchange rate locks during checkout sessions.

### 3. 🤖 AI-Powered Risk & Fraud Prevention Shield
- Integrated **Genkit AI** telemetry that computes risk scores based on IP geolocation reputation, transaction velocity, card fraud indicators, and anomaly detection algorithms.

### 4. 📊 Merchant & Admin Portals
- **Merchant Dashboard**: Real-time sales telemetry, payout request logs, payment link management, automated digital PDF invoicing, and API secret key configuration.
- **Admin Control Center**: Platform-wide transaction audit logs, global merchant management, withdrawal approvals, and user role management.

### 5. 💻 Developer-First SDKs & Webhooks
- Multi-language SDK support (**Node.js, Python, Go, PHP, React**) with typed request payloads.
- Secure Webhook event dispatchers signed with HMAC SHA-256 for automated server-to-server notifications.

### 6. 🎨 White-Label Customization
- Premium plan merchants can deploy checkouts under custom domains with custom brand primary colors, logos, and localized multilingual text.

---

## 📂 Project Directory Structure

```
UniversalPay/
├── src/
│   ├── ai/                      # Genkit AI flows & risk scoring engine
│   │   ├── flows/
│   │   │   ├── paymentFlow.ts
│   │   │   └── withdrawalFlow.ts
│   │   └── genkit.ts
│   ├── app/                     # Next.js 16 App Router pages
│   │   ├── (auth)/              # Login, Signup, Forgot Password
│   │   ├── (legal)/             # Terms, Privacy, Cookies, Support
│   │   ├── dashboard/           # Merchant & Admin Dashboard Pages
│   │   │   ├── analytics/       # Analytics & Revenue Reports
│   │   │   ├── audit-logs/      # Security & Audit Logs
│   │   │   ├── currency-converter/
│   │   │   ├── customers/       # Customer Records
│   │   │   ├── developer/       # API Keys & SDK Guides
│   │   │   ├── error-logs/      # System Telemetry
│   │   │   ├── fraud-detection/ # AI Fraud Risk Engine
│   │   │   ├── invoices/        # PDF Invoice Generator
│   │   │   ├── payment-links/   # Dynamic Payment Links
│   │   │   ├── payments/        # Live Payments Feed
│   │   │   ├── settings/        # Account Configuration
│   │   │   ├── subscriptions/   # MRR Subscription Billing
│   │   │   ├── support/         # Customer Support Ticketing
│   │   │   └── withdrawals/     # Crypto Payout Requests
│   │   ├── merchant/            # Merchant Activity & Wallet Views
│   │   ├── pay/[slug]/          # Public Customer Checkout Page
│   │   ├── globals.css          # Theme Tokens & Cyber Animations
│   │   ├── layout.tsx           # Root Theme Provider & Fonts
│   │   └── page.tsx             # Next-Level Dark/Light Homepage
│   ├── components/              # UI Components & Custom Widgets
│   │   ├── ui/                  # Shadcn Radix Primitives (Button, Card, Tabs, etc.)
│   │   ├── DeveloperTools.tsx   # SDK & Plugin Installation Studio
│   │   ├── Header.tsx           # Header Navigation & Theme Toggle
│   │   ├── Footer.tsx           # Footer Links & Copyright
│   │   ├── Logo.tsx             # UniversalPay Logo Badge
│   │   ├── OrbitingCurrencies.tsx # Animated Orbiting Currency Graphic
│   │   ├── PaymentLinksManager.tsx
│   │   └── theme-toggle.tsx     # Light/Dark Theme Switcher
│   ├── functions/               # Firebase Cloud Functions (Node.js backend)
│   │   └── src/index.ts
│   ├── hooks/                   # Custom React Hooks (useToast, etc.)
│   └── lib/                     # Firebase Client & Admin SDK Setup
│       ├── auth.ts              # Firebase Authentication Helpers
│       ├── firebase.ts          # Client SDK Initialization
│       ├── firebaseAdmin.ts     # Server-side Firebase Admin SDK
│       ├── invoicesData.ts      # Invoice Data Layer
│       └── transactionsData.ts  # Transaction Storage Helpers
├── next.config.ts               # Next.js 16 Configuration
├── tailwind.config.ts           # Tailwind CSS Config & Keyframes
├── tsconfig.json                # TypeScript Strict Configuration
└── package.json                 # Node.js Dependencies & Scripts
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Node.js 20 recommended)
- **npm**: `v9.0.0` or higher
- **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/scriptbazar/UniversalPay.git
cd UniversalPay
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root directory:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABNmB1Op_cwat9iNDyztloLohEHjMLbiE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=universalpay-ir4yd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=universalpay-ir4yd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=universalpay-ir4yd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=573852939232
NEXT_PUBLIC_FIREBASE_APP_ID=1:573852939232:web:5181ba8a00ef787a583185

# Gemini AI / Genkit Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Service Account Key
GOOGLE_APPLICATION_CREDENTIALS=.service-account.json
```

### 4. Run the Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application live.

---

## 💻 SDK Integration Examples

### Node.js / Express
```typescript
import { UniversalPay } from '@universalpay/sdk';

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

console.log('Live Payment Gateway URL:', session.url);
```

### Python
```python
from universalpay import UniversalPay

client = UniversalPay(api_key="sk_live_universal_99812")

session = client.checkout.create(
    amount=99.00,
    currency="USD",
    settlement_asset="USDT_TRC20",
    customer_email="alex@startup.com"
)

print("Checkout Gateway URL:", session.url)
```

### React SDK Component
```tsx
import { UniversalCheckoutModal } from '@universalpay/react';

export default function PayButton() {
  return (
    <UniversalCheckoutModal
      apiKey="pk_live_public_88192"
      amount={99.00}
      settleIn="USDT"
      onSuccess={(tx) => console.log('Payment Verified:', tx.id)}
    >
      <button className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl">
        Pay via UPI or Crypto
      </button>
    </UniversalCheckoutModal>
  );
}
```

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack acceleration (`http://localhost:3000`).
- `npm run build`: Compiles the production bundle.
- `npm run start`: Runs the compiled Next.js production server.
- `npm run typecheck`: Runs strict TypeScript type checking (`tsc --noEmit`).
- `npm run lint`: Runs ESLint check across all codebase files.
- `npm run genkit:dev`: Starts the Genkit AI developer UI for testing flows.

---

## ☁️ Deployment Guide

### Firebase App Hosting / Vercel
1. Push your latest code changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Next.js 16 UI redesign, bug fixes & documentation"
   git push -u origin main
   ```
2. Link your GitHub repository in the **Firebase Console** (under *App Hosting*) or **Vercel Dashboard**.
3. Add the environment variables from `.env.local` to your deployment dashboard.
4. Automatic CI/CD will build and deploy every time you push to the `main` branch.

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Developed & Maintained by <a href="https://github.com/scriptbazar">ScriptBazar</a>
</p>
