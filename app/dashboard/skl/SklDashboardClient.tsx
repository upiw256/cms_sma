"use client";

import { showToast, showAlert, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getSklStudents,
  getSklStats,
  getSklSettings,
  saveSklSettings,
  updateSklStudentStatus,
  deleteSklStudent,
} from "@/actions/skl";
import { SklCsvImportPanel } from "@/components/skl/SklCsvImportPanel";
import RichTextEditor from "@/components/RichTextEditor";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Settings,
  Upload,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  CalendarDays,
  Edit,
} from "lucide-react";
import type { Session } from "next-auth";

type TabKey = "daftar" | "import" | "settings";

const STATUS_MAP = {
  lulus: { label: "Lulus", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  tidak_lulus: { label: "Tidak Lulus", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  ditunda: { label: "Ditunda", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
};

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

function exportToCsv(data: any[]) {
  const headers = ["No Ujian", "NISN", "Nama Lengkap", "Kelas", "Status Kelulusan", "Catatan"];
  const rows = data.map((r) => [
    r.no_ujian,
    r.nisn,
    r.nama,
    r.kelas,
    r.status_lulus,
    r.catatan || "",
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skl-siswa-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SklDashboardClient({ session }: { session: Session | null }) {
  const [activeTab, setActiveTab] = useState<TabKey>("daftar");

  // Data state
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, lulus: 0, tidak_lulus: 0, ditunda: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Settings
  const [settings, setSettings] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    is_published: false,
    tanggal_pengumuman: "",
    pesan_lulus: "",
    pesan_tidak_lulus: "",
  });

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<"lulus" | "tidak_lulus" | "ditunda">("ditunda");
  const [editNote, setEditNote] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getSklStudents({ page, limit: 20, search: search || undefined, status: statusFilter }),
        getSklStats(),
      ]);
      setStudents(res.students);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      setStats(statsRes);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadSettings = useCallback(async () => {
    const s = await getSklSettings();
    setSettings(s);
    if (s) {
      setSettingsForm({
        is_published: s.is_published,
        tanggal_pengumuman: s.tanggal_pengumuman ? new Date(s.tanggal_pengumuman).toISOString().substring(0, 16) : "",
        pesan_lulus: s.pesan_lulus || "",
        pesan_tidak_lulus: s.pesan_tidak_lulus || "",
      });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (activeTab === "settings") loadSettings(); }, [activeTab, loadSettings]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadData(); }, 400);
    return () => clearTimeout(t);
  }, [search, loadData]);

  async function handleDelete(id: string, nama: string) {
    if (!(await showConfirm(`Hapus data SKL ${nama}? Tindakan ini tidak dapat dibatalkan.`))) return;
    await deleteSklStudent(id);
    loadData();
  }

  async function handleSaveSettings() {
    if (!settingsForm.tanggal_pengumuman) {
      showAlert({ text: "Tanggal rilis pengumuman harus diisi.", icon: "warning" });
      return;
    }
    setIsSavingSettings(true);
    try {
      await saveSklSettings(settingsForm);
      await loadSettings();
      showToast("Pengaturan SKL berhasil disimpan.", "success");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function saveStudentStatus() {
    if (!editingStudent) return;
    setIsSavingStatus(true);
    try {
      await updateSklStudentStatus(editingStudent._id, editStatus, editNote);
      setEditingStudent(null);
      loadData();
    } finally {
      setIsSavingStatus(false);
    }
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "daftar", label: "Daftar Siswa", icon: Users },
    { key: "import", label: "Import CSV", icon: Upload },
    { key: "settings", label: "Pengaturan SKL", icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-slide-up max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Portal SKL (Surat Keterangan Lulus)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Kelola data kelulusan siswa dan atur jadwal pengumuman publik.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => exportToCsv(students)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Siswa" value={stats.total} icon={Users} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Lulus" value={stats.lulus} icon={CheckCircle2} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard label="Tidak Lulus" value={stats.tidak_lulus} icon={XCircle} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
        <StatCard label="Ditunda" value={stats.ditunda} icon={Clock} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
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
          {/* ── TAB: Daftar Siswa ── */}
          {activeTab === "daftar" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, no ujian, nisn..."
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
                    <option value="lulus">Lulus</option>
                    <option value="tidak_lulus">Tidak Lulus</option>
                    <option value="ditunda">Ditunda</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-5 py-3.5 text-left">No. Ujian / NISN</th>
                      <th className="px-5 py-3.5 text-left">Nama & Kelas</th>
                      <th className="px-5 py-3.5 text-left">Status</th>
                      <th className="px-5 py-3.5 text-left">Catatan</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                          {search || statusFilter !== "all" ? "Tidak ada data sesuai filter." : "Belum ada data SKL. Import CSV terlebih dahulu."}
                        </td>
                      </tr>
                    ) : (
                      students.map((r) => {
                        const sc = STATUS_MAP[r.status_lulus as keyof typeof STATUS_MAP];
                        return (
                          <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-300">
                              <div>{r.no_ujian}</div>
                              <div className="text-slate-400">{r.nisn}</div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 dark:text-white">{r.nama}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{r.kelas}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${sc?.bg} ${sc?.text}`}>
                                {sc?.label || r.status_lulus}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs text-slate-500 block max-w-[200px] truncate">{r.catatan || "-"}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingStudent(r);
                                    setEditStatus(r.status_lulus);
                                    setEditNote(r.catatan || "");
                                  }}
                                  title="Edit Status"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                    hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
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
                  Menampilkan {students.length} dari {total} peserta
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
                  Import Data Kelulusan
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload file CSV berisi hasil rapat kelulusan siswa tingkat akhir.
                </p>
              </div>
              <SklCsvImportPanel onImported={() => { setActiveTab("daftar"); loadData(); }} />
            </div>
          )}

          {/* ── TAB: Settings ── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Pengaturan Pengumuman SKL
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Atur jadwal publikasi kelulusan beserta template pesan untuk siswa lulus dan tidak lulus.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Publikasi Portal SKL</p>
                    <p className="text-xs text-slate-400 mt-0.5">Aktifkan untuk membuka akses publik ke Portal Kelulusan (dengan countdown)</p>
                  </div>
                  <button
                    onClick={() => setSettingsForm((prev) => ({ ...prev, is_published: !prev.is_published }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      settingsForm.is_published ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                      settingsForm.is_published ? "translate-x-6" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  Waktu Buka / Rilis SKL <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={settingsForm.tanggal_pengumuman}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, tanggal_pengumuman: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                    bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Jam rilis SKL. Sebelum waktu ini tiba, siswa hanya akan melihat countdown.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Pesan Tambahan (Lulus)
                </label>
                <RichTextEditor
                  content={settingsForm.pesan_lulus}
                  onChange={(html) => setSettingsForm((prev) => ({ ...prev, pesan_lulus: html }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Pesan Tambahan (Tidak Lulus / Ditunda)
                </label>
                <RichTextEditor
                  content={settingsForm.pesan_tidak_lulus}
                  onChange={(html) => setSettingsForm((prev) => ({ ...prev, pesan_tidak_lulus: html }))}
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
      
      {/* Edit Form Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Edit Status Kelulusan
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Siswa</p>
                <p className="font-semibold text-slate-900 dark:text-white text-lg">{editingStudent.nama}</p>
                <p className="text-xs text-slate-400 font-mono">{editingStudent.no_ujian} / {editingStudent.nisn}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Status Lulus</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                    bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                >
                  <option value="lulus">Lulus</option>
                  <option value="tidak_lulus">Tidak Lulus</option>
                  <option value="ditunda">Ditunda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Catatan Khusus (Opsional)</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Misal: Berkas bermasalah, spp nunggak, dsb."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                    bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={saveStudentStatus}
                disabled={isSavingStatus}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition flex items-center gap-2"
              >
                {isSavingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
