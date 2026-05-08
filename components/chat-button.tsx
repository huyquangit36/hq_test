"use client";

import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hey! Welcome to HQ Streetwear. How can I help you today?" }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setMessage("");
    
    // Giả lập phản hồi từ hệ thống
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Thanks for reaching out! Our team will get back to you shortly. In the meantime, feel free to browse our latest collection!" 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[32rem] bg-background border border-border rounded-none shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header - Sử dụng màu Jade/Mint để làm nổi bật thương hiệu */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary text-primary-foreground border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase italic tracking-widest text-white leading-none">HQ Support</h3>
                <p className="text-[9px] text-white/70 uppercase font-bold mt-1 tracking-tighter">Online // Ready to drop</p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-white/10 transition-colors cursor-pointer rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex animate-in fade-in slide-in-from-bottom-2 duration-500", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-3 text-xs font-medium italic leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-none"
                      : "bg-white text-foreground border border-border rounded-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập liệu */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="WHAT'S ON YOUR MIND?"
                className="flex-1 px-4 py-3 bg-muted/20 border border-border text-[10px] font-black uppercase italic tracking-widest text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all cursor-text"
              />
              <button
                className="h-12 w-12 bg-foreground text-background hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[7px] text-center text-muted-foreground uppercase font-black tracking-[0.2em] mt-4">Encrypted HQ Transmission</p>
          </div>
        </div>
      )}

      {/* Nút Chat nổi (Floating Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 h-16 w-16 shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90 cursor-pointer",
          isOpen 
            ? "bg-foreground text-background" 
            : "bg-primary text-primary-foreground hover:shadow-primary/40 hover:-translate-y-1"
        )}
        aria-label="Open support"
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-in spin-in-90 duration-300" />
        ) : (
          <div className="relative">
             <MessageCircle className="h-7 w-7" />
             <span className="absolute -top-1 -right-1 h-3 w-3 bg-foreground rounded-full border-2 border-primary animate-pulse" />
          </div>
        )}
      </button>
    </>
  );
}