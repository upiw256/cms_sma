"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Trash2 } from "lucide-react";
import { setActiveAcademicYear, deleteAcademicYear } from "@/actions/academicYear";
import { showToast, showAlert, showConfirm } from "@/lib/swal";

export function SetActiveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSetActive = async () => {
    if (await showConfirm("Jadikan periode ini sebagai Tahun Ajaran Aktif? Periode aktif sebelumnya akan diarsipkan.")) {
      startTransition(async () => {
        const result = await setActiveAcademicYear(id);
        if (result.success) {
          showToast("Tahun Ajaran Aktif berhasil diperbarui!", "success");
        } else {
          showAlert({ title: "Gagal", text: result.message, icon: "error" });
        }
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSetActive}
      disabled={isPending}
      className="dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/10"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
      Set Aktif
    </Button>
  );
}

export function DeleteAcademicYearButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (await showConfirm("Anda yakin ingin menghapus periode tahun ajaran ini?")) {
      startTransition(async () => {
        const result = await deleteAcademicYear(id);
        if (result.success) {
          showToast("Tahun Ajaran berhasil dihapus!", "success");
        } else {
          showAlert({ title: "Gagal", text: result.message, icon: "error" });
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
