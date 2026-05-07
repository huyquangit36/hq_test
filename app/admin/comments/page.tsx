"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Loader2, User, Package, Search, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminInquiryManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replies, setReplies] = useState<{ [key: number]: string }>({});

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleReply = async (id: number) => {
    if (!replies[id]) return;
    const res = await fetch("/api/admin/comments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id, reply: replies[id] })
    });
    if (res.ok) {
      fetchComments();
    }
  };

  // THUẬT TOÁN: Hàm xóa bình luận
  const handleDelete = async (id: number) => {
    if (confirm("TERMINATE THIS INQUIRY?")) {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchComments();
    }
  };

  const filteredComments = comments.filter((c) => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || (filterStatus === "pending" ? !c.is_answered : c.is_answered);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase animate-pulse">Accessing Inquiry Database...</div>;

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Inquiry Archive<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Manage all customer communications</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-zinc-950 p-4 border border-zinc-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search by customer or product..." 
            className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-800 text-[10px] font-black uppercase text-white outline-none focus:border-red-600"
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-black border border-zinc-800 text-[10px] font-black uppercase italic px-6 py-2 outline-none focus:border-red-600"
        >
          <option value="all">Show All Logs</option>
          <option value="pending">Awaiting Response</option>
          <option value="answered">Resolved Only</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredComments.map((c) => (
          <Card key={c.id} className={`bg-[#0a0a0a] border-zinc-900 rounded-none border-l-4 transition-all ${c.is_answered ? 'border-l-zinc-800 opacity-60' : 'border-l-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.1)]'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-red-600 italic">{c.full_name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-black uppercase italic text-white">{c.full_name}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase flex items-center gap-2 mt-1">
                      <Package size={10} className="text-red-600" /> {c.product_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right space-y-1">
                    <p className="text-[8px] font-mono text-zinc-700 uppercase font-black">{new Date(c.created_at).toLocaleString()}</p>
                    {c.is_answered ? (
                      <span className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase"><CheckCircle2 size={10}/> Resolved</span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-[8px] font-black uppercase italic"><Clock size={10}/> Pending</span>
                    )}
                  </div>
                  {/* THUẬT TOÁN: Nút xóa */}
                  <button onClick={() => handleDelete(c.id)} className="text-zinc-800 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="pl-16">
                <p className="text-sm italic text-zinc-400 mb-8 leading-relaxed">"{c.content}"</p>

                {!c.is_answered ? (
                  /* THUẬT TOÁN: Sửa thành items-stretch và h-auto để Dispatch full height */
                  <div className="flex items-stretch gap-0 border border-zinc-800 bg-black">
                    <input 
                      placeholder="ENTER OFFICIAL HQ DISPATCH..." 
                      className="flex-1 bg-transparent p-4 text-[10px] font-black text-white outline-none focus:bg-zinc-950 transition-all uppercase tracking-widest"
                      value={replies[c.id] || ""}
                      onChange={(e) => setReplies({ ...replies, [c.id]: e.target.value })}
                    />
                    <Button 
                      onClick={() => handleReply(c.id)} 
                      className="bg-red-600 text-white rounded-none uppercase font-black italic px-10 hover:bg-red-700 transition-all border-l border-zinc-800 h-auto py-0"
                    >
                      Dispatch
                    </Button>
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 p-6 border border-zinc-800 border-dashed">
                     <p className="text-[9px] font-black uppercase text-red-600 mb-2 tracking-widest italic">Archived Official Response:</p>
                     <p className="text-xs text-zinc-500 italic leading-relaxed">{c.reply_content}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredComments.length === 0 && (
          <div className="py-32 text-center border-2 border-zinc-900 border-dashed">
            <p className="text-zinc-800 font-black uppercase italic text-sm tracking-widest">Inquiry vault empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}