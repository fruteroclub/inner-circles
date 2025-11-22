import type { Metadata } from "next";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";
import AppProvider from "@/providers/app-provider";
import { Toaster } from "@/components/ui/sonner";
import { fonts } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Circles Credit",
  description: "A community-driven, reputation-based credit system",
  icons: [{ rel: "icon", url: "/images/logos/token.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fonts.funnelDisplay.variable,
          fonts.ledger.variable,
          fonts.raleway.variable,
          fonts.spaceGrotesk.variable
        )}
      >
        <AppProvider>{children}</AppProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
