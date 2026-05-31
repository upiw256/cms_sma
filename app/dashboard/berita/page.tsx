import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DeleteArticleButton from "./DeleteArticleButton";


export default async function BeritaList() {
  await dbConnect();
  
  const articles = await Article.find().sort({ createdAt: -1 }).populate('author_id', 'name').lean();

  return (
    <div className="space-y-6 animate-slide-up max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daftar Berita & Pengumuman</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola konten berita, pengumuman, dan fasilitas website.</p>
        </div>
        <Link href="/dashboard/berita/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Judul Artikel</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Publikasi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {articles.map((item: any) => (
                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">/{item.slug}</p>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500">{item.category_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status || "draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(item.published_at), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Link href={`/berita/${item.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/berita/edit/${item._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteArticleButton id={item._id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada artikel yang ditambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
