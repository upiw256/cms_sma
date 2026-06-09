"use server";

import dbConnect from "@/lib/db";
import AcademicYear from "@/models/AcademicYear";
import { revalidatePath } from "next/cache";

export async function createAcademicYear(data: {
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}) {
  try {
    await dbConnect();

    // Jika set aktif, nonaktifkan yang lain dulu
    if (data.is_active) {
      await AcademicYear.updateMany({}, { is_active: false });
    }

    await AcademicYear.create({
      name: data.name,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      is_active: data.is_active,
    });

    revalidatePath("/dashboard/tahun-ajaran");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateAcademicYear(id: string, data: {
  name: string;
  start_date: string;
  end_date: string;
}) {
  try {
    await dbConnect();
    await AcademicYear.findByIdAndUpdate(id, {
      name: data.name,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
    });
    revalidatePath("/dashboard/tahun-ajaran");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function setActiveAcademicYear(id: string) {
  try {
    await dbConnect();
    await AcademicYear.updateMany({}, { is_active: false });
    await AcademicYear.findByIdAndUpdate(id, { is_active: true });
    revalidatePath("/dashboard/tahun-ajaran");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteAcademicYear(id: string) {
  try {
    await dbConnect();
    const year = await AcademicYear.findById(id);
    if (year?.is_active) {
      return { success: false, message: "Tidak dapat menghapus tahun ajaran yang sedang aktif!" };
    }
    await AcademicYear.findByIdAndDelete(id);
    revalidatePath("/dashboard/tahun-ajaran");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
