import AuthProvider from "@/providers/auth.provider";
import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";


const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
