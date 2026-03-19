"use client";

import { SessionProvider } from "next-auth/react";
import { Navigation } from "@/components/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navigation />
      <main className="mx-auto px-6 py-8">{children}</main>
    </SessionProvider>
  );
}
