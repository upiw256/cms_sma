import { getSchoolConfig } from "@/actions/schoolConfig";

export const metadata = {
  title: "Profil Sekolah | SMA KOMPLEKS",
};

export default async function ProfilPage() {
  const config = await getSchoolConfig();

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-6">Profil {config?.name}</h1>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">Sejarah Singkat</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Berdiri sejak tahun 1980, {config?.name} telah bertransformasi menjadi institusi pendidikan menengah tingkat atas yang prestisius di kota ini. 
            Berawal dari keinginan warga lokal untuk memiliki layanan edukasi jenjang lanjutan.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Seiring dengan berjalannya waktu, sekolah ini tidak hanya berkembang dalam hal infrastruktur, namun juga secara konsisten mengadopsi kurikulum terbaik. 
            Fokus kami tidak terbatas pada pencapaian akademik, namun sangat erat kaitannya dengan pengembangan karakter dan etika siswa guna menyongsong era revolusi industri 4.0.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
          <h2 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">Identitas Sekolah</h2>
          <ul className="space-y-4">
            <li className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="font-semibold text-slate-800 dark:text-slate-200 w-40 shrink-0">NPSN:</span>
              <span className="text-slate-600 dark:text-slate-400">{config?.npsn || "-"}</span>
            </li>
            <li className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="font-semibold text-slate-800 dark:text-slate-200 w-40 shrink-0">Kepala Sekolah:</span>
              <span className="text-slate-600 dark:text-slate-400">{config?.headmaster_name || "-"}</span>
            </li>
            <li className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="font-semibold text-slate-800 dark:text-slate-200 w-40 shrink-0">Alamat:</span>
              <span className="text-slate-600 dark:text-slate-400">{config?.contact_info?.address || "-"}</span>
            </li>
            <li className="flex gap-4">
              <span className="font-semibold text-slate-800 dark:text-slate-200 w-40 shrink-0">Kategori:</span>
              <span className="text-slate-600 dark:text-slate-400">Sekolah Menengah Atas (Negeri)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
