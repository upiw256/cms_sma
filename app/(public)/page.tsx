import { getSchoolConfig } from "@/actions/schoolConfig";
import { getLandingSections } from "@/actions/landingConfig";
import { ArrowRight, BookOpen, GraduationCap, Users, Calendar, Trophy, Sparkles, Shield, Globe, Newspaper } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Article from "@/models/Article";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import CountUp from "@/components/CountUp";
import HeadmasterGreeting from "@/components/HeadmasterGreeting";
import { ILandingSection } from "@/models/LandingSection";

function HeroSection({ config, totalSiswa, totalGuru, totalKelas, akreditasi }: any) {
  return (
    <section className="relative w-full min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px] animate-float" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] animate-float-delay" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm text-blue-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" /> PENDAFTARAN PPDB 2026/2027 TELAH DIBUKA
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-8 leading-[1.05] animate-slide-up">
            Membangun <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Masa Depan</span><br /> Gemilang.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.15s' }}>
            {config?.name} berkomitmen memberikan pendidikan berkualitas, berakhlak mulia, dan berdaya saing global untuk mencetak generasi pemimpin masa depan.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/ppdb" className="group flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-primary hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              Daftar PPDB <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/profil" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              Jelajahi Profil
            </Link>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { icon: Users, value: totalSiswa, label: "Siswa Aktif", color: "text-emerald-400" },
            { icon: GraduationCap, value: totalGuru, label: "Tenaga Pendidik", color: "text-blue-400" },
            { icon: BookOpen, value: totalKelas, label: "Rombongan Belajar", color: "text-amber-400" },
            { icon: Trophy, value: akreditasi, label: "Akreditasi", color: "text-rose-400" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <stat.icon className={`w-5 h-5 ${stat.color} shrink-0`} />
              <div>
                <div className="text-xl font-bold text-white">{typeof stat.value === 'number' ? <CountUp end={stat.value} /> : stat.value}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SambutanSection({ config, customTitle }: any) {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row gap-16 items-center justify-center max-w-5xl mx-auto">
            <div className="w-full md:w-2/5 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/30 ring-1 ring-slate-200/50 dark:ring-white/10">
                  <img src={config?.headmaster_photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"} alt="Kepala Sekolah" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <p className="text-white font-bold text-lg">{config?.headmaster_name || "Kepala Sekolah"}</p>
                    <p className="text-blue-300 text-sm">Kepala Sekolah</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-3/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-1 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sambutan</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: customTitle || "Kata Sambutan<br />Kepala Sekolah" }} />
              
              <HeadmasterGreeting 
                greeting={config?.headmaster_greeting} 
                fallback={`Selamat datang di portal resmi ${config?.name || "sekolah kami"}. Kami merasa bangga menjadi bagian dari perkembangan akademis, karakter, dan mental siswa-siswi terbaik negeri.`} 
              />
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function KeunggulanSection({ customTitle }: any) {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <AnimateOnScroll className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Keunggulan</span>
            <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{customTitle || "Mengapa Memilih Kami?"}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Kami menyediakan pengalaman pendidikan terbaik dengan fasilitas modern dan kurikulum terkini.</p>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Shield, title: "Kurikulum Terintegrasi", desc: "Kurikulum Merdeka yang diperkaya dengan program unggulan, karakter building.", gradient: "from-blue-600 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
            { icon: Globe, title: "Digital & Modern", desc: "E-Learning, Smart Classroom, dan sistem akademik digital terintegrasi untuk efisiensi belajar.", gradient: "from-indigo-600 to-purple-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", iconColor: "text-indigo-600 dark:text-indigo-400" },
            { icon: Trophy, title: "Prestasi Gemilang", desc: "Ratusan prestasi di bidang akademik, olahraga, seni, dan teknologi nasional.", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400" },
          ].map((item, i) => (
            <AnimateOnScroll key={i} delay={i * 150}>
              <div className="relative group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute top-0 inset-x-6 h-[2px] rounded-full bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection({ customTitle, articles }: { customTitle?: string; articles: any[] }) {
  const featured = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Terbaru</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{customTitle || "Berita & Informasi"}</h2>
              <p className="text-slate-600 dark:text-slate-400">Dapatkan update terkini kegiatan sekolah kami.</p>
            </div>
            {articles.length > 0 && (
              <Link href="/berita" className="hidden md:flex items-center gap-2 text-sm font-semibold text-blue-600 hover:gap-3 transition-all duration-200">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </AnimateOnScroll>

        {articles.length === 0 ? (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                <Newspaper className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">Belum Ada Berita</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Berita dan pengumuman terbaru akan tampil di sini.</p>
            </div>
          </AnimateOnScroll>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Featured article */}
            {featured && (
              <AnimateOnScroll>
                <Link href={`/berita/${featured.slug}`} className="group block">
                  <div className="w-full h-[340px] rounded-2xl overflow-hidden mb-5 relative ring-1 ring-slate-200/50 dark:ring-white/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent z-10" />
                    <img
                      src={featured.image_banner || "https://images.unsplash.com/photo-1546410531-ea4cea477149?q=80&w=2670&auto=format&fit=crop"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={featured.title}
                    />
                    <div className="absolute bottom-0 inset-x-0 p-6 z-20">
                      <span className="inline-block text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-full mb-3 uppercase">{ featured.category_type }</span>
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2">{featured.title}</h3>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center mb-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(featured.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{featured.content.replace(/<[^>]*>?/gm, '')}</p>
                </Link>
              </AnimateOnScroll>
            )}

            {/* Side list */}
            {rest.length > 0 && (
              <AnimateOnScroll delay={150}>
                <div className="flex flex-col gap-5">
                  {rest.map((item: any, i: number) => (
                    <Link key={i} href={`/berita/${item.slug}`} className="flex gap-5 items-center group p-3 -mx-3 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 transition-colors duration-200">
                      <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={item.image_banner || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={item.title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-400 flex items-center mb-1.5">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </AnimateOnScroll>
            )}
          </div>
        )}

        {articles.length > 0 && (
          <div className="mt-10 text-center md:hidden">
            <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              Lihat Semua Berita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function AgendaSection({ customTitle }: any) {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{customTitle || "Agenda Akademik Terdekat"}</h2>
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 shadow-sm">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-semibold">Belum ada agenda sekolah yang dijadwalkan dalam waktu dekat.</p>
        </div>
      </div>
    </section>
  );
}

function AlumniSection({ customTitle }: any) {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{customTitle || "Jejak Prestasi Alumni Kami"}</h2>
        <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-blue-600 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-80" />
          <div className="relative z-10">
            <GraduationCap className="w-16 h-16 mx-auto mb-6 text-white/50" />
            <p className="text-xl font-medium mb-6 leading-relaxed">Ribuan alumni kami telah tersebar di berbagai PTN favorit dan mencetak pretasi di karir masing-masing. Jadilah bagian dari cerita sukses berikutnya!</p>
            <Link href="/alumni" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl inline-flex items-center hover:scale-105 transition-transform">Kunjungi Portal Alumni</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative py-28 overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>
      <AnimateOnScroll className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
          Siap Bergabung Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Keluarga Besar </span> Kami?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">Daftarkan diri Anda sekarang dan mulailah perjalanan menuju masa depan yang lebih cerah.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/ppdb" className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-primary hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg">
            Daftar Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/profil" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
            Hubungi Kami
          </Link>
        </div>
      </AnimateOnScroll>
    </section>
  );
}


export default async function HomePage() {
  const config = await getSchoolConfig();
  const rawSections = await getLandingSections();
  
  await dbConnect();
  
  // Sort by display order and filter by is_visible
  const sections = rawSections
    .filter((sec: any) => sec.is_visible)
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const totalSiswa = await User.countDocuments({ roles: "STUDENT" }) || 850;
  const totalGuru = await User.countDocuments({ roles: "TEACHER" }) || 45;
  const totalKelas = 24;
  const akreditasi = "A";

  // Fetch published articles for the landing page news section
  const latestArticles = await Article.find({ status: "published", category_type: { $in: ["berita", "pengumuman"] } })
    .sort({ published_at: -1 })
    .limit(4)
    .lean();

  const renderSection = (sec: any) => {
    switch(sec.section_key) {
      case "hero": return <HeroSection key={sec.section_key} config={config} totalSiswa={totalSiswa} totalGuru={totalGuru} totalKelas={totalKelas} akreditasi={akreditasi} />;
      case "sambutan": return <SambutanSection key={sec.section_key} config={config} customTitle={sec.custom_title} />;
      case "stats": return <KeunggulanSection key={sec.section_key} customTitle={sec.custom_title} />;
      case "news": return <NewsSection key={sec.section_key} customTitle={sec.custom_title} articles={JSON.parse(JSON.stringify(latestArticles))} />;
      case "agenda": return <AgendaSection key={sec.section_key} customTitle={sec.custom_title} />;
      case "alumni": return <AlumniSection key={sec.section_key} customTitle={sec.custom_title} />;
      default: return null;
    }
  };

  return (
    <>
      {sections.map(renderSection)}
      <CtaSection />
    </>
  );
}
