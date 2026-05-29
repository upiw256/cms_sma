"use client";

import { useState, useTransition } from "react";
import { updateLandingSections } from "@/actions/landingConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SectionEditorClient({ initialSections }: { initialSections: any[] }) {
  // Sort sections by display order
  const [sections, setSections] = useState([...initialSections].sort((a, b) => a.display_order - b.display_order));
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    // Swap elements
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    // Update display_order property based on index
    newSections.forEach((sec, i) => sec.display_order = i + 1);
    setSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    // Swap elements
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    // Update display_order property based on index
    newSections.forEach((sec, i) => sec.display_order = i + 1);
    setSections(newSections);
  };

  const handleToggle = (index: number) => {
    const newSections = [...sections];
    newSections[index].is_visible = !newSections[index].is_visible;
    setSections(newSections);
  };

  const handleTitleChange = (index: number, val: string) => {
    const newSections = [...sections];
    newSections[index].custom_title = val;
    setSections(newSections);
  };

  const saveConfig = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const payload = sections.map((sec) => ({
          _id: sec._id,
          display_order: sec.display_order,
          is_visible: sec.is_visible,
          custom_title: sec.custom_title || "",
        }));

        const result = await updateLandingSections(payload);
        if (result.success) {
          setFeedback({ type: 'success', message: result.message });
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (err) {
        setFeedback({ type: 'error', message: "Terjadi kesalahan sistem saat menyimpan data." });
      }
    });
  };

  const getSectionNameLookup = (key: string) => {
    const names: Record<string, string> = {
      hero: "Hero Banner",
      stats: "Widget Statistik",
      sambutan: "Sambutan Kepsek",
      news: "Berita & Pengumuman",
      agenda: "Kalender Agenda",
      alumni: "Tracer Study Alumni"
    };
    return names[key] || key;
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`p-4 rounded-xl font-bold flex items-center shadow-sm animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {feedback.message}
        </div>
      )}

      <div className="space-y-3">
        {sections.map((sec, i) => (
          <div 
            key={sec._id}
            className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${sec.is_visible ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-white/5 opacity-80'}`}
          >
            <div className="flex items-center gap-2 md:w-24 shrink-0">
               <button 
                 onClick={() => moveUp(i)}
                 disabled={i === 0}
                 className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md disabled:opacity-30 transition-colors"
               >
                 <ArrowUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
               </button>
               <button 
                 onClick={() => moveDown(i)}
                 disabled={i === sections.length - 1}
                 className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md disabled:opacity-30 transition-colors"
               >
                 <ArrowDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
               </button>
               <div className="text-xl font-black text-slate-300 dark:text-slate-700 w-6 text-center ml-1">{i + 1}</div>
            </div>

            <div className="flex-1 w-full flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="md:w-1/3 shrink-0">
                <p className="font-bold text-slate-800 dark:text-white mb-0.5">{getSectionNameLookup(sec.section_key)}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${sec.is_visible ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {sec.is_visible ? 'Ditampilkan' : 'Disembunyikan'}
                  </span>
                </div>
              </div>
              
              <div className="w-full">
                <Label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1 block">Custom Title (Opsional)</Label>
                <Input 
                  value={sec.custom_title || ""}
                  onChange={(e) => handleTitleChange(i, e.target.value)}
                  placeholder="Gunakan judul bawaan..."
                  className="h-9 text-sm dark:bg-slate-900 dark:border-white/10"
                  disabled={sec.section_key === "hero" || sec.section_key === "stats"} 
                  // Hero & Stats usually don't have titles in the same way
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:ml-auto">
               <button
                  type="button"
                  onClick={() => handleToggle(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${sec.is_visible ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400'}`}
               >
                 {sec.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 {sec.is_visible ? "Hide" : "Show"}
               </button>
            </div>

          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end">
         <Button 
           onClick={saveConfig} 
           disabled={isPending}
           className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white px-8"
         >
           {isPending ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
           ) : (
             <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
           )}
         </Button>
      </div>

    </div>
  );
}
