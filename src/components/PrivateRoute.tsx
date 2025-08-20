// src/components/PrivateRoute.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, router]);

  if (!isVerified) {
    return <div>Cargando...</div>;
  }

  return <>{children}</>;
}
