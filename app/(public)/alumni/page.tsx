import dbConnect from "@/lib/db";
import AlumniTracer from "@/models/AlumniTracer";
import { Quote } from "lucide-react";

export const metadata = {
  title: "Direktori Tracer Study Alumni | SMA KOMPLEKS",
};

export default async function AlumniPage() {
  await dbConnect();
  
  const alumniData = await AlumniTracer.find().sort({ graduation_year: -1 }).lean();

  const alumni = alumniData.length > 0 ? alumniData : [
    { _id: "1", name: "Budi Santoso", graduation_year: 2021, current_activity: "Mahasiswa ITB, Teknik Informatika", testimonial: "SMA KOMPLEKS memberikan pondasi logika dan matematika yang sangat kuat, sangat membantu kuliah saya.", photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop" },
    { _id: "2", name: "Siti Rahmawati", graduation_year: 2019, current_activity: "Dokter Umum, RS Medika", testimonial: "Disiplin dan fasilitas lab biologi di sekolah ini menginspirasi saya untuk menjadi dokter.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop" },
    { _id: "3", name: "Andi Wijaya", graduation_year: 2022, current_activity: "Founder Tech Startup", testimonial: "Di sinilah saya pertama kali mengenal coding melalui ekstrakurikuler sekolah. Terima kasih Bapak/Ibu guru!", photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop" },
  ];

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-6 inline-block w-full">Direktori Alumni</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Jejak langkah emas lulusan SMA KOMPLEKS yang kini berkarya di berbagai sektor pendidikan maupun industri.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {alumni.map((item: any) => (
            <div key={item._id.toString()} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg hover:-translate-y-2 transition-all relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-100 dark:text-slate-800 rotate-180" />
              <p className="text-slate-600 dark:text-slate-300 italic mb-8 relative z-10 leading-relaxed text-sm">
                "{item.testimonial}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={item.photo_url || "https://ui-avatars.com/api/?name=" + item.name} 
                  alt={item.name} 
                  className="w-14 h-14 rounded-full object-cover shadow-sm bg-slate-200 dark:bg-slate-800"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                  <div className="text-xs font-semibold text-[var(--primary-color)] mt-1">Lulusan {item.graduation_year}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.current_activity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
