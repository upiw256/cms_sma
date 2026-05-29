import dbConnect from "@/lib/db";
import DownloadFile from "@/models/DownloadFile";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pusat Unduhan | SMA KOMPLEKS",
};

export default async function DownloadPage() {
  await dbConnect();
  
  // Ambil hanya yang public target
  const filesData = await DownloadFile.find({ target_role: { $in: ["PUBLIC", "STUDENT"] } })
    .sort({ createdAt: -1 })
    .lean();

  // Mock jika kosong untuk demo
  const files = filesData.length > 0 ? filesData : [
    { _id: "1", title: "Formulir Pendaftaran Siswa Baru", category: "formulir", file_url: "#", updatedAt: new Date() },
    { _id: "2", title: "SK Pengumuman Libur Semester", category: "regulasi", file_url: "#", updatedAt: new Date() },
    { _id: "3", title: "Modul Persiapan UTBK 2026", category: "materi", file_url: "#", updatedAt: new Date() },
  ];

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-slate-900 border-b pb-6 inline-block w-full">Pusat Unduhan</h1>
          <p className="text-slate-600">Dokumen, Regulasi, dan Formulir Publik</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wider">
                  <th className="p-4 rounded-tl-xl">Nama Berkas</th>
                  <th className="p-4 hidden md:table-cell">Kategori</th>
                  <th className="p-4 hidden sm:table-cell">Update Terakhir</th>
                  <th className="p-4 rounded-tr-xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file: any) => (
                  <tr key={file._id.toString()} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[var(--primary-color)] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-800">{file.title}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                        {file.category}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-slate-500">
                      {new Date(file.updatedAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        href={file.file_url} 
                        target="_blank"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
