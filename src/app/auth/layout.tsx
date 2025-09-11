import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <main className="flex items-center justify-center min-h-screen auth-background">
        {/* Imagen de Fondo */}
        {/* <Image
        src="https://plus.unsplash.com/premium_photo-1754759082755-4bb1bf09ba2a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8"
        alt="Fondo de cielo estrellado"
        layout="fill"
        objectFit="cover"
        className="-z-10"
      /> */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        <body>{children}</body>
      </main>
    </html>
  );
}
// export const metadata = {
//   title: "Authentication",
// };

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <html lang="es">
//       <body>{children}</body>
//     </html>
//   );
// };

// export default Layout;
