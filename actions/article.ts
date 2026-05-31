"use server";

import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

function truncateHtml(html: string, length: number) {
  return html.replace(/<[^>]*>?/gm, '').substring(0, length);
}

export async function createArticle(data: {
  title: string;
  content: string;
  category_type: "berita" | "pengumuman" | "fasilitas";
  status: "draft" | "published";
  tags: string[];
  image_banner?: string;
  author_id: string; // From session.user.id
}) {
  await dbConnect();
  
  const baseSlug = slugify(data.title, { lower: true, strict: true });
  let slug = baseSlug;
  
  // ensure unique slug
  let counter = 1;
  while (await Article.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const article = await Article.create({
    ...data,
    slug,
    seo_meta: {
      title: data.title,
      description: truncateHtml(data.content, 150),
      keywords: data.tags,
    }
  });

  revalidatePath("/berita");
  revalidatePath("/");
  
  return JSON.parse(JSON.stringify(article));
}

export async function updateArticle(id: string, data: Partial<{
  title: string;
  content: string;
  category_type: "berita" | "pengumuman" | "fasilitas";
  status: "draft" | "published";
  tags: string[];
  image_banner?: string;
}>) {
  await dbConnect();
  
  const updateData: any = { ...data };
  
  if (data.title) {
    updateData.seo_meta = {
      title: data.title,
      description: updateData.content ? truncateHtml(updateData.content, 150) : undefined,
      keywords: data.tags || [],
    };
  }

  const article = await Article.findByIdAndUpdate(id, updateData, { new: true });
  
  revalidatePath("/berita");
  if (article?.slug) revalidatePath(`/berita/${article.slug}`);
  revalidatePath("/");
  
  return JSON.parse(JSON.stringify(article));
}

export async function deleteArticle(id: string) {
  await dbConnect();
  await Article.findByIdAndDelete(id);
  revalidatePath("/berita");
  revalidatePath("/");
  return { success: true };
}
