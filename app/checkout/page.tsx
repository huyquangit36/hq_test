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
import { cn } from "@/lib/utils";

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
        style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--destructive)' }
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
    toast.success("ITEM REMOVED");
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.warning("MISSING INFO", { description: "Address is required." });
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
        toast.success("ORDER SECURED");
        setTimeout(() => router.push("/orders/history"), 2000);
      } else {
        const errorData = await response.json();
        toast.error("ORDER FAILED", { description: errorData.error });
      }
    } catch (error) {
      toast.error("CONNECTION ERROR");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-center" theme="light" closeButton />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-32">
        {!user ? (
          <div className="max-w-md mx-auto text-center py-20 border border-border bg-card shadow-xl">
            <Lock className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Access Denied.</h2>
            <Button onClick={() => router.push("/login?redirect=/checkout")} className="bg-foreground text-background hover:bg-primary transition-all rounded-none py-8 font-black uppercase italic cursor-pointer px-10">Authorize Session</Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-32 border-2 border-dashed border-border bg-muted/5">
            <ShoppingBag className="h-16 w-16 mx-auto mb-8 text-muted-foreground/30" />
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Empty Bag<span className="text-primary">.</span></h2>
            <Link href="/products">
              <Button className="bg-foreground text-background hover:bg-primary px-12 py-8 rounded-none font-black uppercase italic transition-all cursor-pointer">
                Go to Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-10">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-2 text-foreground">Checkout<span className="text-primary">.</span></h1>
              
              <Card className="bg-card border-border rounded-none shadow-sm">
                <CardHeader className="border-b border-border bg-muted/20">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-foreground italic">
                    <MapPin className="h-3 w-3 text-primary" /> Logistic Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Recipient</label>
                        <p className="font-black uppercase italic text-md text-foreground">{user.full_name}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Contact</label>
                        <p className="font-black text-md italic text-foreground">{user.email}</p>
                      </div>
                   </div>
                   <textarea 
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="ENTER FULL DESTINATION ADDRESS..." 
                     className="w-full bg-muted/20 border border-border p-5 text-xs text-foreground focus:border-primary outline-none min-h-[120px] transition-all font-black italic tracking-widest uppercase cursor-text" 
                   />
                </CardContent>
              </Card>

              <Card className="bg-card border-border rounded-none shadow-sm">
                <CardHeader className="border-b border-border bg-muted/20">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-foreground italic">
                    <CreditCard className="h-3 w-3 text-primary" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="p-6 border-2 border-primary/20 bg-primary/5 flex items-center justify-between group hover:border-primary transition-colors cursor-pointer">
                      <span className="text-xs font-black uppercase tracking-widest italic text-foreground">Cash on Delivery (COD)</span>
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                         <div className="h-2 w-2 rounded-full bg-background animate-pulse" />
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <Card className="bg-foreground text-background rounded-none border-none shadow-2xl shadow-foreground/10">
                  {/* SỬA LỖI TẠI ĐÂY: Thẻ đóng phải là CardHeader */}
                  <CardHeader className="border-b border-background/10 p-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between italic text-background">
                      <span>Order Summary</span>
                      <ShoppingBag className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[450px] overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-5 text-background">
                           <div className="flex gap-5">
                              <div className="h-20 w-20 bg-background/10 flex-shrink-0 border border-background/10 overflow-hidden">
                                <img src={item.image || "/products/tee-1.jpg"} className="object-cover h-full w-full opacity-90" alt="Product" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-black uppercase text-[13px] italic leading-tight tracking-tighter">{item.name}</p>
                                <div className="flex items-center gap-3">
                                  <span className="bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 uppercase italic">SIZE {item.size}</span>
                                  <span className="text-[10px] font-bold text-background/50 italic">${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-3 bg-background/5 border border-background/10 w-fit px-3 py-1">
                                   <button onClick={() => updateQuantity(index, -1)} className="hover:text-primary cursor-pointer transition-colors"><Minus className="h-3 w-3" /></button>
                                   <span className="text-[11px] font-black w-4 text-center">{item.quantity || 1}</span>
                                   <button onClick={() => updateQuantity(index, 1)} className="hover:text-primary cursor-pointer transition-colors"><Plus className="h-3 w-3" /></button>
                                </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-4">
                              <p className="font-black italic text-md tracking-tighter">${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                              <button onClick={() => removeFromCart(index)} className="text-background/30 hover:text-primary transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-background/5 border-t border-background/10 space-y-4 text-background">
                      <div className="flex justify-between text-[10px] font-black uppercase text-background/40 tracking-[0.2em]">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-background/40 tracking-[0.2em]">
                        <span>Logistic Fee</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-3xl font-black italic uppercase pt-6 border-t border-background/10 tracking-tighter">
                        <span>Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>

                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="w-full mt-8 bg-primary text-primary-foreground hover:bg-background hover:text-foreground font-black uppercase italic py-10 text-lg rounded-none transition-all active:scale-[0.98] shadow-xl cursor-pointer"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Complete Drop"}
                      </Button>
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