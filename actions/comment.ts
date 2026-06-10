"use server";

import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";

export async function createComment(data: {
  article_id: string;
  name: string;
  email: string;
  content: string;
  parent_id?: string | null;
}) {
  await dbConnect();
  
  const comment = await Comment.create({
    article_id: data.article_id,
    name: data.name,
    email: data.email,
    content: data.content,
    parent_id: data.parent_id || null,
  });

  // Create notification for Admin
  await Notification.create({
    recipient_roles: ["SUPER_ADMIN", "ADMIN"],
    title: data.parent_id ? "Balasan Komentar Baru" : "Komentar Baru",
    message: `${data.name} ${data.parent_id ? "membalas komentar" : "memberikan komentar pada sebuah artikel"}. Menunggu moderasi.`,
    link: "/dashboard/komentar"
  });

  revalidatePath(`/berita`);
  return { success: true, message: "Komentar berhasil dikirim dan menunggu moderasi admin." };
}

export async function likeComment(commentId: string, fingerprint: string) {
  await dbConnect();
  const comment = await Comment.findById(commentId);
  if (!comment) return { success: false };

  const likesArray = comment.likes || [];
  const alreadyLiked = likesArray.includes(fingerprint);
  if (alreadyLiked) {
    // Unlike
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: fingerprint },
      $inc: { likes_count: -1 },
    });
    return { success: true, liked: false };
  } else {
    // Like
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: fingerprint },
      $inc: { likes_count: 1 },
    });
    return { success: true, liked: true };
  }
}

export async function approveComment(id: string) {
  await dbConnect();
  const res = await Comment.findByIdAndUpdate(id, { is_approved: true }, { new: true });
  if (res?.article_id) {
    revalidatePath(`/berita`);
  }
  revalidatePath("/dashboard/komentar");
  return { success: true };
}

export async function deleteComment(id: string) {
  await dbConnect();
  // Hapus komentar beserta semua reply-nya
  await Comment.deleteMany({ parent_id: id });
  await Comment.findByIdAndDelete(id);
  revalidatePath("/dashboard/komentar");
  return { success: true };
}
