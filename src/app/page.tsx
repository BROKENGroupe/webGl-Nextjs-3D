// "use client";

// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="text-3xl font-bold mb-6">Bienvenido a Insonor Arquitectura</h1>
//       <div className="space-x-4">
//         <Link href="/editor">
//           <button className="px-6 py-2 bg-blue-600 text-white rounded shadow">Ir al Editor 3D</button>
//         </Link>
//         <Link href="/analytics">
//           <button className="px-6 py-2 bg-green-600 text-white rounded shadow">Análisis Acústico</button>
//         </Link>
//         {/* Agrega más accesos según tus módulos */}
//       </div>
//     </main>
//   );
// }

import React from "react";
import LoginPage from "./auth/login/page";

const page = () => {
  return <LoginPage />;
};

export default page;
