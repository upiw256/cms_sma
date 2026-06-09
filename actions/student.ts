"use server";

import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function createStudent(data: any) {
  await dbConnect();

  // 1. Check if NISN already exists
  if (data.nip_nisn) {
    const existingNisn = await User.findOne({ nip_nisn: data.nip_nisn });
    if (existingNisn) {
      return { success: false, message: "NISN sudah terdaftar!" };
    }
  }

  // 2. Check if email is already taken (if provided)
  if (data.email) {
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return { success: false, message: `Email "${data.email}" sudah digunakan oleh akun lain!` };
    }
  }

  // 3. Always generate a safe, unique email for student accounts
  // Format: nisn@siswa.local, fallback to timestamp+random
  const uniqueSuffix = data.nip_nisn || `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = data.email || `${uniqueSuffix}@siswa.local`;

  // 4. Create the User record
  const newUser = await User.create({
    name: data.name,
    email: email,
    nip_nisn: data.nip_nisn,
    password: data.nip_nisn || uniqueSuffix, // Default password is NISN
    roles: ["STUDENT"],
  });

  // 5. Create the Student record
  await Student.create({
    user_id: newUser._id,
    class_id: data.class_id || undefined,
    gender: data.gender || "L",
    birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
    address: data.address,
    parent_info: {
      father_name: data.father_name,
      mother_name: data.mother_name,
      phone: data.parent_phone,
    },
  });

  revalidatePath("/dashboard/siswa");
  return { success: true, message: "Data Siswa berhasil ditambahkan" };
}

export async function updateStudent(id: string, data: any) {
  await dbConnect();

  const student = await Student.findById(id).populate("user_id");
  if (!student) return { success: false, message: "Student not found" };

  // Update User
  if (student.user_id) {
    const userUpdate: any = { name: data.name };
    if (data.nip_nisn) userUpdate.nip_nisn = data.nip_nisn;
    // Only update email if explicitly provided AND different from current
    if (data.email && data.email !== (student.user_id as any).email) {
      const existingEmail = await User.findOne({ email: data.email, _id: { $ne: (student.user_id as any)._id } });
      if (existingEmail) {
        return { success: false, message: `Email "${data.email}" sudah digunakan oleh akun lain!` };
      }
      userUpdate.email = data.email;
    }
    if (data.password) userUpdate.password = data.password;

    await User.findByIdAndUpdate((student.user_id as any)._id, userUpdate);
  }

  // Update Student
  await Student.findByIdAndUpdate(id, {
    class_id: data.class_id || undefined,
    gender: data.gender,
    birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
    address: data.address,
    parent_info: {
      father_name: data.father_name,
      mother_name: data.mother_name,
      phone: data.parent_phone,
    },
  });

  revalidatePath("/dashboard/siswa");
  return { success: true, message: "Data Siswa berhasil diperbarui" };
}

export async function deleteStudent(id: string) {
  await dbConnect();
  const student = await Student.findById(id);
  if (!student) return { success: false, message: "Student not found" };

  // Optionally delete User too
  if (student.user_id) {
    await User.findByIdAndDelete(student.user_id);
  }

  await Student.findByIdAndDelete(id);
  revalidatePath("/dashboard/siswa");
  return { success: true, message: "Data Siswa berhasil dihapus" };
}
