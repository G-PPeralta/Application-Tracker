"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      pathname === href
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          Application Tracker
        </h1>
        <div className="flex gap-2">
          <Link href="/applications" className={linkClass("/applications")}>
            Board
          </Link>
          <Link href="/new" className={linkClass("/new")}>
            New Application
          </Link>
        </div>
      </div>
    </nav>
  );
}
