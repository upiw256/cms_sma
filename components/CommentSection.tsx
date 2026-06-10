"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { User, MessageSquare, Heart, Reply, ChevronDown, ChevronUp, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createComment, likeComment } from "@/actions/comment";

// ----- helper: generate fingerprint dari browser -----
function getFingerprint(): string {
  if (typeof window === "undefined") return "server";
  let fp = localStorage.getItem("_cmsfp");
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("_cmsfp", fp);
  }
  return fp;
}

// ----- Form komentar (dipakai untuk root & reply) -----
function CommentForm({
  articleId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Tulis komentar Anda...",
  compact = false,
}: {
  articleId: string;
  parentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [formData, setFormData] = useState({ name: "", email: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createComment({ ...formData, article_id: articleId, parent_id: parentId ?? null });
      setMessage(res.message);
      setFormData({ name: "", email: "", content: "" });
      setTimeout(() => {
        setMessage("");
        onSuccess();
      }, 2000);
    } catch {
      setMessage("Gagal mengirim komentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? "mt-3" : ""}`}>
      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm border border-emerald-100 dark:border-emerald-800">
          {message}
        </div>
      )}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nama Lengkap</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Anda..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Alamat email..." />
          </div>
        </div>
      )}
      {compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Anda..." className="text-sm h-8" />
          </div>
          <div className="space-y-1">
            <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email..." className="text-sm h-8" />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          required
          rows={compact ? 2 : 3}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          placeholder={placeholder}
        />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-slate-500 dark:text-slate-400 gap-1">
            <X className="w-3.5 h-3.5" /> Batal
          </Button>
        )}
        <Button type="submit" disabled={loading} size="sm" className="bg-[var(--primary-color)] hover:brightness-110 text-white rounded-lg gap-1.5 px-4">
          <Send className="w-3.5 h-3.5" />
          {loading ? "Mengirim..." : (compact ? "Balas" : "Kirim Komentar")}
        </Button>
      </div>
    </form>
  );
}

// ----- Tombol Like -----
function LikeButton({ commentId, initialCount, initialLikes }: { commentId: string; initialCount: number; initialLikes: string[] }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fp = getFingerprint();
    setLiked(initialLikes.includes(fp));
  }, [initialLikes]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    const fp = getFingerprint();
    const prev = liked;
    // Optimistic update
    setLiked(!prev);
    setCount(c => prev ? c - 1 : c + 1);
    try {
      await likeComment(commentId, fp);
    } catch {
      // Revert on error
      setLiked(prev);
      setCount(c => prev ? c + 1 : c - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-200 ${
        liked
          ? "bg-rose-50 dark:bg-rose-900/30 text-rose-500"
          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500"
      }`}
    >
      <Heart className={`w-3.5 h-3.5 transition-transform ${liked ? "fill-rose-500 scale-110" : ""}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

// ----- Item komentar tunggal (dengan nested replies) -----
function CommentItem({
  comment,
  articleId,
  allComments,
  depth = 0,
}: {
  comment: any;
  articleId: string;
  allComments: any[];
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const replies = allComments.filter(
    (c) => c.parent_id && c.parent_id.toString() === comment._id.toString()
  );

  return (
    <div className={`${depth > 0 ? "ml-4 md:ml-8 mt-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4" : ""}`}>
      <div className={`flex gap-3 group ${depth === 0 ? "bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm" : "py-2"}`}>
        {/* Avatar */}
        <div className={`shrink-0 rounded-full flex items-center justify-center font-bold text-white text-sm ${depth === 0 ? "w-9 h-9" : "w-7 h-7"}`}
          style={{ backgroundColor: `hsl(${comment.name.charCodeAt(0) * 137 % 360}, 60%, 55%)` }}>
          {comment.name[0].toUpperCase()}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{comment.name}</span>
            <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "d MMM yyyy · HH:mm")}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>

          {/* Action bar */}
          <div className="flex items-center gap-2 mt-2.5">
            <LikeButton
              commentId={comment._id.toString()}
              initialCount={comment.likes_count || 0}
              initialLikes={comment.likes || []}
            />
            {depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
              >
                <Reply className="w-3.5 h-3.5" />
                Balas
              </button>
            )}
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-1"
              >
                {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {replies.length} balasan
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                Membalas <span className="text-[var(--primary-color)]">@{comment.name}</span>
              </p>
              <CommentForm
                articleId={articleId}
                parentId={comment._id.toString()}
                onSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Balas komentar ${comment.name}...`}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-2 mt-1">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id.toString()}
              comment={reply}
              articleId={articleId}
              allComments={allComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ----- Komponen utama -----
export default function CommentSection({ articleId, comments }: { articleId: string; comments: any[] }) {
  const rootComments = comments.filter((c) => !c.parent_id);
  const totalCount = comments.length;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-[var(--primary-color)]" />
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
          Komentar{totalCount > 0 && <span className="ml-2 text-base font-normal text-slate-400">({totalCount})</span>}
        </h3>
      </div>

      {/* List komentar */}
      <div className="space-y-4 mb-10">
        {rootComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada komentar</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Jadilah yang pertama mengomentari artikel ini.</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment._id.toString()}
              comment={comment}
              articleId={articleId}
              allComments={comments}
            />
          ))
        )}
      </div>

      {/* Form komentar baru */}
      <div className="bg-slate-50 dark:bg-slate-900 p-7 rounded-2xl border border-slate-100 dark:border-white/5">
        <h4 className="text-base font-bold mb-5 text-slate-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--primary-color)]" />
          Tinggalkan Komentar
        </h4>
        <CommentForm
          articleId={articleId}
          onSuccess={() => {}}
          placeholder="Bagikan pendapat Anda tentang artikel ini..."
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          * Komentar akan ditampilkan setelah dimoderasi oleh admin.
        </p>
      </div>
    </div>
  );
}
