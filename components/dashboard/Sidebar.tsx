"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, Users, UserCog, GraduationCap, LayoutDashboard, 
  ScanLine, X, Globe, FileText, Newspaper, MessageSquare, 
  ClipboardList, ChevronDown, ChevronRight, School, Laptop, Settings
} from "lucide-react";

export const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Dashboard Utama", icon: LayoutDashboard, color: "text-blue-500" },
  { 
    label: "Profil Sekolah", icon: School, color: "text-emerald-600",
    subMenus: [
      { href: "/dashboard/identity", label: "Identitas Sekolah", icon: UserCog },
      { href: "/dashboard/organigram", label: "Struktur Organisasi", icon: Users },
    ]
  },
  {
    label: "Website Publik", icon: Laptop, color: "text-fuchsia-500",
    subMenus: [
      { href: "/dashboard/landing-builder", label: "Landing Builder", icon: Globe },
      { href: "/dashboard/pages", label: "Halaman Custom", icon: FileText },
      { href: "/dashboard/menus", label: "Menu Navigation", icon: LayoutDashboard },
      { href: "/dashboard/berita", label: "Berita & Pengumuman", icon: Newspaper },
      { href: "/dashboard/komentar", label: "Moderasi Komentar", icon: MessageSquare },
    ]
  },
  {
    label: "Akademik", icon: GraduationCap, color: "text-amber-500",
    subMenus: [
      { href: "/dashboard/siswa", label: "Data Siswa", icon: Users },
      { href: "/dashboard/guru", label: "Data Guru", icon: UserCog },
      { href: "/dashboard/kelas", label: "Kelas & Mapel", icon: BookOpen },
      { href: "/dashboard/tahun-ajaran", label: "Thn Ajaran", icon: GraduationCap },
      { href: "/dashboard/piket", label: "Piket & Absensi", icon: ScanLine },
    ]
  },
  {
    label: "Layanan Khusus", icon: ClipboardList, color: "text-rose-500",
    subMenus: [
      { href: "/dashboard/ppdb", label: "PPDB — Daftar Ulang", icon: ClipboardList },
      { href: "/dashboard/skl", label: "Portal SKL", icon: GraduationCap },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen, session }: { isOpen: boolean, setIsOpen: (val: boolean) => void, session: any }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    // Initially open the section that contains the active link
    "Profil Sekolah": ["/dashboard/identity", "/dashboard/organigram"].includes(pathname),
    "Website Publik": ["/dashboard/landing-builder", "/dashboard/pages", "/dashboard/menus", "/dashboard/berita", "/dashboard/komentar"].includes(pathname),
    "Akademik": ["/dashboard/siswa", "/dashboard/guru", "/dashboard/kelas", "/dashboard/tahun-ajaran", "/dashboard/piket"].includes(pathname),
    "Layanan Khusus": ["/dashboard/ppdb", "/dashboard/skl"].includes(pathname),
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

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
            if (link.subMenus) {
              const isOpenMenu = openMenus[link.label];
              const isChildActive = link.subMenus.some(sub => pathname === sub.href);
              
              return (
                <div key={link.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(link.label)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all group ${
                      isChildActive && !isOpenMenu
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5 ring-1 ring-blue-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <link.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isChildActive ? 'text-blue-600 dark:text-blue-400' : link.color} group-hover:scale-110 transition-transform`} />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {isOpenMenu ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    )}
                  </button>

                  <div 
                    className={`pl-11 pr-2 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpenMenu ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    {link.subMenus.map(subLink => {
                      const isActive = pathname === subLink.href;
                      return (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                            isActive
                              ? "text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20"
                              : "text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-500 rounded-r-md" />
                          )}
                          <span className="truncate">{subLink.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

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

