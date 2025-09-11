import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default Layout;
