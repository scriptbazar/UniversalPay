
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>UniversalPay</title>
        <meta name="description" content="A secure, scalable, and globally functional third-party payment gateway platform." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
