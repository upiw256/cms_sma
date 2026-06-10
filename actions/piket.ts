"use server";

import dbConnect from "@/lib/db";
import PiketPermit from "@/models/PiketPermit";
import "@/models/User";
import "@/models/ClassGroup";
import "@/models/Student";
import { revalidatePath } from "next/cache";

export async function createPiketPermit(data: {
  student_id: string;
  permit_type: "KELUAR" | "MASUK" | "DISPENSASI";
  reason: string;
}) {
  try {
    await dbConnect();
    const permit = await PiketPermit.create({
      student_id: data.student_id,
      permit_type: data.permit_type,
      reason: data.reason,
      printed_at: new Date(),
    });
    
    revalidatePath("/dashboard/piket");

    return { success: true, id: permit._id.toString() };
  } catch (error) {
    console.error("Failed to create Piket Permit", error);
    return { success: false, error: "Failed to save permit" };
  }
}

export async function getRecentPermits() {
  try {
    await dbConnect();
    const permits = await PiketPermit.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "student_id",
        populate: [
          { path: "user_id", select: "name nip_nisn" },
          { path: "class_id", select: "name" }
        ]
      })
      .lean();
      
    return JSON.parse(JSON.stringify(permits));
  } catch (error) {
    console.error("Failed to get recent permits", error);
    return [];
  }
}
