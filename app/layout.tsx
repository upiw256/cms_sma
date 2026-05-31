import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getSchoolConfig } from "@/actions/schoolConfig";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "SMA KOMPLEKS | Portal Akademik",
  description: "Portal Resmi dan Sistem Informasi Akademik SMA KOMPLEKS — Pendidikan Berkualitas untuk Generasi Unggul",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSchoolConfig();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {config?.favicon && <link rel="icon" href={config.favicon} />}
        <style>{`
          :root {
            --primary: ${config?.primary_color || "#3b82f6"};
            --secondary: ${config?.secondary_color || "#1d4ed8"};
            --primary-color: ${config?.primary_color || "#3b82f6"};
            --secondary-color: ${config?.secondary_color || "#1d4ed8"};
          }
        `}</style>
        {/* Prevent FOUC for dark mode */}
        <script id="theme-detector" suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                var t = localStorage.getItem('theme');
                if(t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme:dark)').matches)){
                  document.documentElement.classList.add('dark');
                }
              } catch(e){}
            })();
          `
        }} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen flex flex-col antialiased
        text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}
