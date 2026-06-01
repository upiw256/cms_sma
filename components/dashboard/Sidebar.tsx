"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, UserCog, GraduationCap, LayoutDashboard, ScanLine, X, Globe, FileText, Newspaper, MessageSquare, ClipboardList } from "lucide-react";

export const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Dashboard Utama", icon: LayoutDashboard, color: "text-blue-500" },
  { href: "/dashboard/identity", label: "Identitas Sekolah", icon: UserCog, color: "text-blue-600" },
  { href: "/dashboard/organigram", label: "Struktur Organisasi", icon: Users, color: "text-emerald-600" },
  { href: "/dashboard/landing-builder", label: "Landing Builder", icon: Globe, color: "text-fuchsia-500" },
  { href: "/dashboard/pages", label: "Halaman Custom", icon: FileText, color: "text-indigo-500" },
  { href: "/dashboard/menus", label: "Menu Navigation", icon: LayoutDashboard, color: "text-orange-500" },
  { href: "/dashboard/berita", label: "Berita & Pengumuman", icon: Newspaper, color: "text-sky-500" },
  { href: "/dashboard/komentar", label: "Moderasi Komentar", icon: MessageSquare, color: "text-teal-500" },
  { href: "/dashboard/siswa", label: "Data Siswa", icon: Users, color: "text-emerald-500" },
  { href: "/dashboard/guru", label: "Data Guru", icon: UserCog, color: "text-violet-500" },
  { href: "/dashboard/kelas", label: "Kelas & Mapel", icon: BookOpen, color: "text-amber-500" },
  { href: "/dashboard/tahun-ajaran", label: "Thn Ajaran", icon: GraduationCap, color: "text-rose-500" },
  { href: "/dashboard/piket", label: "Piket & Absensi", icon: ScanLine, color: "text-cyan-500" },
  { href: "/dashboard/ppdb", label: "PPDB — Daftar Ulang", icon: ClipboardList, color: "text-orange-500" },
];

export default function Sidebar({ isOpen, setIsOpen, session }: { isOpen: boolean, setIsOpen: (val: boolean) => void, session: any }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex flex-shrink-0 items-center justify-center text-white font-bold text-sm shadow-md">
                {session?.user?.name?.[0] || 'A'}
             </div>
             <div>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">SIAKAD</h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Admin Panel</p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {DASHBOARD_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl font-medium transition-all group relative overflow-hidden ${
                  isActive 
                    ? "text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-md" />
                )}
                <link.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : link.color} group-hover:scale-110 transition-transform`} />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase shrink-0">
              {session?.user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{session?.user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
