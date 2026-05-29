import { getLandingSections } from "@/actions/landingConfig";
import SectionEditorClient from "./SectionEditorClient";
import { LayoutTemplate } from "lucide-react";

export default async function LandingBuilderPage() {
  const sections = await getLandingSections();

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl flex items-center justify-center ring-4 ring-fuchsia-50 dark:ring-fuchsia-500/10 shrink-0">
             <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Landing Page Builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Atur urutan dan visibilitas seksi pada halaman utama (Web Klien).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors p-6">
        <SectionEditorClient initialSections={sections} />
      </div>
    </div>
  );
}
