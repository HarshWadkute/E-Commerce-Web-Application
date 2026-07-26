"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Plus, Trash2, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) setOrders(await ordersRes.json());
      
      if (session?.user?.role === "admin") {
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) setProducts(await productsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, 
          price: parseFloat(price), 
          imageUrl, 
          stock: parseInt(stock, 10)
        }),
      });
      if (res.ok) {
        const newProd = await res.json();
        setProducts([newProd, ...products]);
        setName(""); setDescription(""); setPrice(""); setImageUrl(""); setStock("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? "Admin Dashboard" : "My Orders"}
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          {isAdmin ? "Manage your store's products and view customer orders." : "View and track your order history."}
        </p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Add New Product
                </h2>
                <form onSubmit={createProduct} className="space-y-4">
                  <input type="text" required placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  <textarea required rows={3} placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none" />
                  <input type="number" step="0.01" required placeholder="Price ($)" value={price} onChange={e=>setPrice(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  <input type="url" required placeholder="Image URL" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  <input type="number" required placeholder="Stock Quantity" value={stock} onChange={e=>setStock(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  
                  <button type="submit" disabled={isCreating} className="w-full py-3.5 px-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-[0.98]">
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Product
                  </button>
                </form>
             </div>
          </div>

          <div className="lg:col-span-2">
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[620px] flex flex-col">
               <h2 className="text-lg font-bold text-gray-900 mb-6 flex-shrink-0">Manage Products</h2>
               {products.length === 0 ? (
                 <p className="text-gray-500 flex-1 flex items-center justify-center">No products available.</p>
               ) : (
                 <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                   {products.map(product => (
                     <div key={product._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/30 hover:bg-gray-50 transition-colors">
                       <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-xl object-cover border border-gray-200" />
                       <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-gray-900 truncate mb-1">{product.name}</h3>
                         <p className="text-sm font-medium text-gray-500">${product.price.toFixed(2)} &bull; Stock: {product.stock}</p>
                       </div>
                       <button onClick={() => deleteProduct(product._id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                         <Trash2 className="h-5 w-5" />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          {isAdmin ? "All Customer Orders" : "Order History"}
        </h2>
        
        {orders.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="mx-auto h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-300" />
             </div>
             <p className="text-lg font-medium text-gray-900">No orders found.</p>
             {!isAdmin && <p className="text-gray-500 text-sm mt-1">Start shopping to see your orders here.</p>}
           </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order #{order._id.slice(-8)}</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="mb-6 text-sm bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <p className="font-bold text-gray-900 mb-1">Customer: {order.user?.name} <span className="font-medium text-gray-500">({order.user?.email})</span></p>
                      <p className="font-medium text-gray-600">Address: {order.shippingAddress}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600">{item.quantity}x <span className="text-gray-900">{item.name}</span></span>
                        <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between text-lg font-black text-gray-900">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="md:w-56 flex flex-col justify-end pt-5 md:pt-0 md:pl-6 md:border-l border-gray-100">
                    <label className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Update Status</label>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
