import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";
import ClientProviders from "@/providers/ClientProviders";

export const metadata = {
  title: 'Insonor',
  description: 'Plataforma de control acústico',
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="es">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}


