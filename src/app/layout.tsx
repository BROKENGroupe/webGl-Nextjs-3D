import AuthProvider from "@/providers/auth.provider";
import "./globals.css";


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
