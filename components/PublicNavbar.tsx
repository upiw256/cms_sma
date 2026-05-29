"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function PublicNavbar({ menus }: { menus: any[] }) {
  const pathname = usePathname();

  const rootMenus = menus.filter((m) => !m.parent_id).sort((a, b) => a.order - b.order);
  const getSubMenus = (parentId: string) =>
    menus.filter((m) => m.parent_id === parentId).sort((a, b) => a.order - b.order);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {rootMenus.map((root) => {
        const subMenus = getSubMenus(root._id);
        const isActive = pathname === root.path || subMenus.some(s => pathname === s.path);
        const activeClass = isActive 
          ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white" 
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10";

        if (subMenus.length > 0) {
          return (
            <DropdownMenu key={root._id}>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${activeClass} outline-none`}
              >
                {root.title} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 dark:bg-slate-900 dark:border-white/10 z-[100]">
                {subMenus.map((sub) => (
                  <DropdownMenuItem key={sub._id} className="cursor-pointer dark:focus:bg-slate-800 p-0">
                    <Link 
                      href={getFormattedPath(sub.path)} 
                      target={isExternal(sub.path) ? "_blank" : "_self"}
                      rel={isExternal(sub.path) ? "noopener noreferrer" : undefined}
                      className="w-full px-2 py-1.5 block"
                    >
                      {sub.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={root._id}
            href={getFormattedPath(root.path)}
            target={isExternal(root.path) ? "_blank" : "_self"}
            rel={isExternal(root.path) ? "noopener noreferrer" : undefined}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${activeClass}`}
          >
            {root.title}
          </Link>
        );
      })}
    </nav>
  );
}
