'"use client";'
import { TenantContext } from "@/context/TenantContext";
import AuthProvider from "@/providers/auth.provider";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: { tenant: string };
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = params;
  return (
    <TenantContext.Provider value={tenant}>
      <AuthProvider>{children}</AuthProvider>
    </TenantContext.Provider>
  );
}