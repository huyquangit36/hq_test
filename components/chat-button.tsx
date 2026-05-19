"use client";

import { MessageCircle, X, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";


export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [mounted, setMounted] = useState(false); 

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedChat = localStorage.getItem("hq_chat_history");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([{ role: "assistant", content: "Hey! Welcome to HQ Streetwear. Ready to secure your next drop?" }]);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem("hq_chat_history", JSON.stringify(messages));
    
    if (isOpen || messages.length > 0) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isTyping, isOpen, mounted]);

  const handleSend = async () => {
    if (!message.trim() || isTyping) return;
    
    const userMsg = { role: "user" as const, content: message };
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMsgs }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else {
        const errorMsg = res.status === 429 ? "Rate limit reached. Wait 30s." : "Neural link unstable.";
        setMessages(prev => [...prev, { role: "assistant", content: `[STATUS]: ${errorMsg}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "[ERROR]: Connection lost." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    toast.warning("WIPE TRANSMISSION LOGS?", {
      description: "This action will clear all current conversation history.",
      action: {
        label: "CONFIRM",
        onClick: () => {
          localStorage.removeItem("hq_chat_history");
          setMessages([{ role: "assistant", content: "Welcome back to HQ StreetWear. What heat are we securing today?" }]);
          toast.success("HISTORY PURGED");
        },
      },
    });
  };

  if (!mounted) return null;

  return (
    <div ref={chatContainerRef} className="relative z-[100]">
      
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[32rem] bg-background border-2 border-foreground shadow-2xl flex flex-col z-[100] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary text-primary-foreground border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase italic tracking-widest text-white leading-none">HQ Support</h3>
                <p className="text-[9px] text-white/70 uppercase font-bold mt-1 tracking-tighter">
                    {isTyping ? "AI is processing..." : "Online // Secure Link"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={clearChat} className="p-2 hover:bg-white/10 transition-colors cursor-pointer rounded-full opacity-60">
                 <Trash2 size={16} className="text-white" />
               </button>
               <button className="p-2 hover:bg-white/10 transition-colors cursor-pointer rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5 scrollbar-hide scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex animate-in fade-in slide-in-from-bottom-2 duration-500", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-3 text-xs font-medium italic leading-relaxed shadow-sm",
                    msg.role === "user" ? "bg-primary text-primary-foreground rounded-none" : "bg-white text-foreground border border-border rounded-none"
                  )}
                >
                  {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                    const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                    if (match) return (
                      <Link 
                        key={index} 
                        href={match[2]} 
                        className={cn(
                          "font-black underline mx-0.5 hover:opacity-70 transition-all cursor-pointer",
                          msg.role === "user" ? "text-white" : "text-primary"
                        )}
                      >
                        {match[1]}
                      </Link>
                    );
                    return <span key={index}>{part}</span>;
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-border px-4 py-3 flex gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex items-center gap-3">
              <input
                type="text" value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isTyping ? "AI TRANSMITTING..." : "WHAT'S ON YOUR MIND?"}
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-muted/20 border border-border text-[10px] font-black uppercase italic tracking-widest text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all cursor-text"
              />
              <button
                className="h-12 w-12 bg-foreground text-background hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 group"
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 h-16 w-16 shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90 cursor-pointer",
          isOpen ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:-translate-y-2"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}