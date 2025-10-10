import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";
import ClientProviders from "@/providers/ClientProviders";
import { Inter } from "next/font/google";
import React from "react";
import { RegisterProvider } from "@/context/RegisterContext";
import { RouterLoader } from "@/components/loaders/RouterLoader";
import { AppInitializer } from "@/components/loaders/AppInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Insonor",
  description: "Plataforma de control acústico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientProviders>
          <RegisterProvider>
            <AppInitializer>
              <RouterLoader>{children}</RouterLoader>
            </AppInitializer>
            <Toaster position="top-right" />
          </RegisterProvider>
        </ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
