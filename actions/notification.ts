"use server";

import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
  await dbConnect();
  
  // Real implementation would filter by recipient_roles matching session role
  const unreadCount = await Notification.countDocuments({ is_read: false });
  const recentUnread = await Notification.find({ is_read: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    count: unreadCount,
    items: JSON.parse(JSON.stringify(recentUnread))
  };
}

export async function markAsRead(id: string) {
  await dbConnect();
  await Notification.findByIdAndUpdate(id, { is_read: true });
  return { success: true };
}

export async function markAllAsRead() {
  await dbConnect();
  await Notification.updateMany({ is_read: false }, { $set: { is_read: true } });
  return { success: true };
}
