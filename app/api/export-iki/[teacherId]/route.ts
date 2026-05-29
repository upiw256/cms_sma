import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function GET(req: NextRequest, { params }: { params: Promise<{ teacherId: string }> }) {
  await dbConnect();
  
  const { teacherId } = await params;

  try {
    const teacher: any = await Teacher.findById(teacherId).populate("user_id").populate("subject_id").lean();
    if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

    const templatePath = path.resolve(process.cwd(), "public", "templates", "iki_template.docx");
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        error: "Template IKI tidak ditemukan. Silakan upload iki_template.docx ke folder public/templates/" 
      }, { status: 404 });
    }

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const currentDate = new Date();
    
    // Data dummy atau diambil dari model
    doc.render({
      nama_guru: teacher.user_id?.name || "N/A",
      nip: teacher.user_id?.nip_nisn || "N/A",
      mata_pelajaran: teacher.subject_id?.name || "N/A",
      bulan: currentDate.toLocaleString("id-ID", { month: 'long' }),
      tahun: currentDate.getFullYear(),
      tanggal_cetak: currentDate.toLocaleDateString("id-ID"),
      status_pegawai: teacher.employment_status || "PNS",
      laporan_list: teacher.current_iki_reports_array?.map((rep: any, idx: number) => ({
        no: idx + 1,
        kegiatan: rep.activity || "-",
        hasil: rep.result || "-",
      })) || [{ no: 1, kegiatan: "Mengajar tatap muka", hasil: "Terlaksana 100%" }]
    });

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Laporan_IKI_${teacher.user_id?.name}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Docx Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
