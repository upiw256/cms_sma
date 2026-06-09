"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Edit2 } from "lucide-react";
import { createSubject, updateSubject } from "@/actions/subject";
import { showToast, showAlert } from "@/lib/swal";

// JP defaults sesuai Kurikulum Merdeka
const JP_DEFAULTS: Record<string, number> = {
  // Fase E (Kelas X) - Kelompok IPS (maks 8 JP)
  Kelompok_IPS: 8,
  // Fase E (Kelas X) - Kelompok IPA (maks 6 JP)
  Kelompok_IPA: 6,
  // Wajib 3 JP (B.Indonesia, Matematika, B.Inggris)
  Wajib_3: 3,
  // Wajib 2 JP (Agama, PPKn, PJOK, Seni, Informatika, dll)
  Wajib: 2,
  // Pilihan (Fase F - maks 5 JP)
  Pilihan: 5,
  // Prakarya & Kewirausahaan
  Prakarya: 2,
  // Muatan Lokal
  "Muatan Lokal": 2,
};

const PHASE_OPTIONS = [
  { value: "E", label: "Fase E (Kelas X)" },
  { value: "F", label: "Fase F (Kelas XI & XII)" },
  { value: "Umum", label: "Umum (Semua Fase)" },
];

const TYPE_OPTIONS: Record<string, { value: string; label: string; jp: number }[]> = {
  E: [
    { value: "Kelompok_IPS", label: "Kelompok IPS (Sosiologi, Ekonomi, Sejarah, Geografi) — maks 8 JP", jp: 8 },
    { value: "Kelompok_IPA", label: "Kelompok IPA (Fisika, Kimia, Biologi) — maks 6 JP", jp: 6 },
    { value: "Wajib", label: "Mapel Wajib — 3 JP (B.Indonesia / Mat / B.Inggris)", jp: 3 },
    { value: "Wajib", label: "Mapel Wajib — 2 JP (Agama, PPKn, PJOK, Informatika, Seni, Mulok)", jp: 2 },
    { value: "Muatan Lokal", label: "Muatan Lokal — maks 2 JP", jp: 2 },
  ],
  F: [
    { value: "Wajib", label: "Mapel Wajib 3 JP (B.Indonesia / Mat / B.Inggris)", jp: 3 },
    { value: "Wajib", label: "Mapel Wajib 2 JP (Agama, PPKn, PJOK, Sejarah, Seni)", jp: 2 },
    { value: "Pilihan", label: "Mapel Pilihan (Fisika, Kimia, Biologi, dll) — 5 JP", jp: 5 },
    { value: "Prakarya", label: "Prakarya & Kewirausahaan (Pilihan) — maks 2 JP", jp: 2 },
    { value: "Muatan Lokal", label: "Muatan Lokal — maks 2 JP", jp: 2 },
  ],
  Umum: [
    { value: "Wajib", label: "Wajib", jp: 2 },
    { value: "Pilihan", label: "Pilihan (Fase F)", jp: 5 },
    { value: "Kelompok_IPA", label: "Kelompok IPA (Fase E)", jp: 6 },
    { value: "Kelompok_IPS", label: "Kelompok IPS (Fase E)", jp: 8 },
    { value: "Muatan Lokal", label: "Muatan Lokal", jp: 2 },
    { value: "Prakarya", label: "Prakarya & Kewirausahaan", jp: 2 },
  ],
};

const TYPE_BADGE: Record<string, string> = {
  Wajib: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  Pilihan: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20",
  Kelompok_IPA: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  Kelompok_IPS: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  "Muatan Lokal": "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600",
  Prakarya: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
};

export { TYPE_BADGE };

export default function SubjectFormModalClient({
  subject,
}: {
  subject?: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!subject;

  const [formData, setFormData] = useState({
    name: subject?.name || "",
    code: subject?.code || "",
    phase: subject?.phase || "E",
    subject_type: subject?.subject_type || "Wajib",
    jp_per_week: subject?.jp_per_week || 2,
  });

  // Auto-suggest jp based on selected type & phase
  const currentTypeOptions = TYPE_OPTIONS[formData.phase] || TYPE_OPTIONS["Umum"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = isEditing
        ? await updateSubject(subject._id, formData)
        : await createSubject(formData);

      if (result.success) {
        setOpen(false);
        showToast(isEditing ? "Mata Pelajaran berhasil diperbarui!" : "Mata Pelajaran berhasil ditambahkan!", "success");
        if (!isEditing) {
          setFormData({ name: "", code: "", phase: "E", subject_type: "Wajib", jp_per_week: 2 });
        }
      } else {
        showAlert({ title: "Terjadi Kesalahan", text: result.message || "Gagal menyimpan data", icon: "error" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <>
        {isEditing ? (
          <Button onClick={() => setOpen(true)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500">
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={() => setOpen(true)} size="sm" variant="secondary" className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
            <Plus className="w-4 h-4 mr-2" /> Tambah Mapel
          </Button>
        )}
      </>
      <DialogContent className="max-w-lg dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}</DialogTitle>
          <p className="text-xs text-slate-500 mt-1">Berdasarkan Kurikulum Merdeka (Fase E & F)</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Fase */}
          <div className="space-y-2">
            <Label>Fase <span className="text-red-500">*</span></Label>
            <Select
              value={formData.phase}
              onValueChange={(v) => setFormData({ ...formData, phase: v, subject_type: "Wajib" })}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10">
                {PHASE_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipe / Kelompok dengan JP hint */}
          <div className="space-y-2">
            <Label>Kelompok / Tipe Mapel <span className="text-red-500">*</span></Label>
            <Select
              value={formData.subject_type}
              onValueChange={(v) => {
                // Auto-set JP based on selection
                const matched = currentTypeOptions.find((o) => o.value === v);
                setFormData({ ...formData, subject_type: v, jp_per_week: matched?.jp ?? formData.jp_per_week });
              }}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10">
                {/* deduplicated entries */}
                {Array.from(new Map(currentTypeOptions.map((o) => [o.value, o])).values()).map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <Label>Nama Mata Pelajaran <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Contoh: Matematika / Fisika / Geografi"
            />
          </div>

          {/* Kode */}
          <div className="space-y-2">
            <Label>Kode Mapel <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Contoh: MAT / FIS / GEO"
            />
          </div>

          {/* JP per Minggu */}
          <div className="space-y-2">
            <Label>JP per Minggu</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.jp_per_week}
                onChange={(e) => setFormData({ ...formData, jp_per_week: parseInt(e.target.value) || 0 })}
                className="dark:bg-slate-800 dark:border-white/10 w-24"
              />
              <span className="text-sm text-slate-500">
                JP/minggu = {formData.jp_per_week * 36} JP/tahun
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {formData.phase === "E" && formData.subject_type === "Kelompok_IPS" && "Kelompok IPS Fase E: maks 8 JP/minggu (288 JP/tahun)"}
              {formData.phase === "E" && formData.subject_type === "Kelompok_IPA" && "Kelompok IPA Fase E: maks 6 JP/minggu (216 JP/tahun)"}
              {formData.subject_type === "Wajib" && formData.jp_per_week === 3 && "Mapel Wajib 3 JP: B. Indonesia / Matematika / B. Inggris"}
              {formData.subject_type === "Wajib" && formData.jp_per_week === 2 && "Mapel Wajib 2 JP: Agama, PPKn, PJOK, Seni, dll."}
              {formData.subject_type === "Pilihan" && "Mapel Pilihan Fase F: 5 JP/minggu (180 JP/tahun)"}
              {formData.subject_type === "Prakarya" && "Prakarya & Kewirausahaan: maks 2 JP/minggu"}
              {formData.subject_type === "Muatan Lokal" && "Muatan Lokal: maks 2 JP/minggu (72 JP/tahun)"}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-3 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Mapel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
