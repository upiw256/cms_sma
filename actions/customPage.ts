"use server";

import dbConnect from "@/lib/db";
import CustomPage from "@/models/CustomPage";
import { revalidatePath } from "next/cache";

export async function getAllPages() {
  await dbConnect();
  const pages = await CustomPage.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(pages));
}

export async function getPageById(id: string) {
  await dbConnect();
  const page = await CustomPage.findById(id).lean();
  return JSON.parse(JSON.stringify(page));
}

export async function getPageBySlug(slug: string) {
  await dbConnect();
  const page = await CustomPage.findOne({ slug, is_published: true }).lean();
  return JSON.parse(JSON.stringify(page));
}

export async function createPage(data: { title: string; slug: string; meta_description?: string; is_published?: boolean }) {
  await dbConnect();
  try {
    const newPage = await CustomPage.create({
      ...data,
      layout_blocks: []
    });
    revalidatePath("/dashboard/pages");
    return { success: true, pageId: newPage._id.toString() };
  } catch (error: any) {
    if (error.code === 11000) return { success: false, message: "URL Slug sudah digunakan." };
    return { success: false, message: error.message };
  }
}

export async function updatePageData(id: string, data: { title?: string; slug?: string; meta_description?: string; is_published?: boolean }) {
  await dbConnect();
  try {
    await CustomPage.findByIdAndUpdate(id, data);
    revalidatePath("/dashboard/pages");
    revalidatePath(`/page/${data.slug || ""}`);
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) return { success: false, message: "URL Slug sudah digunakan." };
    return { success: false, message: error.message };
  }
}

export async function savePageBlocks(id: string, blocks: any[]) {
  await dbConnect();
  try {
    await CustomPage.findByIdAndUpdate(id, { layout_blocks: blocks });
    const page = await CustomPage.findById(id).lean();
    if(page) {
      revalidatePath(`/page/${page.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deletePage(id: string) {
  await dbConnect();
  try {
    await CustomPage.findByIdAndDelete(id);
    revalidatePath("/dashboard/pages");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
