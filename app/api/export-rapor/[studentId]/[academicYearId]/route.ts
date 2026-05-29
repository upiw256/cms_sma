import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grade from "@/models/Grade";
import Student from "@/models/Student";
import SchoolConfig from "@/models/SchoolConfig";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string; academicYearId: string }> }) {
  await dbConnect();
  
  const { studentId, academicYearId } = await params;

  try {
    const student: any = await Student.findById(studentId).populate("user_id").populate("class_id").lean();
    if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    
    const grades = await Grade.find({ student_id: studentId, academic_year_id: academicYearId })
      .populate("subject_id")
      .lean();
      
    const config: any = await SchoolConfig.findOne().lean();
    const schoolName = config?.name || "SMA KOMPLEKS";

    // Set up PDFKit
    const pdf = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    
    // Convert PDFKit stream to raw buffers
    pdf.on('data', (chunk) => chunks.push(chunk));
    
    // Create a promise to wait for the pdf to finish
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);
    });

    // Content
    // Header
    pdf.fontSize(16).font("Helvetica-Bold").text(schoolName, { align: "center" });
    pdf.fontSize(12).font("Helvetica").text("LAPORAN HASIL BELAJAR SISWA (E-RAPOR)", { align: "center" });
    pdf.moveDown(2);

    // Identitas Siswa
    pdf.fontSize(11).font("Helvetica");
    pdf.text(`Nama Siswa    : ${student.user_id?.name || "-"}`);
    pdf.text(`Kelas              : ${student.class_id?.name || "-"}`);
    pdf.text(`Tahun Ajaran   : Terlampir`);
    pdf.moveDown(2);

    // Tabel Header
    const startY = pdf.y;
    pdf.font("Helvetica-Bold");
    pdf.text("Mata Pelajaran", 50, startY, { width: 150 });
    pdf.text("KKM", 200, startY, { width: 40 });
    pdf.text("Nilai", 240, startY, { width: 40 });
    pdf.text("Grade", 280, startY, { width: 40 });
    pdf.text("Deskripsi", 330, startY, { width: 210 });
    
    // Draw line
    let currentY = startY + 15;
    pdf.moveTo(50, currentY).lineTo(540, currentY).stroke();
    currentY += 10;

    // Tabel Body
    pdf.font("Helvetica");
    grades.forEach((g: any) => {
      const subjName = g.subject_id?.name || "-";
      const kkm = g.kkm || 75; // Default if not found in populate
      const finalScore = g.final_score || 0;
      const gradeLetter = g.grade_letter || "-";
      const desc = g.description || "-";

      // Calculate row height based on description
      const height = pdf.heightOfString(desc, { width: 210 });
      
      pdf.text(subjName, 50, currentY, { width: 150 });
      pdf.text(kkm.toString(), 200, currentY, { width: 40 });
      pdf.text(finalScore.toString(), 240, currentY, { width: 40 });
      pdf.text(gradeLetter, 280, currentY, { width: 40 });
      pdf.text(desc, 330, currentY, { width: 210 });

      currentY += Math.max(height, 15) + 10;

      // Page break if too long
      if (currentY > 750) {
        pdf.addPage();
        currentY = 50;
      }
    });

    pdf.moveTo(50, currentY).lineTo(540, currentY).stroke();
    pdf.moveDown(3);

    // Tanda tangan
    pdf.y = currentY + 30;
    pdf.text("Mengetahui,", 400, pdf.y, { align: "center", width: 100 });
    pdf.text("Kepala Sekolah", 400, pdf.y + 15, { align: "center", width: 100 });
    pdf.text(config?.headmaster_name || "N/A", 400, pdf.y + 70, { align: "center", width: 100 });
    
    // Finalize PDF
    pdf.end();
    const pdfBuffer = await pdfPromise;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="E-Rapor_${student.user_id?.name}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
