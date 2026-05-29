"use server";

import dbConnect from "@/lib/db";
import Grade from "@/models/Grade";
import Student from "@/models/Student";
import Subject from "@/models/Subject";
import User from "@/models/User";
import AcademicYear from "@/models/AcademicYear";
import ClassGroup from "@/models/ClassGroup";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// Generate deskripsi berdasarkan kkm dan nilai akhir
function generateDescription(score: number, kkm: number, subjectName: string) {
  if (score >= kkm + 15) {
    return `Sangat baik dalam memahami materi ${subjectName}, mampu menganalisis dan menerapkan konsep dengan sangat baik.`;
  } else if (score >= kkm) {
    return `Baik dalam memahami materi ${subjectName}, mampu menerapkan konsep dengan baik.`;
  } else if (score >= kkm - 15) {
    return `Cukup dalam memahami materi ${subjectName}, perlu peningkatan dalam penerapan konsep.`;
  } else {
    return `Kurang dalam memahami materi ${subjectName}, perlu bimbingan intensif dan pemahaman konsep dasar.`;
  }
}

function calculateGradeLetter(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

export async function getGradingFilters() {
  await dbConnect();
  const academicYears = await AcademicYear.find().sort({ start_year: -1 }).lean();
  const classes = await ClassGroup.find().sort({ grade_level: 1, name: 1 }).lean();
  const subjects = await Subject.find().sort({ name: 1 }).lean();

  return {
    academicYears: JSON.parse(JSON.stringify(academicYears)),
    classes: JSON.parse(JSON.stringify(classes)),
    subjects: JSON.parse(JSON.stringify(subjects))
  };
}

export async function getGradesForClassAndSubject(classId: string, subjectId: string, academicYearId: string) {
  await dbConnect();
  
  const subject = await Subject.findById(subjectId).lean();
  if (!subject) throw new Error("Mata pelajaran tidak ditemukan");

  const students = await Student.find({ class_id: classId }).populate("user_id", "name").lean();
  
  const existingGrades = await Grade.find({
    class_id: classId,
    subject_id: subjectId,
    academic_year_id: academicYearId
  }).lean();

  const gradeMap = new Map();
  existingGrades.forEach((g: any) => {
    gradeMap.set(g.student_id.toString(), g);
  });

  const kkm = (subject as any).kkm || 75;

  const rowData = students.map((std: any) => {
    const existing = gradeMap.get(std._id.toString());
    return {
      _id: existing?._id?.toString() || null,
      student_id: std._id.toString(),
      student_name: (std.user_id as any)?.name || "Unknown",
      tugas: existing?.tugas || 0,
      uts: existing?.uts || 0,
      uas: existing?.uas || 0,
      final_score: existing?.final_score || 0,
      grade_letter: existing?.grade_letter || "E",
      description: existing?.description || "",
      kkm,
      subject_name: (subject as any).name
    };
  });

  rowData.sort((a, b) => a.student_name.localeCompare(b.student_name));
  
  return JSON.parse(JSON.stringify(rowData));
}

export async function saveBulkGrades(classId: string, subjectId: string, academicYearId: string, gradesData: any[]) {
  await dbConnect();
  
  const subject = await Subject.findById(subjectId).lean();
  const kkm = (subject as any)?.kkm || 75;
  const subjectName = (subject as any)?.name || "Materi";

  const bulkOps = gradesData.map(row => {
    const finalScore = Math.round((Number(row.tugas) * 0.3) + (Number(row.uts) * 0.3) + (Number(row.uas) * 0.4));
    
    const gradeLetter = calculateGradeLetter(finalScore);
    const description = generateDescription(finalScore, kkm, subjectName);

    return {
      updateOne: {
        filter: { 
          student_id: new mongoose.Types.ObjectId(row.student_id),
          subject_id: new mongoose.Types.ObjectId(subjectId),
          class_id: new mongoose.Types.ObjectId(classId),
          academic_year_id: new mongoose.Types.ObjectId(academicYearId)
        },
        update: {
          $set: {
            tugas: Number(row.tugas),
            uts: Number(row.uts),
            uas: Number(row.uas),
            final_score: finalScore,
            grade_letter: gradeLetter,
            description: description
          }
        },
        upsert: true
      }
    };
  });

  if (bulkOps.length > 0) {
    await Grade.bulkWrite(bulkOps);
  }

  revalidatePath("/dashboard/guru/nilai");
  return { success: true, message: "Nilai berhasil disimpan dan dikalkulasi." };
}
