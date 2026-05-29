"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";

const getFormattedPath = (p: string) => {
  if (!p) return "#";
  if (p.startsWith("/") || p.startsWith("#") || p.startsWith("?")) return p;
  if (/^https?:\/\//i.test(p)) return p;
  if (p.includes(".") && !p.includes(" ")) return `https://${p}`;
  return p;
};

const isExternal = (p: string) => {
  return /^https?:\/\//i.test(getFormattedPath(p));
};

export default function MobileNav({ menus = [] }: { menus?: any[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rootMenus = menus.filter((m) => !m.parent_id).sort((a, b) => a.order - b.order);
  const getSubMenus = (parentId: string) =>
    menus.filter((m) => m.parent_id === parentId).sort((a, b) => a.order - b.order);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg 
          bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 cursor-pointer"
        aria-label="Open Menu"
      >
        <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[110] h-full w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
          <span className="font-bold text-lg text-slate-800 dark:text-white">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-73px)]">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {rootMenus.map((root) => {
              const subMenus = getSubMenus(root._id);
              if (subMenus.length > 0) {
                const isExpanded = expanded[root._id];
                return (
                  <div key={root._id} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleExpand(root._id)}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200
                        hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex justify-between items-center"
                    >
                      {root.title}
                      {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                    </button>
                    {isExpanded && (
                      <div className="pl-4 flex flex-col gap-1">
                        {subMenus.map((sub) => (
                          <Link
                            key={sub._id}
                            href={getFormattedPath(sub.path)}
                            target={isExternal(sub.path) ? "_blank" : "_self"}
                            rel={isExternal(sub.path) ? "noopener noreferrer" : undefined}
                            onClick={() => setOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-400
                              hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-l-2 border-slate-100 dark:border-slate-800"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={root._id}
                  href={getFormattedPath(root.path)}
                  target={isExternal(root.path) ? "_blank" : "_self"}
                  rel={isExternal(root.path) ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200
                    hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {root.title}
                </Link>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="block text-center px-4 py-3 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Login Siakad
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
