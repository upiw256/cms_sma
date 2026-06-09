"use server";

import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import { revalidatePath } from "next/cache";

export async function createSubject(data: any) {
  try {
    await dbConnect();
    const newSubject = new Subject(data);
    await newSubject.save();
    revalidatePath("/dashboard/kelas");
    revalidatePath("/dashboard/guru");
    return { success: true };
  } catch (err: any) {
    if (err.code === 11000) return { success: false, message: "Kode Mata Pelajaran sudah ada!" };
    return { success: false, message: err.message };
  }
}

export async function updateSubject(id: string, data: any) {
  try {
    await dbConnect();
    await Subject.findByIdAndUpdate(id, data);
    revalidatePath("/dashboard/kelas");
    revalidatePath("/dashboard/guru");
    return { success: true };
  } catch (err: any) {
    if (err.code === 11000) return { success: false, message: "Kode Mata Pelajaran sudah ada!" };
    return { success: false, message: err.message };
  }
}

export async function deleteSubject(id: string) {
  try {
    await dbConnect();
    await Subject.findByIdAndDelete(id);
    revalidatePath("/dashboard/kelas");
    revalidatePath("/dashboard/guru");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
