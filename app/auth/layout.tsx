import { getSchoolConfig } from "@/actions/schoolConfig";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, Quote } from "lucide-react";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSchoolConfig();

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* LEFT PANE - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 p-12 overflow-hidden bg-slate-900 border-r border-slate-200/20">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2670&auto=format&fit=crop" 
            alt="School Campus" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        </div>
        
        <div className="relative z-10 flex-1">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Kembali ke Beranda</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-900/50">
            {(config?.name || "SMA")[0]}
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sistem Informasi <br/> Akademik Terpadu
          </h1>
          <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <Quote className="w-8 h-8 text-blue-400/50 absolute top-4 left-4" />
            <p className="text-slate-300 text-lg leading-relaxed relative z-10 pl-6 border-l-[3px] border-blue-500">
              Platform layanan administrasi dan akademik digital untuk mendukung proses belajar mengajar secara efisien.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - Auth content */}
      <div className="flex-1 flex flex-col pt-6 px-4 md:px-12 lg:px-24">
        {/* Mobile quick header */}
        <div className="lg:hidden flex items-center justify-between mb-8 w-full max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {(config?.name || "SMA")[0]}
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">SIAKAD</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Desktop top-right actions */}
        <div className="hidden lg:flex items-center justify-end absolute top-6 right-6 gap-4">
           <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full mb-12">
          {children}
        </div>
        
        <div className="text-center pb-6 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto w-full">
          &copy; {new Date().getFullYear()} {config?.name}. Hak Cipta Dilindungi.
        </div>
      </div>

    </div>
  );
}
