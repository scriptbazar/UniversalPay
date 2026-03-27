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

UniversalPay is a feature-rich, third-party payment gateway designed to bridge the gap between traditional finance and the world of cryptocurrency. It provides merchants with the tools to accept a wide range of payment methods, including Indian UPI and international cryptocurrencies, while offering powerful administrative tools for platform management.

---

## ✨ Key Features

-   **💳 Multi-Currency Support**: Accept payments via Indian UPI (Paytm, PhonePe) and major cryptocurrencies (USDT, BTC).
-   **🌍 Global Payment Methods**: Customers can pay using their local methods, and merchants receive settlements in their preferred cryptocurrency.
-   **🤖 AI-Powered Fraud Prevention**: A smart fraud detection system flags suspicious activities and maintains risk scores.
-   **📊 Comprehensive Dashboards**: Separate, feature-rich dashboards for both **Admins** and **Merchants**.
-   **₿ Unified Crypto Settlements**: All payments are converted and settled directly into the merchant's crypto wallet.
-   **</> Developer-Friendly Integration**: RESTful APIs, webhooks, and SDKs.
-   **🎨 White-Label Solution**: Premium merchants can use their own branding for checkout.
-   **🔄 Subscription & Invoicing**: Manage recurring billing and professional invoices.

---

## 🚀 Getting Started

### 1. Setup Repository
If you haven't already, initialize your own repository and link it:
```bash
git init
git remote add origin <YOUR_ACTUAL_GITHUB_REPO_URL>
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a Firebase Project in the console.
2. Add a Web App and copy the configuration to your `.env` file.
3. Enable Authentication (Email/Password), Firestore, and Cloud Functions.

---

## 🛠️ Troubleshooting Git Errors

### Error: "remote: Repository not found"
If you see this error while pushing/pulling:
1. **Check Remote URL**: Run `git remote -v`. If it shows `your-username`, it's a placeholder.
2. **Update Remote**: Run `git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git`.
3. **Verify Access**: Ensure you are logged into Git with the correct account.

---

## ☁️ Deployment

This project is configured for **Firebase App Hosting**.
1. Connect your GitHub repository in the Firebase Console under "App Hosting".
2. Firebase will automatically build and deploy every time you push to your main branch.
