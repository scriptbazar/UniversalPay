
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import * as React from 'react';
import { Separator } from "./ui/separator";

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#developers" className="text-muted-foreground transition-colors hover:text-foreground">
            Developers
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                A list of navigation links and actions.
              </SheetDescription>
              <nav className="grid gap-6 text-lg font-medium p-6">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                  <Logo />
                </Link>
                 <SheetClose asChild>
                    <Link href="/#features" className="hover:text-foreground">
                        Features
                    </Link>
                </SheetClose>
                <SheetClose asChild>
                    <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
                        Pricing
                    </Link>
                </SheetClose>
                <SheetClose asChild>
                    <Link href="/#developers" className="text-muted-foreground hover:text-foreground">
                        Developers
                    </Link>
                </SheetClose>
                <Separator />
                <div className="flex items-center gap-2">
                    <SheetClose asChild>
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
