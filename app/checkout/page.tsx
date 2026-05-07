"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Loader2, 
  Lock, 
  Trash2, 
  Plus, 
  Minus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast, Toaster } from "sonner";
import Link from "next/link";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("cart");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setCartItems(JSON.parse(storedCart));
    setLoading(false);
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cartItems];
    const item = newCart[index];
    const newQty = (item.quantity || 1) + delta;

    if (delta > 0 && newQty > (item.stock || 0)) {
      toast.error("OUT OF STOCK", {
        description: `Size ${item.size} currently only has ${item.stock} units available.`,
        style: { background: '#000', color: '#fff', border: '1px solid #dc2626' }
      });
      return;
    }

    if (newQty > 0) {
      newCart[index].quantity = newQty;
      setCartItems(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("ITEM REMOVED", {
      style: { background: '#000', color: '#fff', border: '1px solid #27272a' }
    });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.warning("MISSING INFORMATION", {
        description: "Please provide a shipping address to proceed.",
        style: { background: '#000', color: '#fff', border: '1px solid #f59e0b' }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          total_amount: total,
          shipping_address: address,
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity || 1,
            price: parseFloat(item.price),
            size: item.size
          }))
        }),
      });

      if (response.ok) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
        toast.success("ORDER COMPLETED", {
          description: "Your drop has been secured. Redirecting to history...",
          style: { background: '#000', color: '#fff', border: '1px solid #10b981' }
        });
        setTimeout(() => router.push("/orders/history"), 2000);
      } else {
        const errorData = await response.json();
        toast.error("SYSTEM ERROR", {
          description: errorData.error || "Unable to process order.",
        });
      }
    } catch (error) {
      toast.error("CONNECTION ERROR", {
        description: "Please check your internet connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600 h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      <Toaster position="top-center" theme="dark" closeButton />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        {!user ? (
          <div className="max-w-md mx-auto text-center py-20 border border-zinc-900 p-10 bg-[#050505]">
            <Lock className="h-12 w-12 mx-auto mb-6 text-red-600" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Access Denied.</h2>
            <p className="text-zinc-500 mb-8 italic text-xs uppercase tracking-widest font-bold">Please login to secure your items.</p>
            <Button onClick={() => router.push("/login?redirect=/checkout")} className="w-full bg-white text-black font-black uppercase py-7 rounded-none hover:bg-red-600 hover:text-white transition-all italic">Login to Account</Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-32 border border-dashed border-zinc-900">
            <ShoppingBag className="h-16 w-16 mx-auto mb-8 text-zinc-800" />
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Your Bag is Empty<span className="text-red-600">.</span></h2>
            <p className="text-zinc-500 mb-10 text-xs font-black uppercase tracking-[0.3em] italic">Looks like you haven't picked up any heat yet.</p>
            <Link href="/">
              <Button className="bg-white text-black font-black uppercase italic px-12 py-8 rounded-none hover:bg-red-600 hover:text-white transition-all group">
                Continue Shopping <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-700">
            {/* Left Side: Information */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-2">Checkout<span className="text-red-600">.</span></h1>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black italic">Finalize Your Drop</p>
              </div>

              <Card className="bg-[#0a0a0a] border-zinc-900 rounded-none shadow-none">
                <CardHeader className="border-b border-zinc-900">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500 italic">
                    <MapPin className="h-3 w-3" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Recipient</label>
                        <p className="font-black uppercase italic text-md mt-1 text-white tracking-tighter">{user.full_name}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Contact Email</label>
                        <p className="font-black text-md italic mt-1 text-white tracking-tighter">{user.email}</p>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Street Address</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ENTER YOUR FULL SHIPPING ADDRESS HERE..." 
                        className="w-full bg-black border border-zinc-900 p-5 text-xs text-white focus:border-red-600 outline-none min-h-[120px] transition-all font-black italic tracking-widest uppercase placeholder:text-zinc-800" 
                      />
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-zinc-900 rounded-none shadow-none">
                <CardHeader className="border-b border-zinc-900">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500 italic">
                    <CreditCard className="h-3 w-3" /> Payment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="p-6 border border-red-600/20 bg-red-600/5 flex items-center justify-between group hover:border-red-600 transition-colors">
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest italic block text-white">Cash on Delivery (COD)</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase italic">Pay when your package arrives</span>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center">
                         <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <Card className="bg-white text-black rounded-none border-none shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <CardHeader className="border-b border-zinc-100 p-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between italic">
                      <span>Order Summary</span>
                      <ShoppingBag className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[450px] overflow-y-auto px-8 py-6 space-y-8">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-5 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                           <div className="flex gap-5">
                              <div className="h-20 w-20 bg-zinc-100 flex-shrink-0 relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                                <img src={item.image || "/products/tee-1.jpg"} className="object-cover h-full w-full" alt="Product" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-black uppercase text-[14px] italic leading-tight tracking-tighter">{item.name}</p>
                                
                                <div className="flex items-center gap-2">
                                  <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 uppercase italic tracking-widest">Size {item.size}</span>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase italic tracking-tighter">${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-3">
                                   <div className="flex items-center gap-3 bg-zinc-100 px-3 py-1">
                                     <button onClick={() => updateQuantity(index, -1)} className="hover:text-red-600 transition-colors"><Minus className="h-3 w-3" /></button>
                                     <span className="text-[11px] font-black w-4 text-center">{item.quantity || 1}</span>
                                     <button onClick={() => updateQuantity(index, 1)} className="hover:text-red-600 transition-colors"><Plus className="h-3 w-3" /></button>
                                   </div>
                                </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-4">
                              <p className="font-black italic text-md tracking-tighter">${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                              <button onClick={() => removeFromCart(index)} className="text-zinc-300 hover:text-red-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-zinc-50 space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                        <span>Logistics</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-3xl font-black italic uppercase pt-6 border-t border-zinc-200 tracking-tighter">
                        <span>Total</span>
                        <span className="text-red-600">${total.toFixed(2)}</span>
                      </div>

                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="w-full mt-8 bg-black text-white hover:bg-zinc-800 font-black uppercase italic py-10 text-lg rounded-none transition-all active:scale-[0.98] shadow-xl"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin h-5 w-5 text-red-600" />
                            <span>Processing...</span>
                          </div>
                        ) : "Complete Purchase"}
                      </Button>
                      <p className="text-[7px] text-center text-zinc-400 font-bold uppercase tracking-[0.2em] pt-4">By completing purchase, you agree to HQ streetwear terms.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}