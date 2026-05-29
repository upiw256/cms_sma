import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Link from "next/link";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Berita & Pengumuman | SMA KOMPLEKS",
};

export const revalidate = 3600; // ISR 1 hour

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await dbConnect();
  
  const articles = await Article.find({ category_type: { $in: ["berita", "pengumuman"] } })
    .sort({ published_at: -1 })
    .lean();

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-extrabold mb-12 text-slate-900 border-b pb-6">Berita Terbaru</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.length === 0 ? (
            <p className="text-slate-500 italic">Belum ada berita yang dipublikasikan.</p>
          ) : (
            articles.map((item: any) => (
              <Link href={`/berita/${item.slug}`} key={item._id.toString()} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={item.image_banner || "https://images.unsplash.com/photo-1555116505-38ab61800975?q=80&w=2670&auto=format&fit=crop"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={item.title} 
                    />
                    <div className="absolute top-4 left-4 bg-[var(--primary-color)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      {item.category_type}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-slate-500 flex items-center mb-3">
                      <Calendar className="w-3 h-3 mr-1" /> 
                      {new Date(item.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-3 text-sm">
                      {item.content.replace(/<[^>]*>?/gm, '')}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
