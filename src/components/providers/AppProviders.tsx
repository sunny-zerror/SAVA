"use client";

import { ApolloProvider } from "@/lib/apollo/client";
import SmoothScroll from "@/components/providers/SmoothScroll";
import StoreHydration from "@/components/providers/StoreHydration";
import Toaster from "@/components/ui/Toaster";
import { GlobalAnimations } from "@/lib/global";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <StoreHydration />
      <GlobalAnimations />
      <SmoothScroll>{children}</SmoothScroll>
      <Toaster />
    </ApolloProvider>
  );
}
