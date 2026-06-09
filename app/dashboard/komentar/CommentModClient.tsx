"use client";

import { showToast, showAlert, showConfirm } from "@/lib/swal";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { approveComment, deleteComment } from "@/actions/comment";
import Link from "next/link";

export default function CommentModClient({ initialComments }: { initialComments: any[] }) {
  const [comments, setComments] = useState(initialComments);

  const handleApprove = async (id: string) => {
    try {
      await approveComment(id);
      setComments(comments.map(c => c._id === id ? { ...c, is_approved: true } : c));
    } catch (e) {
      showAlert({ text: "Gagal menyetujui komentar.", icon: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await showConfirm("Yakin ingin menghapus komentar ini?"))) return;
    try {
      await deleteComment(id);
      setComments(comments.filter(c => c._id !== id));
    } catch (e) {
      showAlert({ text: "Gagal menghapus komentar.", icon: "error" });
    }
  };

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Belum ada komentar.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className={`p-4 rounded-xl border ${comment.is_approved ? 'border-slate-100 bg-white' : 'border-amber-200 bg-amber-50'} flex flex-col md:flex-row gap-4 justify-between items-start md:items-center`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-slate-800">{comment.name}</span>
                <span className="text-sm text-slate-500">{comment.email}</span>
                <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "dd MMM yyyy HH:mm")}</span>
                {!comment.is_approved && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-800">Menunggu Moderasi</span>
                )}
              </div>
              <p className="text-slate-600 text-sm mb-3">"{comment.content}"</p>
              {comment.article_id && (
                <Link href={`/berita/${comment.article_id.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {comment.article_id.title}
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
               {!comment.is_approved && (
                 <Button onClick={() => handleApprove(comment._id)} variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8 text-xs">
                   <CheckCircle className="w-4 h-4 mr-1.5" /> Setujui
                 </Button>
               )}
               <Button onClick={() => handleDelete(comment._id)} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 h-8 w-8 p-0">
                 <Trash2 className="w-4 h-4" />
               </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
