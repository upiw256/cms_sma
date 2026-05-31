"use client";

import { useState } from "react";
import { format } from "date-fns";
import { User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createComment } from "@/actions/comment";

export default function CommentSection({ articleId, comments }: { articleId: string, comments: any[] }) {
  const [formData, setFormData] = useState({ name: "", email: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createComment({ ...formData, article_id: articleId });
      setMessage(res.message);
      setFormData({ name: "", email: "", content: "" });
    } catch (err) {
      setMessage("Gagal memposting komentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-slate-800">Komentar ({comments.length})</h3>
      </div>

      <div className="space-y-6 mb-12">
        {comments.length === 0 ? (
          <p className="text-slate-500 italic bg-slate-50 p-6 rounded-xl border border-dashed text-center">Jadilah yang pertama mengomentari artikel ini.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-slate-800">{comment.name}</span>
                  <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "dd MMM yyyy HH:mm")}</span>
                </div>
                <p className="text-slate-600 text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
        <h4 className="text-lg font-bold mb-6">Tinggalkan Komentar</h4>
        {message && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm border border-emerald-100">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Nama Lengkap</Label>
               <Input 
                 required 
                 value={formData.name} 
                 onChange={e => setFormData({...formData, name: e.target.value})} 
                 placeholder="Nama Anda..." 
               />
             </div>
             <div className="space-y-2">
               <Label>Email</Label>
               <Input 
                 type="email" 
                 required 
                 value={formData.email} 
                 onChange={e => setFormData({...formData, email: e.target.value})} 
                 placeholder="Alamat email..." 
               />
             </div>
          </div>
          <div className="space-y-2">
            <Label>Komentar</Label>
            <textarea 
              required
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Tulis pendapat Anda di sini..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8">
            {loading ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
