"use server";

import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function createComment(data: {
  article_id: string;
  name: string;
  email: string;
  content: string;
}) {
  await dbConnect();
  
  const comment = await Comment.create({
    ...data,
  });

  // Create notification for Admin
  await Notification.create({
    recipient_roles: ["SUPER_ADMIN", "ADMIN"],
    title: "Komentar Baru",
    message: `${data.name} memberikan komentar pada sebuah artikel. Menunggu moderasi.`,
    link: "/dashboard/komentar"
  });

  revalidatePath(`/berita`);
  return { success: true, message: "Komentar berhasil dikirim dan menunggu moderasi admin." };
}

export async function approveComment(id: string) {
  await dbConnect();
  const res = await Comment.findByIdAndUpdate(id, { is_approved: true }, { new: true });
  if (res?.article_id) {
    revalidatePath(`/berita`); // brute force revalidate 
  }
  revalidatePath("/dashboard/komentar");
  return { success: true };
}

export async function deleteComment(id: string) {
  await dbConnect();
  await Comment.findByIdAndDelete(id);
  revalidatePath("/dashboard/komentar");
  return { success: true };
}
