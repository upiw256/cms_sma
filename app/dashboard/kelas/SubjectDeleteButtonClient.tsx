"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { deleteSubject } from "@/actions/subject";
import { showToast, showConfirm, showAlert } from "@/lib/swal";

export default function SubjectDeleteButtonClient({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (await showConfirm("Anda yakin ingin menghapus Mata Pelajaran ini? Data tidak dapat dikembalikan.")) {
      startTransition(async () => {
        const result = await deleteSubject(id);
        if (result.success) {
          showToast("Mata Pelajaran berhasil dihapus", "success");
        } else {
          showAlert({ title: "Gagal", text: result.message || "Gagal menghapus", icon: "error" });
        }
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:border-white/10 dark:hover:bg-slate-800"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
    </Button>
  );
}
