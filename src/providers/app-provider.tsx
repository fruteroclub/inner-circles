"use client";

import { Suspense, type ReactNode } from "react";
import PrivyProviderComponent from "./auth/privy-provider";

function OnchainProviderComponent({ children }: { children: ReactNode }) {
  return <PrivyProviderComponent>{children}</PrivyProviderComponent>;
}

// Main export with Suspense
export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p>Loading wallet...</p>
          </div>
        </div>
      }
    >
      <OnchainProviderComponent>{children}</OnchainProviderComponent>
    </Suspense>
  );
}
