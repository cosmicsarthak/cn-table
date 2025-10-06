"use client";

import Link from "next/link";
import * as React from "react";
import { Plus } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layouts/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateOrderSheet } from "@/app/_components/create-order-sheet";

export function SiteHeader() {
  return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold sm:inline-block">
                            {siteConfig.name}
                        </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              <Link
                  href="/customers"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Customers
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center gap-2">
              {/* Prominent Create Button */}
              <CreateOrderSheet />
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>
  );
}