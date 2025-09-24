"use client";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  if (session) {
    redirect("/home");
  } else {
    redirect("/auth/login");
  }
}
