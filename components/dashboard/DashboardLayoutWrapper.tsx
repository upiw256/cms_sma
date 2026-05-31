"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, LogOut, Globe } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationDropdown from "./NotificationDropdown";

export default function DashboardLayoutWrapper({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} session={session} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm relative z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate hidden sm:block">
              Sistem Informasi Akademik <span className="text-blue-500">Terpadu</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             <ThemeToggle />
             <NotificationDropdown />
             <Link 
                href="/" 
                target="_blank"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Lihat Website Utama"
             >
               <Globe className="w-4 h-4" />
               <span className="hidden md:inline-block">Web Klien</span>
             </Link>
             
             {/* Simple logout button placeholder or form. */}
             <form action="/api/auth/signout" method="POST" className="block">
                <button type="submit" className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5 text-red-500" />
                </button>
             </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
