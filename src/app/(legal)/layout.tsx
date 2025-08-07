
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
            <div className="prose dark:prose-invert max-w-4xl mx-auto">
                {children}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
