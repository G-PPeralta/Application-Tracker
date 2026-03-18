"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/applications" className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors">
          Application Tracker
        </Link>
      </div>
    </nav>
  );
}
