import React from "react";
import Image from "next/image";

export default function OnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>    
    
      {children}
    </main>
  );
}
