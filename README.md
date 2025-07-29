<p align="center">
  <img src="https://raw.githubusercontent.com/firebase/firebase-studio/main/static/img/universalpay-logo.png" alt="UniversalPay Logo" width="120">
</p>

<h1 align="center">UniversalPay</h1>

<p align="center">
  A secure, scalable, and globally functional payment gateway platform built with Next.js, Firebase, and Genkit.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.x-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Firebase-v10-orange?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Genkit-v1.x-blueviolet?logo=google-gemini" alt="Genkit">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-blueviolet?logo=tailwind-css" alt="Tailwind CSS">
</p>

---

## 📜 Introduction

UniversalPay is a feature-rich, third-party payment gateway designed to bridge the gap between traditional finance and the world of cryptocurrency. It provides merchants with the tools to accept a wide range of payment methods, including Indian UPI and international cryptocurrencies, while offering powerful administrative tools for platform management. The platform is architected to be secure, highly scalable, and developer-friendly, with a focus on providing a seamless experience for both merchants and their customers.

This project serves as a comprehensive example of building a full-stack, production-ready application using a modern tech stack.

---

## ✨ Key Features

UniversalPay is packed with features designed for modern businesses, from individual merchants to resellers managing their own clients.

-   **💳 Multi-Currency Support**: Accept payments via Indian UPI (Paytm, PhonePe) and major cryptocurrencies (USDT, BTC).
-   **🌍 Global Payment Methods**: Customers can pay using their local methods, and merchants receive settlements in their preferred cryptocurrency.
-   **🤖 AI-Powered Fraud Prevention**: A smart fraud detection system flags suspicious activities and maintains risk scores for users and transactions.
-   **📊 Comprehensive Dashboards**: Separate, feature-rich dashboards for both **Admins** (to oversee the platform) and **Merchants** (to manage their business).
-   **₿ Unified Crypto Settlements**: All payments, regardless of origin, are converted and settled directly into the merchant's chosen crypto wallet.
-   **</> Developer-Friendly Integration**:
    -   RESTful APIs and clear webhooks.
    -   SDKs for popular languages (Node.js, PHP, Python).
    -   Client-side libraries for frameworks like React and Vue.
    -   An easy-to-use embedded JS Widget for checkout on any website.
-   **🎨 White-Label & Reseller Mode**: Premium merchants can use their own branding, and resellers can manage their own portfolio of sub-merchants, earning commissions on their sales.
-   **🔄 Subscription & Invoicing**:
    -   Create and manage recurring billing plans.
    -   Generate and send professional online invoices with payment links.
-   **🔗 Dynamic Payment Tools**:
    -   **Payment Links**: Generate links for single or multiple uses with fixed or dynamic amounts.
    -   **Payment Pages**: Create customizable, permanent pages to accept payments.

---

## 🛠️ Tech Stack

This project is built using a modern, robust, and scalable technology stack.

-   **Frontend**: [Next.js](https://nextjs.org/) (with App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Cloud Functions)
-   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password, Social Logins)
-   **Generative AI**: [Google Gemini](https://ai.google/gemini/) via [Genkit (Firebase's GenAI Stack)](https://firebase.google.com/docs/genkit)
-   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 📂 Project Structure

The project follows a standard Next.js App Router structure, with logical separation for different user roles and functionalities.

```
.
├── src
│   ├── app
│   │   ├── (auth)          # Login, Signup, Forgot Password pages
│   │   ├── dashboard       # Admin-only dashboard routes
│   │   ├── merchant        # Merchant-only dashboard routes
│   │   ├── pay             # Public-facing payment pages
│   │   ├── globals.css     # Global styles and ShadCN theme
│   │   └── layout.tsx      # Root layout
│   ├── ai
│   │   ├── flows           # Genkit AI flows (e.g., payment processing, fraud detection)
│   │   └── genkit.ts       # Genkit initialization and configuration
│   ├── components
│   │   ├── ui              # Reusable ShadCN UI components
│   │   └── ...             # Other shared React components
│   ├── hooks
│   │   └── ...             # Custom React hooks
│   ├── lib
│   │   ├── firebase.ts     # Firebase client initialization
│   │   ├── auth.ts         # Authentication logic
│   │   └── ...             # Other data fetching/utility functions
│   └── functions           # Firebase Cloud Functions source code
│       └── src
│           └── index.ts    # Backend logic for roles and audit logs
├── .env.local.example      # Example environment variables
└── ...
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
-   A Firebase project.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/universalpay.git
cd universalpay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App**: In your project, add a new Web App and copy the `firebaseConfig` object.
3.  **Enable Firebase Services**:
    *   **Authentication**: Enable Email/Password and any social providers you wish to use (Google, GitHub, Facebook).
    *   **Firestore**: Create a Firestore database in your project.
4.  **Configure Environment Variables**:
    *   Rename `.env.local` to `.env`. This project uses a single `.env` file for simplicity.
    *   Paste your Firebase configuration values into this file.

    ```dotenv
    # .env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
    ```

### 4. Genkit AI Setup

1.  **Get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/) to create an API key for the Gemini model.
2.  **Add Key to Environment**: Add the API key to your `.env` file.

    ```dotenv
    # .env
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

### 5. Run the Development Server

You need two terminals for the full experience: one for the Next.js app and one for the Genkit AI flows.

**Terminal 1: Run the Next.js App**
```bash
npm run dev
```
Your application will be available at `http://localhost:3000`.

**Terminal 2 (Optional): Run Genkit for AI Features**
```bash
npm run genkit:watch
```
This will start the Genkit development UI, allowing you to inspect and test your AI flows.

---

## ☁️ Deployment

This project is configured for easy deployment to **Firebase App Hosting**.

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase in your Project

```bash
firebase init hosting
```
- Select **"Use an existing project"** and choose the Firebase project you created.
- When asked for your public directory, enter **`.`** (a single dot).
- When asked to configure as a single-page app, say **No**.
- When asked to set up automatic builds and deploys with GitHub, you can choose **Yes** for a CI/CD pipeline or **No** for manual deploys.

### 3. Deploy to Firebase

```bash
firebase deploy --only hosting
```

This command will build your Next.js application and deploy it to Firebase App Hosting. The backend Cloud Functions can be deployed separately using `firebase deploy --only functions`.
