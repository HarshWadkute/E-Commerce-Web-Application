"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  
  // Prevent hydration mismatch for zustand store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl shadow-md">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Luxe</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative text-gray-600 hover:text-black transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <UserIcon className="h-4 w-4" />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
