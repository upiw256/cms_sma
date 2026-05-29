import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { notFound } from "next/navigation";
import { Calendar, User } from "lucide-react";
import type { Metadata } from 'next';

export const revalidate = 3600; // ISR 1 Hour

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  await dbConnect();
  const article = await Article.findOne({ slug: resolvedParams.slug }).lean();

  if (!article) return { title: "Berita Tidak Ditemukan" };

  return {
    title: `${article.seo_meta?.title || article.title} | SMA KOMPLEKS`,
    description: article.seo_meta?.description || article.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    keywords: article.seo_meta?.keywords,
    openGraph: {
      title: article.title,
      description: article.seo_meta?.description,
      images: [article.image_banner || ""],
    }
  }
}

export default async function BeritaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await dbConnect();
  
  const article = await Article.findOne({ slug: resolvedParams.slug })
    .populate('author_id', 'name')
    .lean();

  if (!article) notFound();

  return (
    <div className="py-20 bg-white min-h-screen">
      <main className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <span className="px-3 py-1 bg-[var(--primary-color)] text-white text-xs font-bold rounded-full uppercase tracking-wider mb-4 inline-block">
            {article.category_type}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium border-b border-t py-4">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--primary-color)]" />
              {(article.author_id as any)?.name || "Administrator"}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
              {new Date(article.published_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {article.image_banner && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-12 shadow-md">
            <img 
              src={article.image_banner} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <article 
          className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-[var(--primary-color)] prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </main>
    </div>
  );
}
