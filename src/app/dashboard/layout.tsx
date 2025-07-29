
"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  ShieldCheck,
  Code,
  CreditCard,
  Briefcase,
  Settings,
  Users,
  Package2,
  BarChart,
  Wallet,
  Landmark,
  Link2,
  ArrowRightLeft,
  FileText,
  Replace,
  LifeBuoy,
  PlusCircle,
  LogOut,
  AppWindow,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Admin Dashboard" },
  { href: "/dashboard/analytics", icon: BarChart, label: "Analytics" },
  { href: "/dashboard/users", icon: Users, label: "Users & Merchants" },
  { href: "/dashboard/transactions", icon: CreditCard, label: "All Transactions" },
  { href: "/dashboard/payment-links", icon: Link2, label: "Payment Links" },
  { href: "/dashboard/payment-pages", icon: AppWindow, label: "Payment Pages" },
  { href: "/dashboard/withdrawals", icon: Landmark, label: "Withdrawals" },
  { href: "/dashboard/subscriptions", icon: Replace, label: "Subscriptions" },
  { href: "/dashboard/invoices", icon: FileText, label: "All Invoices" },
  { href: "/dashboard/currency-converter", icon: ArrowRightLeft, label: "Currency Converter" },
  { href: "/dashboard/support", icon: LifeBuoy, label: "Support Tickets" },
  { href: "/dashboard/fraud-detection", icon: ShieldCheck, label: "Fraud & Risk" },
  { href: "/dashboard/audit-logs", icon: History, label: "Audit Logs" },
  { href: "/dashboard/developer", icon: Code, label: "Platform SDKs" },
  { href: "/dashboard/settings", icon: Settings, label: "Platform Settings" },
];

function DashboardSkeleton() {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map((item) => (
                                <Skeleton key={item.href} className="h-10 w-full mb-2" />
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
             <div className="flex flex-col">
                 <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <div className="w-full flex-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                 </header>
                 <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </main>
            </div>
        </div>
    );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<{ fullName?: string; email?: string, avatar?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setUser(user);
                    setUserProfile(userDoc.data() as { fullName: string; email: string, avatar: string });
                } else {
                    await signOutUser();
                    toast({
                        variant: 'destructive',
                        title: 'Access Denied',
                        description: 'You do not have permission to access the admin dashboard.'
                    });
                    router.push('/admin'); 
                }
            } else {
                router.push('/admin'); 
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, toast]);
    
    const handleLogout = async () => {
        const { success, error } = await signOutUser();
        if (success) {
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.push('/admin');
        } else {
            toast({ variant: 'destructive', title: "Logout Failed", description: error });
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return <DashboardSkeleton />;
    }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", {
                      "bg-muted text-primary": pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
                  })}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Package2 className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Logo />
                </Link>
                {navItems.map((item) => (
                    <Link
                    key={item.label}
                    href={item.href}
                    className={cn("mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground", {
                        "bg-muted text-foreground": pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard'),
                    })}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
           <ThemeToggle />
           <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Image
                  src={userProfile?.avatar || "https://placehold.co/36x36.png"}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="rounded-full"
                  data-ai-hint="administrator avatar"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userProfile?.fullName || 'Admin'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/users">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="mailto:support@transactwave.com">Support</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
