import { getGradingFilters } from "@/actions/grade";
import GradesGridClient from "./GradesGridClient";
import { Calculator } from "lucide-react";

export default async function NilaiPage() {
  const filters = await getGradingFilters();

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center ring-4 ring-blue-50 dark:ring-blue-500/10 shrink-0">
             <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Penilaian & E-Rapor</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Input nilai Tugas, UTS, dan UAS dalam format spreadsheet.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors p-6">
        <GradesGridClient filters={filters} />
      </div>
    </div>
  );
}
