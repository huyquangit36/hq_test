"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeAction } from "@/app/actions/subscribe";
import { toast } from "sonner";
import { Instagram, Facebook, Twitter, Globe } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast.warning("EMAIL REQUIRED");
      return;
    }
    setSubmitting(true);
    const result = await subscribeAction(email);
    if (result.success) {
      toast.success("SUCCESSFULLY SUBSCRIBED");
      setEmail("");
    } else {
      toast.error("SUBSCRIPTION FAILED");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground">Join the Pack.</h2>
      <p className="text-muted-foreground text-[10px] md:text-sm font-bold uppercase italic tracking-widest px-4">
        Subscribe to get exclusive early access to drops.
      </p>
      
      <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-border overflow-hidden shadow-2xl">
        <input 
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR EMAIL ADDRESS" 
          className="flex-1 bg-card px-6 py-5 text-[10px] font-bold tracking-widest outline-none focus:bg-muted/30 transition-none border-b sm:border-b-0 sm:border-r border-border text-foreground placeholder:text-muted-foreground"
          autoComplete="one-time-code"
        />
        <Button 
          onClick={handleSubscribe} disabled={submitting}
          className="bg-foreground text-background hover:bg-primary hover:text-white rounded-none px-12 py-5 sm:py-0 h-auto text-[10px] font-black uppercase italic transition-none shrink-0"
        >
          {submitting ? "Processing..." : "Subscribe"}
        </Button>
      </div>

      <div className="flex justify-center gap-6 md:gap-8 pt-8">
        <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-none" />
        <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-none" />
        <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-none" />
        <Globe className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-none" />
      </div>
    </div>
  );
}