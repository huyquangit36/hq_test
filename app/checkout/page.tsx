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
  Minus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // THUẬT TOÁN 1: State lưu địa chỉ để gửi lên Database
  const [address, setAddress] = useState("");

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("cart");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setCartItems(JSON.parse(storedCart));
    
    setLoading(false);
  }, []);

  // THUẬT TOÁN 2: Xử lý Xóa sản phẩm
  const removeFromCart = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated")); 
  };

  // THUẬT TOÁN 3: Tăng giảm số lượng
  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cartItems];
    const newQty = (newCart[index].quantity || 1) + delta;
    if (newQty > 0) {
      newCart[index].quantity = newQty;
      setCartItems(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  // THUẬT TOÁN QUAN TRỌNG NHẤT: Gửi dữ liệu về PostgreSQL khi bấm nút
  const handlePlaceOrder = async () => {
    if (!address) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
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
          shipping_address: address
        }),
      });

      if (response.ok) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
        alert("ĐẶT HÀNG THÀNH CÔNG!");
        router.push("/orders/history");
      } else {
        alert("Lỗi khi xử lý đơn hàng.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-24">
        
        {!user ? (
          <div className="max-w-md mx-auto text-center py-20 border border-zinc-800 p-10">
            <Lock className="h-12 w-12 mx-auto mb-6 text-red-600" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Access Denied.</h2>
            <p className="text-zinc-500 mb-8 italic text-sm">Vui lòng đăng nhập để hoàn tất đơn hàng tại HQ.</p>
            <Button onClick={() => router.push("/login?redirect=/checkout")} className="w-full bg-white text-black font-black uppercase py-7 rounded-none hover:bg-zinc-200 transition-all">Đăng nhập</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Checkout<span className="text-red-600">.</span></h1>
                <p className="text-zinc-500 italic text-sm">Xác nhận thông tin và thanh toán.</p>
              </div>

              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-none shadow-none">
                <CardHeader className="border-b border-zinc-900">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                    <MapPin className="h-3 w-3" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-zinc-600">Recipient</label>
                        <p className="font-bold uppercase italic text-sm">{user.full_name}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-zinc-600">Contact Email</label>
                        <p className="font-bold text-sm">{user.email}</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase text-zinc-600">Shipping Address</label>
                      {/* BỔ SUNG: value và onChange để lưu địa chỉ */}
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ nhận hàng của bạn..." 
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white focus:border-red-600 outline-none min-h-[100px] transition-all" 
                      />
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-none shadow-none">
                <CardHeader className="border-b border-zinc-900">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                    <CreditCard className="h-3 w-3" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="p-4 border border-red-600/30 bg-red-600/5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest italic">Thanh toán khi nhận hàng (COD)</span>
                      <div className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <Card className="bg-white text-black rounded-none border-none">
                  <CardHeader className="border-b border-zinc-100 p-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between">
                      <span>Order Summary</span>
                      <ShoppingBag className="h-3 w-3" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto px-6 py-4 space-y-6">
                      {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-start gap-4 pb-6 border-b border-zinc-100 last:border-0">
                             <div className="flex gap-4">
                                <div className="h-16 w-16 bg-zinc-100 flex-shrink-0 relative overflow-hidden">
                                  <img src={item.image || "/products/tee-1.jpg"} className="object-cover h-full w-full" alt="Product" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-black uppercase text-[12px] italic leading-tight">{item.name}</p>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter italic">${parseFloat(item.price).toFixed(2)}</p>
                                  
                                  <div className="flex items-center gap-3 mt-2">
                                     <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-zinc-100 rounded transition-colors"><Minus className="h-3 w-3" /></button>
                                     <span className="text-xs font-black">{item.quantity || 1}</span>
                                     <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-zinc-100 rounded transition-colors"><Plus className="h-3 w-3" /></button>
                                  </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-end gap-3">
                                <p className="font-black italic text-sm">${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(index)} className="text-zinc-300 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center">
                           <p className="text-zinc-400 text-sm italic">Giỏ hàng đang trống.</p>
                           <Button variant="link" onClick={() => router.push("/products")} className="mt-2 text-xs font-bold uppercase tracking-widest text-black">Tiếp tục mua sắm</Button>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-zinc-50 space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                        <span>Shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-black italic uppercase pt-4 border-t border-zinc-200">
                        <span>Total</span>
                        <span className="text-red-600">${total.toFixed(2)}</span>
                      </div>

                      {/* BỔ SUNG: onClick={handlePlaceOrder} và trạng thái isSubmitting */}
                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting || cartItems.length === 0}
                        className="w-full mt-6 bg-black text-white hover:bg-zinc-800 font-black uppercase italic py-8 text-md rounded-none transition-all"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Purchase"}
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