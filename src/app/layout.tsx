import "./globals.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
};

export default Layout;