import React from "react";
import { getSchoolConfig } from "@/actions/schoolConfig";
import { getLandingSections } from "@/actions/landingConfig";
import { getPpdbSettings } from "@/actions/ppdb";
import { getSklSettings } from "@/actions/skl";
import { ArrowRight, BookOpen, GraduationCap, Users, Calendar, Trophy, Shield, Globe, Newspaper } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Article from "@/models/Article";
// import removed
import CountUp from "@/components/CountUp";
import HeadmasterGreeting from "@/components/HeadmasterGreeting";
import OrganigramSection from "@/components/OrganigramSection";
import { ILandingSection } from "@/models/LandingSection";

function getHeroBgStyle(config: any): React.CSSProperties {
  const type = config?.landing_bg_type || "default";
  if (type === "color") {
    return { backgroundColor: config?.landing_bg_color || "#0f172a" };
  }
  if (type === "gradient") {
    const g = config?.landing_bg_gradient || {};
    const direction = g.direction || "135deg";
    const from = g.from || "#0f172a";
    const via = g.via || "#1e3a5f";
    const to = g.to || "#1e293b";
    // If via is same as from or empty, use two-color gradient
    const stops = via && via !== from ? `${from}, ${via}, ${to}` : `${from}, ${to}`;
    return { background: `linear-gradient(${direction}, ${stops})` };
  }
  // default: keep original dark slate gradient via CSS
  return {};
}

function HeroSection({ config, totalSiswa, totalGuru, totalKelas, akreditasi, ppdbSettings, sklSettings }: any) {
  const bgStyle = getHeroBgStyle(config);
  const isDefault = !config?.landing_bg_type || config.landing_bg_type === "default";
  
  const isPpdbOpen = ppdbSettings?.is_open;
  const isSklPublished = sklSettings?.is_published;

  return (
    <section
      className={`relative w-full py-20 lg:py-32 flex items-center min-h-[70vh] ${isDefault ? "bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" : ""}`}
      style={!isDefault ? bgStyle : undefined}
    >
      <div className="container relative z-10 px-4 mx-auto mt-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            {isPpdbOpen && (
              <div className="inline-block py-1 px-3 rounded bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
                PENDAFTARAN PPDB {new Date().getFullYear()}/{new Date().getFullYear() + 1} TELAH DIBUKA
              </div>
            )}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${isDefault ? "text-slate-900 dark:text-white" : "text-white"}`}>
              Selamat Datang di <br className="hidden md:block" />
              <span className={isDefault ? "text-[var(--primary-color)]" : "text-blue-300"}>{config?.name || "Sekolah Kami"}</span>
            </h1>
            <p className={`text-lg mb-8 max-w-2xl mx-auto md:mx-0 ${isDefault ? "text-slate-600 dark:text-slate-300" : "text-slate-200"}`}>
              {config?.name} berkomitmen memberikan pendidikan berkualitas, berakhlak mulia, dan berprestasi untuk mencetak generasi penerus bangsa yang unggul.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {isPpdbOpen && (
                <Link href="/ppdb" className="flex items-center gap-2 px-6 py-3 rounded text-white bg-[var(--primary-color)] hover:brightness-110 transition-all font-medium shadow-sm">
                  Daftar PPDB <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {isSklPublished && (
                <Link href="/skl" className="flex items-center gap-2 px-6 py-3 rounded text-white bg-amber-500 hover:bg-amber-600 transition-all font-medium shadow-sm">
                  Portal Kelulusan
                </Link>
              )}
              <Link href="/profil" className="flex items-center gap-2 px-6 py-3 rounded text-[var(--primary-color)] bg-white border border-[var(--primary-color)] hover:bg-slate-50 transition-all font-medium shadow-sm">
                Jelajahi Profil
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-md bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Data Sekolah</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{typeof totalSiswa === 'number' ? <CountUp end={totalSiswa} /> : totalSiswa}</div>
                  <div className="text-xs text-slate-500">Siswa Aktif</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{typeof totalGuru === 'number' ? <CountUp end={totalGuru} /> : totalGuru}</div>
                  <div className="text-xs text-slate-500">Guru</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{typeof totalKelas === 'number' ? <CountUp end={totalKelas} /> : totalKelas}</div>
                  <div className="text-xs text-slate-500">Rombel</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-rose-500" />
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{akreditasi}</div>
                  <div className="text-xs text-slate-500">Akreditasi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SambutanSection({ config, customTitle }: any) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center max-w-6xl mx-auto">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-64 md:w-full max-w-sm rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pt-2 px-2 pb-6">
              <img src={config?.headmaster_photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"} alt="Kepala Sekolah" className="w-full h-auto aspect-[3/4] object-cover rounded mb-4" />
              <div className="text-center">
                <p className="font-bold text-slate-900 dark:text-white text-lg">{config?.headmaster_name || "Kepala Sekolah"}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Kepala Sekolah</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <div className="mb-6 border-b-2 border-[var(--primary-color)] pb-2 inline-block">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white uppercase" dangerouslySetInnerHTML={{ __html: customTitle || "Sambutan Kepala Sekolah" }} />
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <HeadmasterGreeting 
                greeting={config?.headmaster_greeting} 
                fallback={`Selamat datang di website resmi ${config?.name || "sekolah kami"}. Kami berharap website ini dapat menjadi media informasi dan komunikasi yang efektif bagi seluruh warga sekolah dan masyarakat luas.`} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KeunggulanSection({ customTitle }: any) {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 uppercase">{customTitle || "Program & Keunggulan"}</h2>
        <div className="w-24 h-1 bg-[var(--primary-color)] mx-auto mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Kurikulum Standar Nasional", desc: "Menerapkan kurikulum terbaru yang disesuaikan dengan kebutuhan pendidikan masa kini, membentuk karakter dan akademis." },
            { icon: Globe, title: "Fasilitas Memadai", desc: "Ruang kelas yang nyaman, perpustakaan lengkap, dan laboratorium praktikum untuk menunjang kegiatan belajar." },
            { icon: Trophy, title: "Prestasi Siswa", desc: "Berbagai ekstrakurikuler yang aktif mencetak juara di tingkat kabupaten, provinsi, hingga nasional." },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded shadow border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection({ customTitle, articles, hideSeeAll }: { customTitle?: string; articles: any[]; hideSeeAll?: boolean }) {
  const featured = articles[0];
  const rest = articles.slice(1, 5);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 uppercase">{customTitle || "Berita & Informasi"}</h2>
            <div className="w-24 h-1 bg-[var(--primary-color)]"></div>
          </div>
          {articles.length > 0 && !hideSeeAll && (
            <Link href="/berita" className="hidden md:flex items-center gap-2 text-sm font-semibold text-[var(--primary-color)] hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center rounded">
            <Newspaper className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">Belum Ada Berita</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Berita dan pengumuman terbaru akan tampil di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
            {/* Featured article */}
            {featured && (
              <a href={featured.external_url || `/berita/${featured.slug}`} target={featured.external_url ? "_blank" : "_self"} rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-4 relative bg-slate-100 dark:bg-slate-800">
                  <img
                    src={featured.image_banner || "https://images.unsplash.com/photo-1546410531-ea4cea477149?q=80&w=2670&auto=format&fit=crop"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={featured.title}
                  />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-block text-xs font-bold px-2 py-1 bg-[var(--primary-color)] text-white rounded uppercase">{ featured.category_type }</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(featured.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-[var(--primary-color)] transition-colors">{featured.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-3">{(featured.content || "").replace(/<[^>]*>?/gm, '')}</p>
              </a>
            )}

            {/* Side list */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-6">
                {rest.map((item: any, i: number) => (
                  <a key={i} href={item.external_url || `/berita/${item.slug}`} target={item.external_url ? "_blank" : "_self"} rel="noopener noreferrer" className="flex gap-4 group">
                    <div className="w-24 h-24 rounded overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.image_banner || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={item.title}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[var(--primary-color)] transition-colors line-clamp-3">{item.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {articles.length > 0 && !hideSeeAll && (
          <div className="mt-8 text-center md:hidden">
            <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-color)] hover:underline">
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
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 uppercase">{customTitle || "Agenda Sekolah"}</h2>
        <div className="w-24 h-1 bg-[var(--primary-color)] mb-8"></div>
        <div className="p-6 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center w-full">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">Belum ada agenda terdekat.</p>
        </div>
      </div>
    </section>
  );
}

function AlumniSection({ customTitle }: any) {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-[var(--primary-color)] text-white p-10 md:p-16 rounded shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4 uppercase">{customTitle || "Penelusuran Alumni"}</h2>
            <p className="text-white mb-0 max-w-xl">Mari bergabung bersama ikatan alumni. Daftarkan diri Anda dan tetap terhubung dengan sekolah serta rekan-rekan seangkatan.</p>
          </div>
          <Link href="/alumni" className="whitespace-nowrap px-8 py-3 bg-white text-[var(--primary-color)] font-bold rounded hover:bg-slate-100 transition-colors">
            Portal Alumni
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 bg-slate-900 text-white text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">Informasi Penerimaan Peserta Didik Baru</h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Kami membuka pendaftaran untuk calon peserta didik baru. Segera daftarkan diri Anda.</p>
        <div className="flex justify-center gap-4">
          <Link href="/ppdb" className="px-6 py-3 bg-[var(--primary-color)] text-white font-medium rounded hover:brightness-110 transition-all">
            Informasi PPDB
          </Link>
          <Link href="/profil" className="px-6 py-3 border border-slate-500 text-slate-200 font-medium rounded hover:bg-slate-800 transition-all">
            Kontak Kami
          </Link>
        </div>
      </div>
    </section>
  );
}


export default async function HomePage() {
  const config = await getSchoolConfig();
  const rawSections = await getLandingSections();
  const ppdbSettings = await getPpdbSettings();
  const sklSettings = await getSklSettings();
  
  await dbConnect();
  
  // Sort by display order and filter by is_visible
  const sections = rawSections
    .filter((sec: any) => sec.is_visible)
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const totalSiswa = await User.countDocuments({ roles: "STUDENT" }) || 850;
  const totalGuru = await User.countDocuments({ roles: "TEACHER" }) || 45;
  const totalKelas = 24;
  const akreditasi = "A";

  // Fetch published articles for the landing page news section (fallback)
  let latestArticles: any[] = [];
  try {
    latestArticles = await Article.find({ status: "published", category_type: { $in: ["berita", "pengumuman"] } })
      .sort({ published_at: -1 })
      .limit(4)
      .lean();
  } catch (e) {
    console.warn("Failed to fetch local articles", e);
  }

  // Fetch from NewsAPI limited to 5 articles
  let externalArticles: any[] = [];
  try {
    const regionKeyword = config?.news_region || "Jawa Barat";
    
    const fetchNews = async (query: string) => {
      const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=id&sortBy=publishedAt&pageSize=5&apiKey=3a8a4e964f45465d87e01d4070b53945`, { 
        next: { revalidate: 3600 } 
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.articles || [];
    };

    let searchQuery = encodeURIComponent(`pendidikan ${regionKeyword}`);
    let apiArticles = await fetchNews(searchQuery);

    // Jika artikel pendidikan daerah kurang dari 5, genapi dengan berita UMUM dari daerah tersebut agar spesifik ke wilayahnya
    if (apiArticles.length < 5) {
      const fallbackQuery = encodeURIComponent(`"${regionKeyword}"`);
      const fallbackArticles = await fetchNews(fallbackQuery);
      
      const combined = [...apiArticles, ...fallbackArticles];
      const uniqueUrls = new Set();
      apiArticles = combined.filter((a: any) => {
          if (uniqueUrls.has(a.url)) return false;
          uniqueUrls.add(a.url);
          return true;
      }).slice(0, 5);
    }
    
    externalArticles = apiArticles.map((a: any) => ({
      title: a.title,
      slug: a.title, // fallback
      external_url: a.url,
      image_banner: a.urlToImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300",
      published_at: a.publishedAt,
      category_type: "Pendidikan",
      content: a.description || "",
    }));
  } catch (err) {
    console.error("Failed to fetch newsAPI", err);
  }

  const renderSection = (sec: any) => {
    switch(sec.section_key) {
      case "hero": return <HeroSection key={sec.section_key} config={config} totalSiswa={totalSiswa} totalGuru={totalGuru} totalKelas={totalKelas} akreditasi={akreditasi} ppdbSettings={ppdbSettings} sklSettings={sklSettings} />;
      case "sambutan": return <SambutanSection key={sec.section_key} config={config} customTitle={sec.custom_title} />;
      case "stats": return <KeunggulanSection key={sec.section_key} customTitle={sec.custom_title} />;
      case "news": return (
        <React.Fragment key={sec.section_key}>
          {(latestArticles.length > 0 || externalArticles.length === 0) && (
            <NewsSection customTitle={sec.custom_title} articles={JSON.parse(JSON.stringify(latestArticles))} />
          )}
          {externalArticles.length > 0 && (
            <NewsSection hideSeeAll={true} customTitle={`Berita Seputar ${config?.news_region || "Jawa Barat"}`} articles={externalArticles} />
          )}
        </React.Fragment>
      );
      case "agenda": return <AgendaSection key={sec.section_key} customTitle={sec.custom_title} />;
      case "alumni": return <AlumniSection key={sec.section_key} customTitle={sec.custom_title} />;
      default: return null;
    }
  };

  return (
    <>
      {sections.map(renderSection)}
      <OrganigramSection />
      <CtaSection />
    </>
  );
}
