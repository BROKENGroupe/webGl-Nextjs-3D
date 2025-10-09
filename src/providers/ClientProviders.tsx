"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from "next-auth/react";
import { AccessProvider } from "@/context/AccessContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ Configurar SessionProvider para reducir updates */}
      <SessionProvider 
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        <AccessProvider>
          {children}
        </AccessProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}