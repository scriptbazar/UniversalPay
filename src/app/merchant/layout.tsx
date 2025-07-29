
"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  ShieldCheck,
  Code,
  FileText,
  CreditCard,
  Briefcase,
  Landmark,
  Link2,
  ArrowRightLeft,
  LifeBuoy,
  LogOut,
  AppWindow,
  Repeat,
  User as UserIcon
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { signOutUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";
import { getNotifications, type Notification } from "@/lib/notificationsData";

const navItems = [
  { href: "/merchant/dashboard", icon: Home, label: "Dashboard" },
  { href: "/merchant/analytics", icon: LineChart, label: "Analytics" },
  { href: "/merchant/customers", icon: Users, label: "Customers" },
  { href: "/merchant/payments", icon: CreditCard, label: "All Transactions" },
  { href: "/merchant/payment-links", icon: Link2, label: "Payment Links" },
  { href: "/merchant/payment-pages", icon: AppWindow, label: "Payment Pages" },
  { href: "/merchant/withdrawals", icon: Landmark, label: "Withdrawals" },
  { href: "/merchant/invoices", icon: FileText, label: "Invoices" },
  { href: "/merchant/subscriptions", icon: Repeat, label: "My Subscription" },
  { href: "/merchant/currency-converter", icon: ArrowRightLeft, label: "Currency Converter" },
  { href: "/merchant/support", icon: LifeBuoy, label: "Support" },
  { href: "/merchant/developer", icon: Code, label: "Developer" },
  { href: "/merchant/settings", icon: Settings, label: "Settings" },
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


export default function MerchantDashboardLayout({
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(true);
    
    useEffect(() => {
        setNotifications(getNotifications('merchant'));
    }, []);

    const handleReadNotifications = () => {
        setHasUnread(false);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists() && userDoc.data().role === 'merchant') {
                    setUser(user);
                    setUserProfile(userDoc.data() as { fullName: string; email: string, avatar: string });
                } else {
                    await signOutUser();
                     toast({
                        variant: 'destructive',
                        title: 'Access Denied',
                        description: 'You do not have permission to access the merchant dashboard.'
                    });
                    router.push('/login'); 
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, [router, toast]);

    const handleLogout = async () => {
        const { success, error } = await signOutUser();
        if (success) {
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.push('/login');
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
            <Link href="/merchant/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", {
                      "bg-muted text-primary": pathname === item.href
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
                  href="/merchant/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Logo />
                </Link>
                {navItems.map((item) => (
                    <Link
                    key={item.label}
                    href={item.href}
                    className={cn("mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground", {
                        "bg-muted text-foreground": pathname === item.href,
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
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 relative" onClick={handleReadNotifications}>
                        <Bell className="h-4 w-4" />
                        {hasUnread && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>}
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <DropdownMenuItem key={notif.id} className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-1">
                                    <notif.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem>No new notifications</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Image
                  src={userProfile?.avatar || "https://placehold.co/36x36.png"}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="rounded-full"
                  data-ai-hint="user avatar"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userProfile?.fullName || 'Merchant'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/merchant/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/merchant/settings">Settings</Link>
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
