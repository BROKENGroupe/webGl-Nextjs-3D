"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function HomePage() {
  // const { isAuthenticated } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/auth/login");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return <p>Redirigiendo...</p>;
  // }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenido a Insonor Arquitectura
      </h1>
      <div className="space-x-4">
        <Link href="/editor">
          <button className="px-6 py-2 bg-blue-600 text-white rounded shadow">
            Ir al Editor 3D
          </button>
        </Link>
        <Link href="/analytics">
          <button className="px-6 py-2 bg-green-600 text-white rounded shadow">
            Análisis Acústico
          </button>
        </Link>
      </div>
    </main>
  );
}
