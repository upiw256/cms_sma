import Link from "next/link";
import { getSchoolConfig } from "@/actions/schoolConfig";
import { getDynamicMenus } from "@/actions/navigationMenu";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";
import PublicNavbar from "@/components/PublicNavbar";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { FacebookIcon } from "@/components/ui/facebook";
import { InstagramIcon } from "@/components/ui/instagram";
import { YoutubeIcon } from "@/components/ui/youtube";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSchoolConfig();
  const menus = await getDynamicMenus("GUEST");

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        "--primary-color": config?.primary_color || "#3b82f6",
        "--secondary-color": config?.secondary_color || "#1d4ed8",
      } as React.CSSProperties}
    >
      {/* ── Modern Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-white/5
        backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {config?.branding_logo ? (
              <img 
                src={config.branding_logo} 
                alt={config.name} 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm
                group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                {(config?.name || "SMA")[0]}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white
              hidden sm:inline-block">
              {config?.name || "SMA KOMPLEKS"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <PublicNavbar menus={menus} />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl
                bg-primary text-primary-foreground
                hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5
                active:translate-y-0 transition-all duration-200"
            >
              Login Siakad
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <MobileNav menus={menus} />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* ── Premium Footer ── */}
      <footer className="relative bg-slate-950 text-slate-400 pt-16 pb-8 mt-auto overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] 
          bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container px-4 mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
            {/* Brand */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                {config?.branding_logo ? (
                  <img src={config.branding_logo} alt={config.name} className="h-12 w-auto object-contain brightness-0 invert" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                    {(config?.name || "SMA")[0]}
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{config?.name}</h3>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                Lembaga pendidikan menengah atas yang berkomitmen mencetak generasi unggul, 
                berakhlak mulia, dan berdaya saing global.
              </p>
              <div className="flex gap-3">
                {config?.social_media?.facebook && (
                  <a href={config.social_media.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                      hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200">
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {config?.social_media?.instagram && (
                  <a href={config.social_media.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                      hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:border-transparent hover:text-white transition-all duration-200">
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {config?.social_media?.youtube && (
                  <a href={config.social_media.youtube} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                      hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200">
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Navigasi</h4>
              <ul className="space-y-3">
                {[
                  { href: "/profil", label: "Profil Sekolah" },
                  { href: "/visi-misi", label: "Visi & Misi" },
                  { href: "/fasilitas", label: "Fasilitas" },
                  { href: "/berita", label: "Berita & Agenda" },
                  { href: "/download", label: "Unduhan" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-white transition-colors duration-200
                      flex items-center gap-1 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-500 rounded transition-all duration-200" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Kontak</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm">{config?.contact_info?.address || "Jl. Pendidikan No. 1, Kota Pelajar"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm">{config?.contact_info?.phone || "+62 812 3456 7890"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm">{config?.contact_info?.email || "info@sekolah.sch.id"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} {config?.name}. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Built with <span className="text-red-400">♥</span> using Next.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
