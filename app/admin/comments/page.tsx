"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Loader2, Package, Search, CheckCircle2, Clock, Trash2, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

export default function AdminInquiryManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replies, setReplies] = useState<{ [key: number]: string }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (error) {
      toast.error("DATABASE SYNC ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const handleReply = async (id: number) => {
    if (!replies[id]) {
        toast.warning("EMPTY DISPATCH", { description: "Context is required for official response." });
        return;
    }
    const res = await fetch("/api/admin/comments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id, reply: replies[id] })
    });
    if (res.ok) {
      toast.success("DISPATCH SUCCESSFUL", {
          style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
      });
      fetchComments();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("TERMINATE THIS INQUIRY LOG?")) {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
          toast.success("LOG TERMINATED");
          fetchComments();
      }
    }
  };

  const filteredComments = comments.filter((c) => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || (filterStatus === "pending" ? !c.is_answered : c.is_answered);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground animate-pulse">Accessing Inquiry Archive...</p>
    </div>
  );

  return (
    <div className="w-[95%] lg:w-[90%] mx-auto space-y-10 py-10 animate-in fade-in duration-1000">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">
            Inquiry Hub<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] italic pl-1">Communication Logs // Client Interaction</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 border border-border">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="SEARCH BY MEMBER OR PRODUCT DESIGNATION..." 
            className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-none text-xs font-bold uppercase italic outline-none focus:border-primary transition-all" 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background border border-border text-[10px] font-black uppercase italic px-6 py-4 outline-none focus:border-primary cursor-pointer text-muted-foreground"
        >
          <option value="all">ALL LOGS</option>
          <option value="pending">AWAITING RESPONSE</option>
          <option value="answered">RESOLVED ONLY</option>
        </select>
      </div>

      {/* INQUIRY CARDS LIST */}
      <div className="space-y-6">
        {currentItems.map((c) => (
          <Card key={c.id} className={cn(
            "bg-card border-border rounded-none border-l-4 transition-all hover:shadow-xl",
            c.is_answered ? "border-l-muted opacity-80" : "border-l-primary shadow-lg shadow-primary/5"
          )}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-muted border border-border flex items-center justify-center font-black text-primary text-lg italic shadow-inner">
                    {c.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-md font-black uppercase italic text-foreground tracking-tighter leading-none">{c.full_name}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <Package size={12} className="text-primary" />
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{c.product_name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 border-border pt-4 md:pt-0">
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-[8px] font-mono text-muted-foreground uppercase font-black tracking-widest">{new Date(c.created_at).toLocaleString()}</p>
                    {c.is_answered ? (
                      <span className="flex items-center gap-2 text-primary text-[9px] font-black uppercase italic"><CheckCircle2 size={12}/> Protocol Resolved</span>
                    ) : (
                      <span className="flex items-center gap-2 text-orange-500 text-[9px] font-black uppercase italic animate-pulse"><Clock size={12}/> Authorization Pending</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="pl-0 md:pl-20">
                <div className="bg-muted/10 p-6 border-l-2 border-border mb-8">
                   <p className="text-sm italic text-foreground leading-relaxed font-medium">"{c.content}"</p>
                </div>

                {!c.is_answered ? (
                  <div className="flex items-stretch gap-0 border-2 border-foreground bg-background shadow-lg">
                    <input 
                      placeholder="ENTER OFFICIAL HQ DISPATCH CONTEXT..." 
                      className="flex-1 bg-transparent p-5 text-[10px] font-black text-foreground outline-none uppercase tracking-[0.2em] placeholder:text-muted-foreground/30"
                      value={replies[c.id] || ""}
                      onChange={(e) => setReplies({ ...replies, [c.id]: e.target.value })}
                    />
                    <button 
                      onClick={() => handleReply(c.id)} 
                      className="bg-foreground text-background px-10 text-[10px] font-black uppercase italic hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-l-2 border-foreground"
                    >
                      Dispatch
                    </button>
                  </div>
                ) : (
                  <div className="bg-primary/5 p-8 border border-primary/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 opacity-5">
                        <MessageSquare size={80} className="text-primary" />
                     </div>
                     <p className="text-[9px] font-black uppercase text-primary mb-3 tracking-[0.3em] italic flex items-center gap-2">
                        <Send size={10} /> Archived Official Response
                     </p>
                     <p className="text-sm text-foreground italic leading-relaxed font-bold">"{c.reply_content}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">
              Logs {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredComments.length)} of {filteredComments.length} transmissions
            </p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn("h-10 w-10 font-black italic text-xs transition-all border cursor-pointer", currentPage === page ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground hover:border-primary")}>{page}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="h-10 w-10 border border-border flex items-center justify-center hover:bg-muted disabled:opacity-20 cursor-pointer bg-background"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {filteredComments.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-border bg-muted/5">
            <p className="text-muted-foreground font-black uppercase italic text-[10px] tracking-[0.5em]">No Inquiry transmissions detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}