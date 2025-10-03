// app/layout.tsx

import { SiteHeader } from "@/components/layouts/site-header";
import { ThemeProvider } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { fontMono, fontSans } from "@/lib/fonts";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "nextjs",
    "react",
    "table",
    "react-table",
    "tanstack-table",
    "shadcn-table",
    "tablecn",
  ],
  authors: [{ name: "cosmicsarthak", url: "https://sarthak.app" }],
  creator: "Hissan Aero",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "https://hissan-aeroflow-dash.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Preview Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["https://hissan-aeroflow-dash.vercel.app/og-image.png"],
    creator: "@cosmicsarthak",
  },
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
        <head />
        <body
            className={cn(
                "min-h-screen bg-background font-sans antialiased",
                fontSans.variable,
                fontMono.variable
            )}
        >
        <Script
            defer
            data-site-id={siteConfig.url}
            src="https://assets.onedollarstats.com/stonks.js"
        />
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {/* Sidebar Layout Shell */}
          <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
              {/* Header */}
              <header className="flex h-16 items-center justify-between gap-4 border-b px-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <SiteHeader />
                </div>
                <div className="flex items-center gap-2">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 p-4">{children}</main>
            </SidebarInset>
          </SidebarProvider>

          <TailwindIndicator />
        </ThemeProvider>
        <Toaster />
        </body>
        </html>
      </ClerkProvider>
  );
}
