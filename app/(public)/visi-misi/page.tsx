export const metadata = {
  title: "Visi & Misi | SMA KOMPLEKS",
};

export default function VisiMisiPage() {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-slate-900 border-b pb-6">Visi & Misi</h1>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm mb-12 border-t-4 border-[var(--primary-color)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-bl-full -z-10" />
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">Visi</h2>
          <p className="text-xl text-center text-slate-700 italic leading-relaxed max-w-2xl mx-auto font-medium">
            "Mewujudkan insan akademis yang beriman, bertakwa, berprestasi tingkat global, dan berbudaya lingkungan di era digital."
          </p>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border-t-4 border-[var(--secondary-color)]">
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900">Misi</h2>
          <div className="space-y-6">
            {[
              "Menumbuhkembangkan keimanan dan ketakwaan melalui pengamalan ajaran agama.",
              "Melaksanakan pembelajaran dan bimbingan secara efektif, kreatif, dan inovatif terintegrasi digital.",
              "Mendorong dan membantu setiap siswa untuk mengenali potensi dirinya.",
              "Menumbuhkan penghayatan terhadap budaya bangsa untuk menjadi kearifan dalam bertindak.",
              "Menciptakan lingkungan sekolah yang bersih, sehat, rindang dan nyaman guna pelestarian lingkungan."
            ].map((misi, i) => (
              <div key={i} className="flex gap-6 group hover:translate-x-2 transition-transform">
                <span className="flex-shrink-0 w-12 h-12 bg-blue-50 text-[var(--primary-color)] rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors shadow-sm">
                  {i + 1}
                </span>
                <p className="text-lg text-slate-600 self-center leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
                  {misi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
