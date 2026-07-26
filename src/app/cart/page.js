"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Please provide a shipping address.");
      return;
    }

    setIsCheckingOut(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress }),
      });

      if (res.ok) {
        clearCart();
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to place order.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CreditCard className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Thank you for your purchase. We are processing your order and will ship it soon.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty.</p>
          <Link href="/" className="text-sm font-medium text-black hover:underline mt-2">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product} className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow">
                <div className="h-28 w-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 py-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{item.name}</h3>
                  <p className="text-gray-500 font-medium">₹{item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1 bg-gray-50/80 rounded-lg p-1 border border-gray-200/60">
                      <button 
                        onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-white rounded-md transition-colors shadow-sm bg-gray-50 border border-transparent hover:border-gray-200"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-md transition-colors shadow-sm bg-gray-50 border border-transparent hover:border-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.product)}
                      className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors ml-auto lg:ml-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right hidden sm:block pr-4">
                  <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-5 text-sm font-medium text-gray-600 pb-5 border-b border-gray-100">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              
              <div className="flex justify-between mb-8 text-xl font-black text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter your full address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"
                  />
                </div>
                
                {error && <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium">{error}</div>}

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-xl"
                >
                  {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                  <span>{status === "unauthenticated" ? "Sign in to Checkout" : "Checkout"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
