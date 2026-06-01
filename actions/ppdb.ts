"use server";

import dbConnect from "@/lib/db";
import PpdbRegistrant, { PpdbStatus } from "@/models/PpdbRegistrant";
import PpdbSubmission from "@/models/PpdbSubmission";
import PpdbSettings from "@/models/PpdbSettings";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function generateToken(): string {
  return randomBytes(16).toString("hex");
}

// ─────────────────────────────────────────────
// PPDB SETTINGS
// ─────────────────────────────────────────────
export async function getPpdbSettings() {
  await dbConnect();
  const settings = await PpdbSettings.findOne().lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : null;
}

export async function savePpdbSettings(data: {
  is_open: boolean;
  tanggal_buka: string;
  tanggal_tutup: string;
  kuota_total: number;
  kuota_per_kelas?: { nama_kelas: string; kuota: number }[];
  syarat_berkas?: {
    id: string;
    label: string;
    is_required: boolean;
    keterangan?: string;
  }[];
  pengumuman_info?: string;
  contact_info?: string;
}) {
  await dbConnect();
  const existing = await PpdbSettings.findOne();
  const payload = {
    ...data,
    tanggal_buka: new Date(data.tanggal_buka),
    tanggal_tutup: new Date(data.tanggal_tutup),
  };
  if (existing) {
    await PpdbSettings.findByIdAndUpdate(existing._id, payload);
  } else {
    await PpdbSettings.create(payload);
  }
  revalidatePath("/ppdb");
  revalidatePath("/dashboard/ppdb");
  return { success: true };
}

// ─────────────────────────────────────────────
// REGISTRANTS — Admin
// ─────────────────────────────────────────────
export async function getPpdbRegistrants(params?: {
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
      { no_peserta: { $regex: params.search, $options: "i" } },
      { asal_sekolah: { $regex: params.search, $options: "i" } },
    ];
  }
  if (params?.status && params.status !== "all") {
    query.status = params.status;
  }

  const [registrants, total] = await Promise.all([
    PpdbRegistrant.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    PpdbRegistrant.countDocuments(query),
  ]);

  return {
    registrants: JSON.parse(JSON.stringify(registrants)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPpdbRegistrantDetail(id: string) {
  await dbConnect();
  const registrant = await PpdbRegistrant.findById(id).lean();
  if (!registrant) return null;
  const submission = await PpdbSubmission.findOne({
    registrant_id: id,
  }).lean();
  return {
    registrant: JSON.parse(JSON.stringify(registrant)),
    submission: submission ? JSON.parse(JSON.stringify(submission)) : null,
  };
}

export async function updateRegistrantStatus(
  id: string,
  status: PpdbStatus,
  catatan?: string,
  verifiedBy?: string
) {
  await dbConnect();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { status };
  if (catatan !== undefined) updateData.catatan_admin = catatan;

  await PpdbRegistrant.findByIdAndUpdate(id, updateData);

  // Also update the submission verified_by/verified_at
  if (status === "terverifikasi" || status === "ditolak") {
    await PpdbSubmission.findOneAndUpdate(
      { registrant_id: id },
      {
        verified_by: verifiedBy,
        verified_at: new Date(),
        catatan_verifikasi: catatan,
      }
    );
  }

  revalidatePath("/dashboard/ppdb");
  return { success: true };
}

export async function deleteRegistrant(id: string) {
  await dbConnect();
  await PpdbRegistrant.findByIdAndDelete(id);
  await PpdbSubmission.findOneAndDelete({ registrant_id: id });
  revalidatePath("/dashboard/ppdb");
  return { success: true };
}

// ─────────────────────────────────────────────
// IMPORT CSV — Admin
// ─────────────────────────────────────────────
export async function importRegistrantsFromCsv(
  rows: {
    no_peserta: string;
    nama: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    asal_sekolah: string;
    pilihan_kelas?: string;
    jalur_daftar?: string;
  }[]
) {
  await dbConnect();

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const exists = await PpdbRegistrant.findOne({ no_peserta: row.no_peserta });
      if (exists) {
        skipped++;
        continue;
      }
      await PpdbRegistrant.create({
        no_peserta: row.no_peserta.trim(),
        nama: row.nama.trim(),
        tanggal_lahir: new Date(row.tanggal_lahir),
        jenis_kelamin: row.jenis_kelamin?.toUpperCase() === "P" ? "P" : "L",
        asal_sekolah: row.asal_sekolah?.trim() || "-",
        pilihan_kelas: row.pilihan_kelas?.trim(),
        jalur_daftar: row.jalur_daftar?.trim(),
        token_daftar_ulang: generateToken(),
        status: "diterima",
      });
      inserted++;
    } catch (err) {
      errors.push(`${row.no_peserta}: ${(err as Error).message}`);
    }
  }

  revalidatePath("/dashboard/ppdb");
  return { inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// VERIFIKASI — Public
// ─────────────────────────────────────────────
export async function verifyRegistrant(data: {
  no_peserta: string;
  tanggal_lahir: string; // "YYYY-MM-DD"
}) {
  await dbConnect();

  const tgl = new Date(data.tanggal_lahir);
  const nextDay = new Date(tgl);
  nextDay.setDate(nextDay.getDate() + 1);

  const registrant = await PpdbRegistrant.findOne({
    no_peserta: data.no_peserta.trim(),
    tanggal_lahir: { $gte: tgl, $lt: nextDay },
  }).lean();

  if (!registrant) {
    return { found: false, message: "Data tidak ditemukan. Pastikan Nomor Peserta dan Tanggal Lahir sudah benar." };
  }

  if (registrant.status === "ditolak") {
    return { found: true, status: "ditolak", message: "Maaf, Anda tidak diterima pada tahap seleksi ini." };
  }

  return {
    found: true,
    status: registrant.status,
    token: registrant.token_daftar_ulang,
    nama: registrant.nama,
    no_peserta: registrant.no_peserta,
    pilihan_kelas: registrant.pilihan_kelas,
    message: "Data ditemukan. Silakan lanjutkan proses daftar ulang.",
  };
}

// ─────────────────────────────────────────────
// DAFTAR ULANG FORM — Public (Multi-Step)
// ─────────────────────────────────────────────
export async function getSubmissionByToken(token: string) {
  await dbConnect();
  const registrant = await PpdbRegistrant.findOne({
    token_daftar_ulang: token,
  }).lean();
  if (!registrant) return null;

  const submission = await PpdbSubmission.findOne({
    registrant_id: registrant._id,
  }).lean();

  return {
    registrant: JSON.parse(JSON.stringify(registrant)),
    submission: submission ? JSON.parse(JSON.stringify(submission)) : null,
  };
}

export async function saveStep1(token: string, stepData: {
  nama_lengkap: string;
  nik: string;
  no_peserta: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  agama: string;
  alamat: string;
  rt_rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  no_telp: string;
  email?: string;
  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah?: string;
  pekerjaan_ibu?: string;
  no_telp_ortu: string;
}) {
  await dbConnect();
  const registrant = await PpdbRegistrant.findOne({ token_daftar_ulang: token });
  if (!registrant) return { success: false, message: "Token tidak valid." };
  if (registrant.status === "terverifikasi") {
    return { success: false, message: "Daftar ulang Anda sudah terverifikasi." };
  }

  await PpdbSubmission.findOneAndUpdate(
    { registrant_id: registrant._id },
    { registrant_id: registrant._id, step_data_diri: stepData, current_step: 2 },
    { upsert: true, new: true }
  );

  // Update registrant status to daftar_ulang if still diterima
  if (registrant.status === "diterima") {
    await PpdbRegistrant.findByIdAndUpdate(registrant._id, { status: "daftar_ulang" });
  }

  return { success: true };
}

export async function saveStep2(token: string, berkasData: {
  ijazah_url?: string;
  skhun_url?: string;
  akte_kelahiran_url?: string;
  kartu_keluarga_url?: string;
  pas_foto_url?: string;
  surat_domisili_url?: string;
  kartu_prestasi_url?: string;
}) {
  await dbConnect();
  const registrant = await PpdbRegistrant.findOne({ token_daftar_ulang: token });
  if (!registrant) return { success: false, message: "Token tidak valid." };

  await PpdbSubmission.findOneAndUpdate(
    { registrant_id: registrant._id },
    { step_berkas: berkasData, current_step: 3 },
    { upsert: true, new: true }
  );

  return { success: true };
}

export async function submitFinalStep(token: string, setuju: boolean) {
  await dbConnect();
  const registrant = await PpdbRegistrant.findOne({ token_daftar_ulang: token });
  if (!registrant) return { success: false, message: "Token tidak valid." };
  if (!setuju) return { success: false, message: "Anda harus menyetujui pernyataan untuk melanjutkan." };

  const submission = await PpdbSubmission.findOneAndUpdate(
    { registrant_id: registrant._id },
    {
      step_pernyataan: true,
      is_submitted: true,
      submitted_at: new Date(),
      current_step: 3,
    },
    { new: true }
  );

  // Update registrant's submission_id
  await PpdbRegistrant.findByIdAndUpdate(registrant._id, {
    submission_id: submission?._id,
    status: "daftar_ulang",
  });

  revalidatePath("/dashboard/ppdb");
  return { success: true };
}

// ─────────────────────────────────────────────
// STATS — Admin dashboard
// ─────────────────────────────────────────────
export async function getPpdbStats() {
  await dbConnect();
  const [total, diterima, daftar_ulang, terverifikasi, ditolak] = await Promise.all([
    PpdbRegistrant.countDocuments(),
    PpdbRegistrant.countDocuments({ status: "diterima" }),
    PpdbRegistrant.countDocuments({ status: "daftar_ulang" }),
    PpdbRegistrant.countDocuments({ status: "terverifikasi" }),
    PpdbRegistrant.countDocuments({ status: "ditolak" }),
  ]);
  return { total, diterima, daftar_ulang, terverifikasi, ditolak };
}
