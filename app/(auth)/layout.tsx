import { Header } from "@/components/header";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-start pt-32 md:pt-40 px-4 pb-20">
        <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
          {children}
        </div>
      </main>
      
      <footer className="border-t border-border py-10 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-muted-foreground opacity-50">
            &copy; {new Date().getFullYear()} HQ Streetwear Collective // All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}