"use server";

import dbConnect from "@/lib/db";
import SklSetting from "@/models/SklSetting";
import SklStudent, { StatusLulus } from "@/models/SklStudent";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// SKL SETTINGS
// ─────────────────────────────────────────────
export async function getSklSettings() {
  await dbConnect();
  const settings = await SklSetting.findOne().lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : null;
}

export async function saveSklSettings(data: {
  is_published: boolean;
  tanggal_pengumuman: string;
  pesan_lulus?: string;
  pesan_tidak_lulus?: string;
}) {
  await dbConnect();
  const existing = await SklSetting.findOne();
  const payload = {
    ...data,
    tanggal_pengumuman: new Date(data.tanggal_pengumuman),
  };
  if (existing) {
    await SklSetting.findByIdAndUpdate(existing._id, payload);
  } else {
    await SklSetting.create(payload);
  }
  revalidatePath("/skl");
  revalidatePath("/dashboard/skl");
  return { success: true };
}

// ─────────────────────────────────────────────
// SKL STUDENTS — Admin
// ─────────────────────────────────────────────
export async function getSklStudents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  await dbConnect();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (params?.search) {
    query.$or = [
      { nama: { $regex: params.search, $options: "i" } },
      { no_ujian: { $regex: params.search, $options: "i" } },
      { nisn: { $regex: params.search, $options: "i" } },
    ];
  }
  if (params?.status && params.status !== "all") {
    query.status_lulus = params.status;
  }

  const [students, total] = await Promise.all([
    SklStudent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SklStudent.countDocuments(query),
  ]);

  return {
    students: JSON.parse(JSON.stringify(students)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateSklStudentStatus(
  id: string,
  status: StatusLulus,
  catatan?: string
) {
  await dbConnect();
  const updateData: any = { status_lulus: status };
  if (catatan !== undefined) updateData.catatan = catatan;

  await SklStudent.findByIdAndUpdate(id, updateData);
  revalidatePath("/dashboard/skl");
  return { success: true };
}

export async function deleteSklStudent(id: string) {
  await dbConnect();
  await SklStudent.findByIdAndDelete(id);
  revalidatePath("/dashboard/skl");
  return { success: true };
}

// ─────────────────────────────────────────────
// IMPORT CSV — Admin
// ─────────────────────────────────────────────
export async function importSklStudentsFromCsv(
  rows: {
    no_ujian: string;
    nisn: string;
    nama: string;
    kelas: string;
    status_lulus: string;
  }[]
) {
  await dbConnect();

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const exists = await SklStudent.findOne({ no_ujian: row.no_ujian });
      if (exists) {
        skipped++;
        continue;
      }
      
      const statusStr = row.status_lulus?.toLowerCase().trim();
      let statusData: StatusLulus = "ditunda";
      if (statusStr === "lulus") statusData = "lulus";
      else if (statusStr === "tidak lulus" || statusStr === "tidak_lulus") statusData = "tidak_lulus";

      await SklStudent.create({
        no_ujian: row.no_ujian.trim(),
        nisn: row.nisn.trim(),
        nama: row.nama.trim(),
        kelas: row.kelas.trim(),
        status_lulus: statusData,
      });
      inserted++;
    } catch (err) {
      errors.push(`${row.no_ujian}: ${(err as Error).message}`);
    }
  }

  revalidatePath("/dashboard/skl");
  return { inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// VERIFIKASI — Public
// ─────────────────────────────────────────────
export async function verifySkl(data: {
  no_ujian: string;
  nisn: string;
}) {
  await dbConnect();

  const settings = await SklSetting.findOne().lean();
  const now = new Date();
  
  if (!settings || !settings.is_published || new Date(settings.tanggal_pengumuman) > now) {
    return { found: false, message: "Pengumuman kelulusan belum dibuka atau masih ditutup." };
  }

  const student = await SklStudent.findOne({
    no_ujian: data.no_ujian.trim(),
    nisn: data.nisn.trim(),
  }).lean();

  if (!student) {
    return { found: false, message: "Data tidak ditemukan. Pastikan Nomor Ujian dan NISN sudah benar." };
  }

  return {
    found: true,
    student: JSON.parse(JSON.stringify(student)),
    settings: JSON.parse(JSON.stringify(settings)),
    message: "Data ditemukan.",
  };
}

export async function getSklStats() {
  await dbConnect();
  const [total, lulus, tidak_lulus, ditunda] = await Promise.all([
    SklStudent.countDocuments(),
    SklStudent.countDocuments({ status_lulus: "lulus" }),
    SklStudent.countDocuments({ status_lulus: "tidak_lulus" }),
    SklStudent.countDocuments({ status_lulus: "ditunda" }),
  ]);
  return { total, lulus, tidak_lulus, ditunda };
}
