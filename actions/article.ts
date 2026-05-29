"use server";

import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export async function createArticle(data: {
  title: string;
  content: string;
  category_type: "berita" | "pengumuman" | "fasilitas";
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
  });

  revalidatePath("/berita");
  revalidatePath("/");
  
  return JSON.parse(JSON.stringify(article));
}
