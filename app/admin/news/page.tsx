"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
    Plus,
    Trash2,
    Search,
    X,
    Loader2,
    Upload,
    Pencil,
    Calendar,
    Zap,
    FileText,
    Globe,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminNewsPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localTime, setLocalTime] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        tag: "ARCHIVE",
        description: "",
        content: "",
        image_url: "",
    });

    useEffect(() => {
        setMounted(true);
        fetchNews();

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const isoTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
        setLocalTime(isoTime);
        setPublishDate(isoTime);
    }, []);

    const fetchNews = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/news");
            const data = await res.json();
            if (Array.isArray(data)) setArticles(data);
        } catch (error) {
            toast.error("EDITORIAL LINK FAILURE");
        } finally {
            setLoading(false);
        }
    }, []);
    const filteredArticles = useMemo(() => {
        return articles.filter(
            (a) =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [articles, searchQuery]);

    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentArticles = useMemo(
        () => filteredArticles.slice(indexOfFirstItem, indexOfLastItem),
        [filteredArticles, indexOfFirstItem, indexOfLastItem],
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (article: any) => {
        setEditingId(article.id);
        setFormData({
            title: article.title,
            tag: article.tag,
            description: article.description,
            content: article.content,
            image_url: article.image_url,
        });
        setPreview(article.image_url);
        const isFuture = new Date(article.published_at) > new Date();
        setIsScheduled(isFuture);
        if (isFuture)
            setPublishDate(new Date(article.published_at).toISOString().slice(0, 16));
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        if (editingId) data.append("id", editingId);
        data.append("title", formData.title);
        data.append("tag", formData.tag);
        data.append("description", formData.description);
        data.append("content", formData.content);
        data.append(
            "published_at",
            isScheduled ? publishDate : new Date().toISOString(),
        );
        if (selectedFile) data.append("image", selectedFile);
        data.append("currentImage", formData.image_url);

        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/admin/news", {
                method,
                body: data
            });

            if (res.ok) {
                toast.success("EDITORIAL ARCHIVE LINKED.");
                fetchNews();
                handleCloseModal();
            } else {
                toast.error("TRANSMISSION FAILED.");
            }
        } catch (err) {
            toast.error("PROTOCOL ERROR");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setPreview(null);
        setSelectedFile(null);
        setFormData({
            title: "",
            tag: "ARCHIVE",
            description: "",
            content: "",
            image_url: "",
        });
        setIsScheduled(false);
    };

    if (loading && articles.length === 0)
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] text-[oklch(0.65_0.1_170)]">
                <Loader2 className="animate-spin h-10 w-10 mb-4" />
                <p className="text-[10px] font-black uppercase italic tracking-[0.5em]">
                    Neural Link Initializing...
                </p>
            </div>
        );

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-10 py-6 px-4 animate-in fade-in duration-1000">
            {/* 01. HEADER - Styled like Product Page */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 pb-10">
                <div className="border-l-8 border-[oklch(0.65_0.1_170)] pl-6">
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-[oklch(0.22_0.06_240)] leading-none">
                        Editorial<span className="text-[oklch(0.65_0.1_170)]">.</span>
                    </h1>
                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.4em] italic mt-2">
                        Archive Registry Protocol // V.26
                    </p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-[oklch(0.22_0.06_240)] text-white hover:bg-[oklch(0.65_0.1_170)] h-16 px-12 rounded-none font-black uppercase italic cursor-pointer transition-none shadow-[10px_10px_0px_rgba(0,0,0,0.05)] w-full md:w-auto"
                >
                    New Post +
                </Button>
            </div>

            {/* 02. SEARCH & FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
                <div className="md:col-span-3 relative bg-white">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-300" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH ARCHIVE..."
                        className="w-full pl-12 pr-4 py-5 bg-transparent text-[11px] font-black uppercase italic outline-none focus:bg-zinc-50 transition-none"
                    />
                </div>
                <div className="bg-white p-5 flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase italic">
                    Total Logs: {filteredArticles.length}
                </div>
            </div>

            {/* 03. DATA TABLE */}
            <div className="border border-zinc-200 bg-white rounded-none overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[450px]">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-[#fafafa] border-b border-zinc-100">
                            <tr className="text-[9px] font-black uppercase text-zinc-400 italic tracking-widest">
                                <th className="p-6">Archive Post</th>
                                <th className="p-6">Classification</th>
                                <th className="p-6">Release Date</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentArticles.map((article) => {
                                const isFuture = new Date(article.published_at) > new Date();
                                return (
                                    <tr
                                        key={article.id}
                                        className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-none group"
                                    >
                                        <td className="p-6 flex items-center gap-5">
                                            <div className="relative h-12 w-16 bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden">
                                                <Image
                                                    src={article.image_url || "/placeholder.jpg"}
                                                    alt=""
                                                    fill
                                                    className="object-cover grayscale group-hover:grayscale-0 transition-none"
                                                />
                                            </div>
                                            <span className="text-sm font-black text-[oklch(0.22_0.06_240)] uppercase italic tracking-tighter truncate max-w-[250px]">
                                                {article.title}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-[9px] font-black text-[oklch(0.65_0.1_170)] uppercase italic border border-[oklch(0.65_0.1_170)] px-2 py-0.5">
                                                {article.tag}
                                            </span>
                                        </td>
                                        <td className="p-6 text-[10px] font-bold text-zinc-400 font-mono">
                                            {new Date(article.published_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-6">
                                            {isFuture ? (
                                                <div className="flex items-center gap-2 text-blue-500 font-black italic text-[9px] uppercase">
                                                    <Calendar size={12} /> Scheduled
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[oklch(0.65_0.1_170)] font-black italic text-[9px] uppercase">
                                                    <Zap size={12} /> Live Now
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(article)}
                                                    className="p-3 text-zinc-400 hover:text-[oklch(0.65_0.1_170)] transition-none cursor-pointer"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Terminate?"))
                                                            fetch(`/api/admin/news?id=${article.id}`, { method: 'DELETE' }).then(() => fetchNews())
                                                    }}
                                                    className="p-3 text-zinc-400 hover:text-red-600 transition-none cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* 04. PAGINATION */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-zinc-100 bg-[#fafafa] flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase text-zinc-400 italic tracking-widest">
                            Logs {indexOfFirstItem + 1} -{" "}
                            {Math.min(indexOfLastItem, filteredArticles.length)} // Total:{" "}
                            {filteredArticles.length}
                        </p>
                        <div className="flex gap-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="h-10 px-4 border border-zinc-200 text-[10px] font-black hover:bg-white disabled:opacity-20 transition-none cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "h-10 w-10 text-[10px] font-black border transition-none cursor-pointer",
                                            currentPage === page
                                                ? "bg-[oklch(0.22_0.06_240)] text-white border-black"
                                                : "bg-white text-zinc-400 border-zinc-200 hover:border-black",
                                        )}
                                    >
                                        {page}
                                    </button>
                                ),
                            )}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="h-10 px-4 border border-zinc-200 text-[10px] font-black hover:bg-white disabled:opacity-20 transition-none cursor-pointer"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 05. MODAL PORTAL - FIXED HEADER & TIMING LOGIC */}
            {showModal &&
                mounted &&
                createPortal(
                    <div
                        className="fixed inset-0 w-full h-full bg-[#061421]/60 backdrop-blur-md z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-hidden"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="bg-[#f8faf9] border border-[#061421] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER - ĐẶT RIÊNG ĐỂ KHÔNG BỊ TRÔI */}
                            <div className="p-6 md:p-8 border-b border-[#d1dbd6] shrink-0 relative">
                                <button
                                    onClick={handleCloseModal}
                                    className="absolute top-6 right-6 h-8 w-8 border border-[#061421] flex items-center justify-center hover:bg-[#061421] hover:text-white transition-none cursor-pointer z-30"
                                >
                                    <X size={16} />
                                </button>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#65a3aa]">
                                        <Zap size={14} className="animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.4em]">
                                            Neural Registry Protocol
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#061421] leading-none">
                                        {editingId ? "Edit Archive." : "New Post."}
                                    </h2>
                                </div>
                            </div>

                            {/* FORM BODY - CÓ THỂ CUỘN NẾU DÀI */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                                <form
                                    id="protocol-form"
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-8 pb-4"
                                >
                                    {/* VISUAL ASSET */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                            FEATURE ARCHIVE VISUAL
                                        </label>
                                        <div
                                            onClick={() =>
                                                document.getElementById("file-news")?.click()
                                            }
                                            className="aspect-[21/9] w-full bg-[#f0f4f2] border border-[#d1dbd6] flex items-center justify-center cursor-pointer hover:border-[#65a3aa] overflow-hidden group"
                                        >
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    className="h-full w-full object-cover"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <div className="text-center space-y-1">
                                                    <Upload className="h-5 w-5 text-[#a0b0ab] mx-auto group-hover:text-[#65a3aa]" />
                                                    <p className="text-[7px] uppercase font-black text-[#a0b0ab]">
                                                        INITIALIZE VISUAL LINK
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="file-news"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>

                                    {/* SUBJECT TITLE */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                            SUBJECT TITLE
                                        </label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            required
                                            className="w-full bg-[#f0f4f2] p-4 border border-[#d1dbd6] outline-none focus:border-[#65a3aa] text-sm font-bold uppercase italic"
                                        />
                                    </div>

                                    {/* TAG & TIMING */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                                CLASSIFICATION TAG
                                            </label>
                                            <input
                                                name="tag"
                                                value={formData.tag}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, tag: e.target.value })
                                                }
                                                className="w-full bg-[#f0f4f2] p-4 border border-[#d1dbd6] outline-none focus:border-[#65a3aa] text-xs font-bold uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                                    TIMING PROTOCOL
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="sc-check"
                                                        checked={isScheduled}
                                                        onChange={(e) => setIsScheduled(e.target.checked)}
                                                        className="accent-[#65a3aa] h-3 w-3"
                                                    />
                                                    <label
                                                        htmlFor="sc-check"
                                                        className="text-[7px] uppercase font-black cursor-pointer"
                                                    >
                                                        SCHEDULE
                                                    </label>
                                                </div>
                                            </div>
                                            {/* LOGIC MỜ ĐI KHI CHƯA TÍCH */}
                                            <input
                                                type="datetime-local"
                                                disabled={!isScheduled}
                                                value={isScheduled ? publishDate : localTime}
                                                onChange={(e) => setPublishDate(e.target.value)}
                                                className={cn(
                                                    "w-full bg-[#f0f4f2] p-4 border outline-none text-[10px] font-bold transition-all",
                                                    isScheduled
                                                        ? "border-[#65a3aa] opacity-100"
                                                        : "border-[#d1dbd6] opacity-30 grayscale cursor-not-allowed",
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* SUMMARY */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                            ARCHIVE SUMMARY
                                        </label>
                                        <input
                                            name="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full bg-[#f0f4f2] p-4 border border-[#d1dbd6] outline-none focus:border-[#65a3aa] text-xs font-medium italic"
                                        />
                                    </div>

                                    {/* DETAIL CONTENT */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#4a5d55] italic">
                                            TECHNICAL DETAIL CONTENT
                                        </label>
                                        <textarea
                                            name="content"
                                            value={formData.content}
                                            onChange={(e) =>
                                                setFormData({ ...formData, content: e.target.value })
                                            }
                                            rows={4}
                                            required
                                            className="w-full bg-[#f0f4f2] p-4 border border-[#d1dbd6] outline-none focus:border-[#65a3aa] text-xs font-medium leading-relaxed resize-none"
                                        />
                                    </div>

                                    {/* FOOTER ACTIONS - DÍNH Ở CUỐI FORM */}
                                    <div className="pt-6 border-t-2 border-[#061421] mt-4 flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 border border-[#d1dbd6] py-4 text-[10px] font-black uppercase italic tracking-widest hover:bg-[#f0f4f2] transition-none cursor-pointer"
                                        >
                                            ABORT
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-[#061421] text-white py-4 text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-[#0c2533] shadow-[0px_10px_20px_rgba(6,20,33,0.3)] cursor-pointer disabled:opacity-50"
                                        >
                                            {loading ? "TRANSMITTING..." : "AUTHORIZE POST"}
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
