"use server";

import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function createTeacher(data: any) {
  try {
    await dbConnect();
    
    // 1. Check if NIP already exists
    if (data.nip_nisn) {
      const existing = await User.findOne({ nip_nisn: data.nip_nisn });
      if (existing) {
        return { success: false, message: "NIP sudah terdaftar!" };
      }
    }

    // Generate an email if none is provided to satisfy User schema
    const email = data.email || `${data.nip_nisn || new Date().getTime()}@guru.local`;

    // 2. Create the User record
    const newUser = await User.create({
      name: data.name,
      email: email,
      nip_nisn: data.nip_nisn,
      password: data.password || data.nip_nisn, // Default password is NIP
      roles: ["TEACHER"],
    });

    // 3. Create the Teacher record
    await Teacher.create({
      user_id: newUser._id,
      subject_id: data.subject_id || undefined,
      employment_status: data.employment_status || "PNS",
    });

    revalidatePath("/dashboard/guru");
    return { success: true, message: "Data Guru berhasil ditambahkan" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateTeacher(id: string, data: any) {
  try {
    // 'id' is the Teacher document ID
    await dbConnect();

    const teacher = await Teacher.findById(id).populate("user_id");
    if (!teacher) return { success: false, message: "Teacher not found" };

    // Update User
    if (teacher.user_id) {
      const userUpdate: any = { name: data.name };
      if (data.nip_nisn) userUpdate.nip_nisn = data.nip_nisn;
      if (data.email) userUpdate.email = data.email;
      if (data.password) userUpdate.password = data.password;
      
      await User.findByIdAndUpdate(teacher.user_id._id, userUpdate);
    }

    // Update Teacher
    await Teacher.findByIdAndUpdate(id, {
      subject_id: data.subject_id || undefined,
      employment_status: data.employment_status,
    });

    revalidatePath("/dashboard/guru");
    return { success: true, message: "Data Guru berhasil diperbarui" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteTeacher(id: string) {
  try {
    await dbConnect();
    const teacher = await Teacher.findById(id);
    if (!teacher) return { success: false, message: "Teacher not found" };

    // Optionally delete User too
    if (teacher.user_id) {
      await User.findByIdAndDelete(teacher.user_id);
    }

    await Teacher.findByIdAndDelete(id);
    revalidatePath("/dashboard/guru");
    return { success: true, message: "Data Guru berhasil dihapus" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
