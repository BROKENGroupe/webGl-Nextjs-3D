import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";
import ClientProviders from "@/providers/ClientProviders";
import { Inter } from 'next/font/google';
import React from 'react';
import { RegisterProvider } from '@/context/RegisterContext';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <ClientProviders>
          <RegisterProvider>
          {children}
          <Toaster position="top-right" />
          </RegisterProvider>
        </ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}








