
'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function OnLayout({
  children,
}: {
  children: React.ReactNode;
}) {

   const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsActive(false);
    const timeout = setTimeout(() => setIsActive(true), 50);
    return () => clearTimeout(timeout);
  }, [pathname]);


  return (
    <main>    
    
      <div className={`page-transition ${isActive ? "page-transition-active" : ""}`}>
      {children}
    </div>
    </main>
  );
}
