import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Book, Dumbbell, Beaker, Utensils, Wifi } from "lucide-react";

export const metadata = {
  title: "Fasilitas & Sarana Prasarana | SMA KOMPLEKS",
};

const fasilitas = [
  {
    icon: <Monitor className="w-8 h-8" />,
    name: "Laboratorium Komputer",
    desc: "4 Ruangan lab komputer full-AC dengan spesifikasi i9 untuk desain grafis, ujian CBT, dan pemrograman.",
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=2670&auto=format&fit=crop"
  },
  {
    icon: <Beaker className="w-8 h-8" />,
    name: "Laboratorium Sains",
    desc: "Laboratorium Biologi, Fisika, dan Kimia terpisah dengan peralatan modern standar universitas.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2670&auto=format&fit=crop"
  },
  {
    icon: <Book className="w-8 h-8" />,
    name: "Perpustakaan Digital",
    desc: "Koleksi lebih dari 10ribu buku cetak dan e-book yang bisa diakses melalu tablet iPad perpustakaan.",
    image: "https://images.unsplash.com/photo-1568658176307-bfbd2873abda?q=80&w=2670&auto=format&fit=crop"
  },
  {
    icon: <Dumbbell className="w-8 h-8" />,
    name: "Indoor Sport Hall",
    desc: "Fasilitas olahraga terpadu untuk basket, futsal, voli dan badminton tanpa khawatir cuaca.",
    image: "https://images.unsplash.com/photo-1576624403884-63510ef2a3f7?q=80&w=2670&auto=format&fit=crop"
  },
  {
    icon: <Utensils className="w-8 h-8" />,
    name: "Kantin Sehat",
    desc: "Pusat jajanan bernutrisi dan higienis bersertifikasi dari Dinas Kesehatan Kota, menggunakan cashless system (kartu pelajar).",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop"
  },
  {
    icon: <Wifi className="w-8 h-8" />,
    name: "CCTV & Free Wi-Fi 1Gbps",
    desc: "Pemantauan keamanan 24 jam dengan 100+ CCTV dan koneksi Wi-Fi Gigabit untuk seluruh area sekolah.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop"
  }
];

export default function FasilitasPage() {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Sarana & Prasarana</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Berbagai fasilitas modern disiapkan untuk mendukung perkembangan akademik dan non-akademik siswa.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fasilitas.map((item, i) => (
            <Card key={i} className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 rounded-2xl group">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <CardContent className="p-6 relative">
                <div className="absolute -top-10 right-6 w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center text-[var(--primary-color)] z-20 group-hover:-translate-y-2 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 pr-12">{item.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
