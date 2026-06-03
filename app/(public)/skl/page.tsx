import { getSklSettings } from "@/actions/skl";
import SklClient from "./SklClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portal Kelulusan SKL",
  description: "Pengumuman Kelulusan Siswa",
};

export default async function SklPage() {
  const settings = await getSklSettings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pt-[80px]">
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
              Portal <span className="text-primary">Kelulusan</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto">
              Silakan masukkan Nomor Ujian dan NISN untuk melihat hasil kelulusan Anda.
            </p>
          </div>

          <SklClient settings={settings} />
        </div>
      </div>
    </div>
  );
}
