"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "@/actions/article";
import { useRouter } from "next/navigation";

export default function DeleteArticleButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setLoading(true);
    try {
      await deleteArticle(id);
      router.refresh();
    } catch {
      alert("Gagal menghapus artikel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-slate-400 hover:text-rose-600" 
      onClick={handleDelete} 
      disabled={loading}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
