"use server";

import dbConnect from "@/lib/db";
import ClassGroup from "@/models/ClassGroup";
import Student from "@/models/Student";
import { revalidatePath } from "next/cache";

export async function createClass(data: any) {
  try {
    await dbConnect();
    const newClass = new ClassGroup(data);
    await newClass.save();
    revalidatePath("/dashboard/kelas");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateClass(id: string, data: any) {
  try {
    await dbConnect();
    await ClassGroup.findByIdAndUpdate(id, data);
    revalidatePath("/dashboard/kelas");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteClass(id: string) {
  try {
    await dbConnect();
    await ClassGroup.findByIdAndDelete(id);
    // Remove class reference from students
    await Student.updateMany({ class_id: id }, { $unset: { class_id: 1 } });
    revalidatePath("/dashboard/kelas");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
