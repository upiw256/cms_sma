import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Link from "next/link";
import { Calendar, Tag, Search, Filter } from "lucide-react";

export const metadata = {
  title: "Berita & Pengumuman | SMA KOMPLEKS",
};

export const revalidate = 60; // 1 minute (for comments and dynamic tags)

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; tag?: string }> }) {
  await dbConnect();
  
  const resolvedParams = await searchParams;
  const { cat, tag, q } = resolvedParams as any;

  const query: any = { status: "published" };
  
  if (cat) query.category_type = cat;
  else query.category_type = { $in: ["berita", "pengumuman"] };

  if (tag) query.tags = tag;
  if (q) query.title = { $regex: q, $options: "i" };

  const articles = await Article.find(query)
    .sort({ published_at: -1 })
    .lean();

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Portal Berita</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <form action="/berita">
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={q}
                  placeholder="Cari berita..." 
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all bg-white dark:bg-slate-900 dark:text-white"
                />
              </form>
            </div>
          </div>
        </div>
        
        {/* Chips for Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/berita" className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!cat && !tag ? 'bg-[var(--primary-color)] text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}>Semua</Link>
          <Link href="/berita?cat=berita" className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat==='berita' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}>Berita</Link>
          <Link href="/berita?cat=pengumuman" className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat==='pengumuman' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}>Pengumuman</Link>
          {tag && (
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-600 text-white flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tag: {tag}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">Belum ada berita yang ditemukan.</p>
          ) : (
            articles.map((item: any) => (
              <Link href={`/berita/${item.slug}`} key={item._id.toString()} className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 hover:border-[var(--primary-color)] dark:hover:border-[var(--primary-color)] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-48 overflow-hidden relative shrink-0">
                  <img 
                    src={item.image_banner || "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={item.title} 
                  />
                  <div className="absolute top-4 left-4 bg-[var(--primary-color)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {item.category_type}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(item.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm mb-4 flex-1">
                    {item.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                  
                  {item.tags && item.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                       {item.tags.slice(0, 3).map((t: string, i: number) => (
                         <span key={i} className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{t}</span>
                       ))}
                     </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
