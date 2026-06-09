"use client";

import { showToast, showAlert, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getPpdbRegistrants,
  getPpdbStats,
  getPpdbSettings,
  savePpdbSettings,
  getPpdbRegistrantDetail,
  deleteRegistrant,
} from "@/actions/ppdb";
import { CsvImportPanel } from "@/components/ppdb/CsvImportPanel";
import { VerifikasiModal } from "@/components/ppdb/VerifikasiModal";
import RichTextEditor from "@/components/RichTextEditor";
import {
  Users,
  CheckCircle2,
  ClipboardList,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Settings,
  Upload,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Plus,
  Minus,
  CalendarDays,
  ArrowUpDown,
} from "lucide-react";
import type { Session } from "next-auth";

// ── Types ──────────────────────────────────────────
type TabKey = "daftar" | "import" | "settings";

const STATUS_MAP = {
  diterima: { label: "Diterima", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  daftar_ulang: { label: "Daftar Ulang", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  terverifikasi: { label: "Terverifikasi ✓", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  ditolak: { label: "Ditolak", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
};

// ── Stat Card ──────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

// ── Exported Excel ─────────────────────────────────
function exportToCsv(data: any[]) {
  const headers = ["No Peserta", "Nama", "Asal Sekolah", "Pilihan Kelas", "Status", "Submitted At"];
  const rows = data.map((r) => [
    r.no_peserta,
    r.nama,
    r.asal_sekolah,
    r.pilihan_kelas || "",
    r.status,
    r.submission_id ? "Ya" : "Tidak",
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ppdb-daftar-ulang-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ─────────────────────────────────
export default function PpdbDashboardClient({ session }: { session: Session | null }) {
  const [activeTab, setActiveTab] = useState<TabKey>("daftar");

  // Data state
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, diterima: 0, daftar_ulang: 0, terverifikasi: 0, ditolak: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Verification modal
  const [selectedDetail, setSelectedDetail] = useState<{ registrant: any; submission: any } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Settings
  const [settings, setSettings] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    is_open: false,
    tanggal_buka: "",
    tanggal_tutup: "",
    kuota_total: 0,
    pengumuman_info: "",
    contact_info: "",
    kuota_per_kelas: [] as { nama_kelas: string; kuota: number }[],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [regRes, statsRes] = await Promise.all([
        getPpdbRegistrants({ page, limit: 20, search: search || undefined, status: statusFilter }),
        getPpdbStats(),
      ]);
      setRegistrants(regRes.registrants);
      setTotalPages(regRes.totalPages);
      setTotal(regRes.total);
      setStats(statsRes);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadSettings = useCallback(async () => {
    const s = await getPpdbSettings();
    setSettings(s);
    if (s) {
      setSettingsForm({
        is_open: s.is_open,
        tanggal_buka: s.tanggal_buka ? new Date(s.tanggal_buka).toISOString().split("T")[0] : "",
        tanggal_tutup: s.tanggal_tutup ? new Date(s.tanggal_tutup).toISOString().split("T")[0] : "",
        kuota_total: s.kuota_total,
        pengumuman_info: s.pengumuman_info || "",
        contact_info: s.contact_info || "",
        kuota_per_kelas: s.kuota_per_kelas || [],
      });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (activeTab === "settings") loadSettings(); }, [activeTab, loadSettings]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadData(); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleViewDetail(id: string) {
    setIsLoadingDetail(true);
    try {
      const data = await getPpdbRegistrantDetail(id);
      if (data) setSelectedDetail(data);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function handleDelete(id: string, nama: string) {
    if (!(await showConfirm(`Hapus data ${nama}? Tindakan ini tidak dapat dibatalkan.`))) return;
    await deleteRegistrant(id);
    loadData();
  }

  async function handleSaveSettings() {
    if (!settingsForm.tanggal_buka || !settingsForm.tanggal_tutup) {
      showAlert({ text: "Tanggal buka dan tutup harus diisi.", icon: "warning" });
      return;
    }
    setIsSavingSettings(true);
    try {
      await savePpdbSettings(settingsForm);
      await loadSettings();
      showToast("Pengaturan berhasil disimpan.", "success");
    } finally {
      setIsSavingSettings(false);
    }
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "daftar", label: "Daftar Peserta", icon: Users },
    { key: "import", label: "Import CSV", icon: Upload },
    { key: "settings", label: "Pengaturan Sesi", icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-slide-up max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              PPDB — Daftar Ulang
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Kelola verifikasi daftar ulang calon siswa yang telah diterima melalui sistem Dinas.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => exportToCsv(registrants)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Ekspor CSV
            </button>
            <button
              onClick={() => startTransition(loadData)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl
                hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Peserta" value={stats.total} icon={Users} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Belum Daftar Ulang" value={stats.diterima} icon={Clock} color="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" />
        <StatCard label="Sudah Daftar Ulang" value={stats.daftar_ulang} icon={ClipboardList} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard label="Terverifikasi" value={stats.terverifikasi} icon={CheckCircle2} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard label="Ditolak" value={stats.ditolak} icon={XCircle} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── TAB: Daftar Peserta ── */}
          {activeTab === "daftar" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, nomor peserta, asal sekolah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                      bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                      bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm appearance-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="diterima">Belum Daftar Ulang</option>
                    <option value="daftar_ulang">Sudah Daftar Ulang</option>
                    <option value="terverifikasi">Terverifikasi</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-5 py-3.5 text-left">No. Peserta</th>
                      <th className="px-5 py-3.5 text-left">Nama Lengkap</th>
                      <th className="px-5 py-3.5 text-left hidden md:table-cell">Asal Sekolah</th>
                      <th className="px-5 py-3.5 text-left hidden lg:table-cell">Kelas</th>
                      <th className="px-5 py-3.5 text-left">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : registrants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                          {search || statusFilter !== "all" ? "Tidak ada data sesuai filter." : "Belum ada data peserta. Import CSV dari sistem Dinas terlebih dahulu."}
                        </td>
                      </tr>
                    ) : (
                      registrants.map((r) => {
                        const sc = STATUS_MAP[r.status as keyof typeof STATUS_MAP];
                        return (
                          <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-300">
                              {r.no_peserta}
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 dark:text-white">{r.nama}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {r.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                              </p>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell text-slate-600 dark:text-slate-300 text-xs">
                              {r.asal_sekolah}
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell text-slate-600 dark:text-slate-300 text-xs">
                              {r.pilihan_kelas || "—"}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${sc?.bg} ${sc?.text}`}>
                                {sc?.label || r.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleViewDetail(r._id)}
                                  disabled={isLoadingDetail}
                                  title="Lihat Detail & Verifikasi"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                    hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {isLoadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete(r._id, r.nama)}
                                  title="Hapus Data"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                    hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Menampilkan {registrants.length} dari {total} peserta
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center
                      text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-slate-600 dark:text-slate-300 font-medium px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center
                      text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Import CSV ── */}
          {activeTab === "import" && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Import Data dari Sistem Dinas
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload file CSV hasil ekspor dari sistem PPDB Dinas Pendidikan. Data yang sudah ada
                  (duplikat no_peserta) akan dilewati secara otomatis.
                </p>
              </div>
              <CsvImportPanel onImported={() => { setActiveTab("daftar"); loadData(); }} />
            </div>
          )}

          {/* ── TAB: Settings ── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Konfigurasi Sesi Daftar Ulang
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Atur jadwal, kuota, dan informasi yang tampil di halaman publik PPDB.
                </p>
              </div>

              {/* Toggle Open */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Status Daftar Ulang</p>
                    <p className="text-xs text-slate-400 mt-0.5">Aktifkan agar halaman publik menerima form daftar ulang</p>
                  </div>
                  <button
                    onClick={() => setSettingsForm((prev) => ({ ...prev, is_open: !prev.is_open }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      settingsForm.is_open ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                      settingsForm.is_open ? "translate-x-6" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    Tanggal Buka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={settingsForm.tanggal_buka}
                    onChange={(e) => setSettingsForm((prev) => ({ ...prev, tanggal_buka: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                      bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    Tanggal Tutup <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={settingsForm.tanggal_tutup}
                    onChange={(e) => setSettingsForm((prev) => ({ ...prev, tanggal_tutup: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                      bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Kuota */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Kuota Total Kursi
                </label>
                <input
                  type="number"
                  value={settingsForm.kuota_total}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, kuota_total: Number(e.target.value) }))}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                    bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Kuota per kelas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Kuota per Kelas (opsional)
                  </label>
                  <button
                    onClick={() => setSettingsForm((prev) => ({
                      ...prev,
                      kuota_per_kelas: [...prev.kuota_per_kelas, { nama_kelas: "", kuota: 0 }],
                    }))}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                  </button>
                </div>
                <div className="space-y-2">
                  {settingsForm.kuota_per_kelas.map((kls, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama Kelas (e.g. IPA 1)"
                        value={kls.nama_kelas}
                        onChange={(e) => {
                          const arr = [...settingsForm.kuota_per_kelas];
                          arr[i] = { ...arr[i], nama_kelas: e.target.value };
                          setSettingsForm((prev) => ({ ...prev, kuota_per_kelas: arr }));
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                      <input
                        type="number"
                        placeholder="Kuota"
                        value={kls.kuota}
                        min={0}
                        onChange={(e) => {
                          const arr = [...settingsForm.kuota_per_kelas];
                          arr[i] = { ...arr[i], kuota: Number(e.target.value) };
                          setSettingsForm((prev) => ({ ...prev, kuota_per_kelas: arr }));
                        }}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                      <button
                        onClick={() => setSettingsForm((prev) => ({
                          ...prev,
                          kuota_per_kelas: prev.kuota_per_kelas.filter((_, j) => j !== i),
                        }))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pengumuman Info */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Teks Pengumuman / Panduan
                </label>
                <RichTextEditor
                  content={settingsForm.pengumuman_info}
                  onChange={(html) => setSettingsForm((prev) => ({ ...prev, pengumuman_info: html }))}
                />
              </div>

              {/* Kontak */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Informasi Kontak Panitia
                </label>
                <textarea
                  value={settingsForm.contact_info}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, contact_info: e.target.value }))}
                  rows={2}
                  placeholder="Hubungi: Bapak/Ibu ... di 08xxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                    bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm resize-none
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl
                  hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSavingSettings ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-5 h-5" /> Simpan Pengaturan</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {selectedDetail && (
        <VerifikasiModal
          registrant={selectedDetail.registrant}
          submission={selectedDetail.submission}
          adminId={(session?.user as any)?.id || ""}
          onClose={() => setSelectedDetail(null)}
          onUpdated={() => { loadData(); setSelectedDetail(null); }}
        />
      )}
    </div>
  );
}
