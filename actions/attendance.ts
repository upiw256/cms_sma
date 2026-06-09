"use server";

import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import PiketPermit from "@/models/PiketPermit";

// Throttle map in-memory (per serverless instance)
const lastScanMap = new Map<string, number>();
const THROTTLE_MS = 5000; // 5 detik

export async function scanAttendance(studentNisn: string, scannedByUserId: string) {
  await dbConnect();

  // 1. Cari student berdasarkan NISN via User model
  const student = await Student.findOne().populate({
    path: "user_id",
    match: { nip_nisn: studentNisn },
    select: "name nip_nisn",
  }).lean();

  if (!student || !student.user_id) {
    return { success: false, message: "Siswa dengan NISN tersebut tidak ditemukan." };
  }

  // 2. Throttle check (anti double-scan)
  const throttleKey = student._id.toString();
  const lastScan = lastScanMap.get(throttleKey);
  if (lastScan && Date.now() - lastScan < THROTTLE_MS) {
    return { success: false, message: "Scan terlalu cepat. Tunggu 5 detik sebelum scan ulang." };
  }
  lastScanMap.set(throttleKey, Date.now());

  // 3. Normalisasi tanggal hari ini (tanpa jam)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 4. Cek apakah sudah absen hari ini
  const existing = await Attendance.findOne({ student_id: student._id, date: today });
  if (existing) {
    return {
      success: false,
      message: `${(student.user_id as any).name} sudah terekam HADIR hari ini.`,
    };
  }

  // 5. Simpan kehadiran
  await Attendance.create({
    student_id: student._id,
    date: today,
    status: "HADIR",
    scanned_by: scannedByUserId,
  });

  return {
    success: true,
    message: `Berhasil! ${(student.user_id as any).name} tercatat HADIR.`,
    studentName: (student.user_id as any).name,
  };
}

export async function getAttendanceSummaryToday() {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalStudents = await Student.countDocuments();
  const hadir = await Attendance.countDocuments({ date: today, status: "HADIR" });
  const izin = await Attendance.countDocuments({ date: today, status: "IZIN" });
  const sakit = await Attendance.countDocuments({ date: today, status: "SAKIT" });
  const alfa = await Attendance.countDocuments({ date: today, status: "ALFA" });

  return {
    total: totalStudents,
    hadir,
    izin,
    sakit,
    alfa,
    belum: totalStudents - hadir - izin - sakit - alfa,
  };
}

export async function createPiketPermit(data: {
  student_id: string;
  permit_type: "KELUAR" | "MASUK" | "DISPENSASI";
  reason: string;
}) {
  await dbConnect();
  const permit = await PiketPermit.create(data);
  return JSON.parse(JSON.stringify(permit));
}

export async function searchStudents(query: string) {
  if (!query || query.trim().length < 2) return [];
  await dbConnect();

  // Need User model for name/nisn lookup
  const User = (await import("@/models/User")).default;

  // Search users by name or nisn
  const users = await User.find({
    roles: "STUDENT",
    $or: [
      { name: { $regex: query.trim(), $options: "i" } },
      { nip_nisn: { $regex: query.trim(), $options: "i" } },
    ],
  })
    .select("_id name nip_nisn")
    .limit(10)
    .lean();

  if (!users.length) return [];

  const userIds = users.map((u) => u._id);

  const students = await Student.find({ user_id: { $in: userIds } })
    .populate("user_id", "name nip_nisn")
    .populate("class_id", "name")
    .lean();

  return JSON.parse(
    JSON.stringify(
      students.map((s: any) => ({
        student_id: s._id.toString(),
        name: s.user_id?.name || "Unknown",
        nisn: s.user_id?.nip_nisn || "-",
        className: s.class_id?.name || "Belum Ada Kelas",
        gender: s.gender,
      }))
    )
  );
}

export async function getRecentAttendance() {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await Attendance.find({ date: today })
    .populate({
      path: "student_id",
      populate: { path: "user_id", select: "name nip_nisn" },
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return JSON.parse(JSON.stringify(records));
}
