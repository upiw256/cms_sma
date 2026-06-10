"use client";

import { showToast, showAlert, showConfirm } from "@/lib/swal";
import { useState, useEffect } from "react";
import { getSchoolConfig, updateSchoolConfig } from "@/actions/schoolConfig";
import { uploadImageBase64 } from "@/actions/upload";
import { convertToWebP } from "@/lib/image-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Save, ShieldCheck, Palette, Phone, Globe, User, Layers, RotateCcw } from "lucide-react";

export default function IdentityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function load() {
      const data = await getSchoolConfig();
      setConfig(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleGradientChange = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      landing_bg_gradient: { ...prev.landing_bg_gradient, [field]: value }
    }));
  };

  const getBgPreviewStyle = () => {
    const type = config?.landing_bg_type || "default";
    if (type === "color") return { backgroundColor: config?.landing_bg_color || "#0f172a" };
    if (type === "gradient") {
      const g = config?.landing_bg_gradient || {};
      const dir = g.direction || "135deg";
      const from = g.from || "#0f172a";
      const via = g.via || "#1e3a5f";
      const to = g.to || "#1e293b";
      return { background: `linear-gradient(${dir}, ${from}, ${via}, ${to})` };
    }
    return { backgroundColor: "#f1f5f9" }; // neutral preview for theme-default
  };

  const handleImageUpload = async (field: string, file: File) => {
    try {
      setSaving(true);
      const webpBase64 = await convertToWebP(file, 0.7, 1000); // Quality 0.7, max 1000px
      const res = await uploadImageBase64(webpBase64);
      if (res.success) {
        setConfig((prev: any) => ({ ...prev, [field]: res.url }));
        setMessage({ type: "success", text: "Gambar berhasil diunggah" });
      } else {
        setMessage({ type: "error", text: "Gagal mengunggah gambar: " + res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Gagal memproses gambar" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const { _id, createdAt, updatedAt, __v, ...dataToSave } = config;
      const res = await updateSchoolConfig(dataToSave);
      if (res.success) {
        setMessage({ type: "success", text: "Identitas sekolah berhasil diperbarui" });
      } else {
        setMessage({ type: "error", text: "Gagal memperbarui identitas" });
      }
    } catch (err: any) {
      console.error("CLIENT ERROR:", err);
      showAlert({ text: "ERROR: " + (err?.message || "Unknown error"), icon: "error" });
      setMessage({ type: "error", text: "Terjadi kesalahan sistem: " + (err?.message || "") });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleResetTheme = async () => {
    if (await showConfirm("Apakah Anda yakin ingin mereset tema warna utama dan background ke pengaturan default CMS?")) {
      setConfig((prev: any) => ({
        ...prev,
        primary_color: "#3b82f6",
        secondary_color: "#1d4ed8",
        landing_bg_type: "default",
        landing_bg_color: "#0f172a",
        landing_bg_gradient: {
          from: "#0f172a",
          via: "#1e3a5f",
          to: "#1e293b",
          direction: "135deg",
        }
      }));
      setMessage({ type: "success", text: "Tema dikembalikan ke default. Silakan klik Simpan Perubahan." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Identitas Sekolah</h1>
          <p className="text-slate-500 mt-1">Kelola data dasar, branding, dan informasi kontak sekolah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="outline"
            onClick={handleResetTheme} 
            disabled={saving}
            className="rounded-xl px-4 transition-all active:scale-95 text-slate-600 dark:text-slate-300 hidden sm:flex"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Tema
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" 
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
        } transition-all duration-500`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Basic Info */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> 
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="npsn">NPSN</Label>
              <Input id="npsn" value={config.npsn} onChange={(e) => handleInputChange("npsn", e.target.value)} placeholder="Contoh: 20234567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Sekolah</Label>
              <Input id="name" value={config.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="SMA KOMPLEKS" />
            </div>
            <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
              <Label htmlFor="news_region">Filter Daerah Berita (NewsAPI)</Label>
              <Input id="news_region" value={config.news_region || ""} onChange={(e) => handleInputChange("news_region", e.target.value)} placeholder="Contoh: Jawa Barat / Jakarta" />
              <p className="text-xs text-slate-500">Berita di halaman landing page difilter berdasarkan pendidikan di wilayah ini.</p>
            </div>
          </CardContent>
        </Card>

        {/* Branding & Assets */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 lg:row-span-2">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-fuchsia-500" /> 
              Branding & Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warna Utama</Label>
                <div className="flex gap-2">
                  <input type="color" value={config.primary_color} onChange={(e) => handleInputChange("primary_color", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <Input value={config.primary_color} onChange={(e) => handleInputChange("primary_color", e.target.value)} className="uppercase text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Warna Sekunder</Label>
                <div className="flex gap-2">
                  <input type="color" value={config.secondary_color} onChange={(e) => handleInputChange("secondary_color", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <Input value={config.secondary_color} onChange={(e) => handleInputChange("secondary_color", e.target.value)} className="uppercase text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-white/5">
              <div className="space-y-2">
                <Label>Favicon (32x32)</Label>
                <div className="flex items-center gap-4">
                  {config.favicon && <img src={config.favicon} alt="Favicon" className="w-8 h-8 rounded border dark:border-white/10" />}
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors text-sm">
                    <ImagePlus className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Pilih Icon</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("favicon", e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Branding Logo</Label>
                <div className="space-y-3">
                  {config.branding_logo && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                      <img src={config.branding_logo} alt="Logo" className="max-h-20 object-contain" />
                    </div>
                  )}
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                    <ImagePlus className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Unggah Logo Baru</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("branding_logo", e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headmaster Info */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" /> 
              Kepala Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex gap-6">
            <div className="relative w-24 h-24 group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden">
                {config.headmaster_photo ? (
                  <img src={config.headmaster_photo} alt="Kepsek" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-8 h-8" /></div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <ImagePlus className="w-6 h-6 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("headmaster_photo", e.target.files[0])} />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headmaster_name">Nama Lengkap & Gelar</Label>
                <Input id="headmaster_name" value={config.headmaster_name} onChange={(e) => handleInputChange("headmaster_name", e.target.value)} placeholder="Dr. Budi Santoso, M.Pd" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headmaster_greeting">Pesan Sambutan</Label>
                <textarea 
                  id="headmaster_greeting"
                  className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={config.headmaster_greeting}
                  onChange={(e) => handleInputChange("headmaster_greeting", e.target.value)}
                  placeholder="Tuliskan kata sambutan kepala sekolah di sini..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" /> 
              Kontak & Alamat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <textarea 
                className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm"
                value={config.contact_info?.address}
                onChange={(e) => handleNestedChange("contact_info", "address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input value={config.contact_info?.phone} onChange={(e) => handleNestedChange("contact_info", "phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email Sekolah</Label>
                <Input value={config.contact_info?.email} onChange={(e) => handleNestedChange("contact_info", "email", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background Landing Page */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 lg:col-span-2">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Background Landing Page
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mode Selector */}
              <div className="lg:col-span-1 space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mode Background</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "default", label: "🌓 Default", desc: "Sesuai tema (Terang / Gelap)" },
                    { value: "color", label: "🎨 Warna Solid", desc: "Satu warna penuh" },
                    { value: "gradient", label: "🌈 Gradient Linear", desc: "Perpaduan beberapa warna" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleInputChange("landing_bg_type", opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        config?.landing_bg_type === opt.value
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                          : "border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/40 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Config Panel */}
              <div className="lg:col-span-1 space-y-4">
                {(config?.landing_bg_type === "color" || !config?.landing_bg_type || config?.landing_bg_type === "default") && (
                  config?.landing_bg_type === "color" ? (
                    <>
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Warna</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={config?.landing_bg_color || "#0f172a"}
                          onChange={(e) => handleInputChange("landing_bg_color", e.target.value)}
                          className="w-14 h-14 rounded-xl border-0 cursor-pointer shadow-md"
                        />
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-slate-500">Hex Code</Label>
                          <Input
                            value={config?.landing_bg_color || "#0f172a"}
                            onChange={(e) => handleInputChange("landing_bg_color", e.target.value)}
                            className="uppercase font-mono text-sm"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-slate-400 text-center px-4 py-8 rounded-xl border border-dashed border-slate-200 dark:border-white/10 w-full">
                        Mode default menyesuaikan background otomatis dengan tema terang / gelap pengunjung.
                      </p>
                    </div>
                  )
                )}

                {config?.landing_bg_type === "gradient" && (
                  <>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Warna Gradient</Label>
                    {[
                      { key: "from", label: "Warna Awal", emoji: "🔵" },
                      { key: "via",  label: "Warna Tengah", emoji: "🟣" },
                      { key: "to",   label: "Warna Akhir", emoji: "🔴" },
                    ].map(({ key, label, emoji }) => (
                      <div key={key} className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={config?.landing_bg_gradient?.[key] || "#0f172a"}
                          onChange={(e) => handleGradientChange(key, e.target.value)}
                          className="w-10 h-10 rounded-xl border-0 cursor-pointer shadow-sm"
                        />
                        <div className="flex-1">
                          <Label className="text-xs text-slate-500">{emoji} {label}</Label>
                          <Input
                            value={config?.landing_bg_gradient?.[key] || ""}
                            onChange={(e) => handleGradientChange(key, e.target.value)}
                            className="uppercase font-mono text-xs h-8 mt-1"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Arah Gradient</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { dir: "to bottom",       icon: "↓", label: "Bawah" },
                          { dir: "to right",        icon: "→", label: "Kanan" },
                          { dir: "to bottom right", icon: "↘", label: "Kanan-Bawah" },
                          { dir: "to bottom left",  icon: "↙", label: "Kiri-Bawah" },
                          { dir: "135deg",          icon: "⟋", label: "135°" },
                          { dir: "45deg",           icon: "⟋", label: "45°" },
                        ].map(({ dir, icon, label }) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => handleGradientChange("direction", dir)}
                            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs transition-all ${
                              config?.landing_bg_gradient?.direction === dir
                                ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold"
                                : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-violet-300"
                            }`}
                          >
                            <span className="text-lg leading-none">{icon}</span>
                            <span className="leading-tight">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-1 space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preview Langsung</Label>
                <div
                  className="w-full h-52 rounded-2xl border-2 border-slate-200 dark:border-white/10 overflow-hidden relative shadow-inner transition-all duration-500"
                  style={getBgPreviewStyle()}
                >
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className="absolute top-4 left-4">
                    <div className="h-2 w-20 rounded-full bg-white/20 mb-2" />
                    <div className="h-4 w-36 rounded-full bg-white/30 mb-2" />
                    <div className="h-2 w-28 rounded-full bg-white/15" />
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="h-7 w-16 rounded-lg bg-white/25" />
                    <div className="h-7 w-16 rounded-lg bg-white/10 border border-white/20" />
                  </div>
                  <div className="absolute bottom-2 right-3 text-white/30 text-[10px] font-medium">Landing Page Preview</div>
                </div>
                <p className="text-xs text-slate-400 text-center mt-1">Preview menampilkan background Hero Section</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 lg:col-span-1">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-500" /> 
              Media Sosial
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input value={config.social_media?.facebook} onChange={(e) => handleNestedChange("social_media", "facebook", e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={config.social_media?.instagram} onChange={(e) => handleNestedChange("social_media", "instagram", e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Twitter URL</Label>
              <Input value={config.social_media?.twitter} onChange={(e) => handleNestedChange("social_media", "twitter", e.target.value)} placeholder="https://twitter.com/..." />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input value={config.social_media?.youtube} onChange={(e) => handleNestedChange("social_media", "youtube", e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
