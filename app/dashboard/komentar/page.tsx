import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import CommentModClient from "./CommentModClient";


export default async function KomentarPage() {
  await dbConnect();
  
  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .populate('article_id', 'title slug')
    .lean();

  return (
    <div className="space-y-6 animate-slide-up max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Moderasi Komentar</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola komentar artikel dari publik.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden p-6">
         <CommentModClient initialComments={JSON.parse(JSON.stringify(comments))} />
      </div>
    </div>
  );
}
