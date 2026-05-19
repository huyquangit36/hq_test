"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { User, ShieldCheck, MapPin, Zap, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("identity"); // identity | security | address

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify({ ...data, userId: user.id }),
            });
            const result = await res.json();

            if (res.ok) {
                toast.success("NEURAL IDENTITY UPDATED");
                localStorage.setItem("user", JSON.stringify(result));
                setUser(result);
            } else {
                toast.error(result.error);
            }
        } catch (err) {
            toast.error("TRANSMISSION ERROR");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#fafafa] text-[oklch(0.22_0.06_240)] font-sans">
            <Header />
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* LEFT: TAB NAVIGATION */}
                    <div className="lg:w-1/4 space-y-8">
                        <div className="border-l-8 border-[oklch(0.65_0.1_170)] pl-6 py-2">
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Identity.</h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 italic">Neural Link // User Archive</p>
                        </div>

                        <nav className="flex flex-col border border-zinc-200 bg-white">
                            <TabBtn active={activeTab === "identity"} onClick={() => setActiveTab("identity")} icon={<User size={14} />} label="Personal Data" />
                            <TabBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<ShieldCheck size={14} />} label="Security Protocol" />
                            <TabBtn active={activeTab === "address"} onClick={() => setActiveTab("address")} icon={<MapPin size={14} />} label="Shipping Node" />
                        </nav>
                    </div>

                    {/* RIGHT: FORM CONTENT */}
                    <div className="lg:w-3/4">
                        <form onSubmit={handleUpdate} className="bg-white border border-zinc-200 p-8 md:p-16 shadow-[20px_20px_0px_rgba(0,0,0,0.02)] space-y-12 animate-in fade-in duration-500">

                            {/* TAB 01: IDENTITY */}
                            {activeTab === "identity" && (
                                <div className="space-y-10">
                                    <SectionTitle title="Identity Specifications" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField label="Full Identity Name" name="full_name" defaultValue={user.full_name} required />
                                        <div className="space-y-2 opacity-50 cursor-not-allowed">
                                            <label className="text-[9px] font-black uppercase italic text-zinc-400">Archive Email (Primary Link)</label>
                                            <div className="bg-zinc-50 p-4 text-xs font-bold text-zinc-400 border border-zinc-100 uppercase">{user.email}</div>
                                        </div>
                                        <InputField label="Communication Node (Phone)" name="phone" defaultValue={user.phone} placeholder="+84 ..." />
                                    </div>
                                </div>
                            )}

                            {/* TAB 02: SECURITY */}
                            {activeTab === "security" && (
                                <div className="space-y-10">
                                    <SectionTitle title="Access Security Protocol" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField label="Current Access Key" name="currentPassword" type="password" placeholder="********" />
                                        <InputField label="New Access Key" name="newPassword" type="password" placeholder="********" />
                                    </div>
                                    <p className="text-[9px] text-zinc-400 italic font-medium uppercase tracking-widest">* Leave blank to keep current access key.</p>
                                </div>
                            )}

                            {/* TAB 03: ADDRESS */}
                            {activeTab === "address" && (
                                <div className="space-y-10">
                                    <SectionTitle title="Primary Shipping Node" />
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase italic text-zinc-400">Global Shipping Address</label>
                                        <textarea
                                            name="address"
                                            defaultValue={user.address}
                                            placeholder="ENTER FULL STREET, CITY, COUNTRY..."
                                            className="w-full bg-[#f0f4f2] border border-[#d1dbd6] p-5 text-xs font-bold uppercase outline-none focus:border-[oklch(0.65_0.1_170)] h-32 resize-none transition-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SAVE BUTTON */}
                            <div className="pt-10 border-t border-zinc-100 flex justify-end">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="bg-[oklch(0.22_0.06_240)] text-white px-12 py-6 text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center gap-4 hover:bg-[oklch(0.65_0.1_170)] transition-none shadow-[10px_10px_0px_rgba(0,0,0,0.1)] cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? "TRANSMITTING..." : "COMMIT CHANGES"}
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

function TabBtn({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 px-6 py-5 text-[10px] font-black uppercase italic tracking-widest border-b border-zinc-100 last:border-0 transition-none cursor-pointer",
                active ? "bg-[oklch(0.65_0.1_170)] text-white" : "text-zinc-400 hover:bg-zinc-50 hover:text-black"
            )}
        >
            <span className={cn(active ? "text-white" : "text-[oklch(0.65_0.1_170)]")}>{icon}</span>
            {label}
        </button>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <Zap size={14} className="text-[oklch(0.65_0.1_170)]" />
            <h3 className="text-xs font-black uppercase italic tracking-[0.2em]">{title}</h3>
            <div className="flex-1 h-px bg-zinc-100" />
        </div>
    );
}

function InputField({ label, ...props }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase italic text-zinc-400">{label}</label>
            <input
                className="w-full bg-[#f0f4f2] border border-[#d1dbd6] p-4 text-xs font-bold uppercase outline-none focus:border-[oklch(0.65_0.1_170)] transition-none"
                autoComplete="one-time-code"
                {...props}
            />
        </div>
    );
}