"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ChevronRight, MapPin, CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 1. Kiểm tra đăng nhập và lấy giỏ hàng
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("cart");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    
    setLoading(false);
  }, []);

  // Tính tổng tiền
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shipping = 5.0;
  const total = subtotal + shipping;

  // 2. Hàm xử lý Đặt hàng (Lưu vào PostgreSQL qua API)
  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
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
          items: cartItems,
          shipping_address: "Địa chỉ mặc định của khách hàng" // Bạn có thể thêm form nhập địa chỉ
        }),
      });

      if (response.ok) {
        localStorage.removeItem("cart"); // Xóa giỏ hàng sau khi đặt thành công
        alert("Đặt hàng thành công! Đơn hàng đang được xử lý.");
        router.push("/"); 
      }
    } catch (error) {
      alert("Lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-24">
        
        {/* TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP (Theo yêu cầu của bạn) */}
        {!user ? (
          <div className="max-w-md mx-auto text-center py-20 border-2 border-dashed border-border p-10 rounded-none">
            <Lock className="h-12 w-12 mx-auto mb-6 text-red-600" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Access Denied.</h2>
            <p className="text-muted-foreground mb-8 italic">Bạn cần đăng nhập để thực hiện thanh toán tại HQ Streetwear.</p>
            <Button 
              onClick={() => router.push("/login?redirect=/checkout")}
              className="w-full bg-foreground text-background font-bold uppercase py-6 rounded-none"
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* CỘT TRÁI: THÔNG TIN VẬN CHUYỂN */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Checkout<span className="text-red-600">.</span></h1>
                <p className="text-muted-foreground italic">Hoàn tất đơn hàng của bạn.</p>
              </div>

              <Card className="bg-card border-border rounded-none shadow-none">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Người nhận</label>
                        <p className="font-bold uppercase italic">{user.full_name}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Email</label>
                        <p className="font-bold">{user.email}</p>
                      </div>
                   </div>
                   <div className="pt-4">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">Địa chỉ giao hàng</label>
                      <textarea 
                        placeholder="Số nhà, tên đường, quận/huyện..." 
                        className="w-full mt-2 p-3 bg-secondary border border-border text-sm focus:outline-none focus:border-red-600"
                        rows={3}
                      />
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border rounded-none shadow-none">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="p-4 border border-red-600/30 bg-red-600/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border-4 border-red-600" />
                        <span className="text-sm font-bold uppercase">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                   </div>
                   <p className="text-[10px] text-muted-foreground mt-4 italic">* Các phương thức thanh toán Online (VNPay) đang được bảo trì.</p>
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <Card className="bg-[#0a0a0a] border-zinc-800 rounded-none shadow-none text-white">
                  <CardHeader className="border-b border-zinc-900">
                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                             <div className="flex gap-4">
                                <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 p-1">
                                  <img src={item.image || "/products/tee-1.jpg"} className="object-cover h-full w-full" />
                                </div>
                                <div>
                                  <p className="font-bold uppercase text-[12px]">{item.name}</p>
                                  <p className="text-[10px] text-zinc-500 italic">Qty: {item.quantity || 1}</p>
                                </div>
                             </div>
                             <p className="font-bold italic">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-600 text-sm italic py-4">Giỏ hàng trống.</p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-zinc-900 pt-4">
                      <div className="flex justify-between text-zinc-400 text-xs font-bold uppercase">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400 text-xs font-bold uppercase">
                        <span>Shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white text-xl font-black italic uppercase pt-4">
                        <span>Total</span>
                        <span className="text-red-600">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || cartItems.length === 0}
                      className="w-full mt-8 bg-white text-black hover:bg-zinc-200 font-bold uppercase italic py-7 rounded-none"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Purchase"}
                    </Button>
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