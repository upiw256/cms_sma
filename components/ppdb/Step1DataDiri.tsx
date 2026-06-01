"use client";

import { useState } from "react";
import { saveStep1 } from "@/actions/ppdb";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  token: string;
  initialData?: Partial<DataDiriState>;
  noPeserta?: string;
  namaFromRegistrant?: string;
  onComplete: () => void;
}

interface DataDiriState {
  nama_lengkap: string;
  nik: string;
  no_peserta: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  agama: string;
  alamat: string;
  rt_rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  no_telp: string;
  email: string;
  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
  no_telp_ortu: string;
}

function Field({
  label,
  id,
  required = false,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 text-sm";

const AGAMA_OPTIONS = ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"];

export function Step1DataDiri({ token, initialData, noPeserta, namaFromRegistrant, onComplete }: Props) {
  const [form, setForm] = useState<DataDiriState>({
    nama_lengkap: initialData?.nama_lengkap || namaFromRegistrant || "",
    nik: initialData?.nik || "",
    no_peserta: initialData?.no_peserta || noPeserta || "",
    tempat_lahir: initialData?.tempat_lahir || "",
    tanggal_lahir: initialData?.tanggal_lahir || "",
    jenis_kelamin: initialData?.jenis_kelamin || "L",
    agama: initialData?.agama || "Islam",
    alamat: initialData?.alamat || "",
    rt_rw: initialData?.rt_rw || "",
    kelurahan: initialData?.kelurahan || "",
    kecamatan: initialData?.kecamatan || "",
    kota: initialData?.kota || "",
    provinsi: initialData?.provinsi || "",
    no_telp: initialData?.no_telp || "",
    email: initialData?.email || "",
    nama_ayah: initialData?.nama_ayah || "",
    nama_ibu: initialData?.nama_ibu || "",
    pekerjaan_ayah: initialData?.pekerjaan_ayah || "",
    pekerjaan_ibu: initialData?.pekerjaan_ibu || "",
    no_telp_ortu: initialData?.no_telp_ortu || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof DataDiriState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const res = await saveStep1(token, form);
      if (res.success) {
        onComplete();
      } else {
        setError(res.message || "Terjadi kesalahan.");
      }
    } catch {
      setError("Terjadi kesalahan server.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Data Pribadi */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          Data Pribadi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nama Lengkap" id="nama_lengkap" required>
            <input id="nama_lengkap" type="text" value={form.nama_lengkap} onChange={(e) => set("nama_lengkap", e.target.value)} required className={inputCls} placeholder="Sesuai ijazah" />
          </Field>
          <Field label="NIK" id="nik" required>
            <input id="nik" type="text" value={form.nik} onChange={(e) => set("nik", e.target.value)} required maxLength={16} className={inputCls} placeholder="16 digit" />
          </Field>
          <Field label="Nomor Peserta PPDB" id="no_peserta" required>
            <input id="no_peserta" type="text" value={form.no_peserta} onChange={(e) => set("no_peserta", e.target.value)} required className={`${inputCls} font-mono`} readOnly />
          </Field>
          <Field label="Jenis Kelamin" id="jenis_kelamin" required>
            <select id="jenis_kelamin" value={form.jenis_kelamin} onChange={(e) => set("jenis_kelamin", e.target.value as "L" | "P")} required className={inputCls}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </Field>
          <Field label="Tempat Lahir" id="tempat_lahir" required>
            <input id="tempat_lahir" type="text" value={form.tempat_lahir} onChange={(e) => set("tempat_lahir", e.target.value)} required className={inputCls} placeholder="Kota tempat lahir" />
          </Field>
          <Field label="Tanggal Lahir" id="tanggal_lahir" required>
            <input id="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={(e) => set("tanggal_lahir", e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Agama" id="agama" required>
            <select id="agama" value={form.agama} onChange={(e) => set("agama", e.target.value)} required className={inputCls}>
              {AGAMA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="No. Telepon Siswa" id="no_telp" required>
            <input id="no_telp" type="tel" value={form.no_telp} onChange={(e) => set("no_telp", e.target.value)} required className={inputCls} placeholder="08xxxxxxxxxx" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Email" id="email">
              <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="email@contoh.com (opsional)" />
            </Field>
          </div>
        </div>
      </div>

      {/* Alamat */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          Alamat Domisili
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Alamat Lengkap" id="alamat" required>
              <textarea id="alamat" value={form.alamat} onChange={(e) => set("alamat", e.target.value)} required rows={2} className={`${inputCls} resize-none`} placeholder="Jl. ..." />
            </Field>
          </div>
          <Field label="RT/RW" id="rt_rw">
            <input id="rt_rw" type="text" value={form.rt_rw} onChange={(e) => set("rt_rw", e.target.value)} className={inputCls} placeholder="001/002" />
          </Field>
          <Field label="Kelurahan/Desa" id="kelurahan">
            <input id="kelurahan" type="text" value={form.kelurahan} onChange={(e) => set("kelurahan", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kecamatan" id="kecamatan">
            <input id="kecamatan" type="text" value={form.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kota/Kabupaten" id="kota">
            <input id="kota" type="text" value={form.kota} onChange={(e) => set("kota", e.target.value)} className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Provinsi" id="provinsi">
              <input id="provinsi" type="text" value={form.provinsi} onChange={(e) => set("provinsi", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* Data Orang Tua */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          Data Orang Tua / Wali
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nama Ayah" id="nama_ayah" required>
            <input id="nama_ayah" type="text" value={form.nama_ayah} onChange={(e) => set("nama_ayah", e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Nama Ibu" id="nama_ibu" required>
            <input id="nama_ibu" type="text" value={form.nama_ibu} onChange={(e) => set("nama_ibu", e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Pekerjaan Ayah" id="pekerjaan_ayah">
            <input id="pekerjaan_ayah" type="text" value={form.pekerjaan_ayah} onChange={(e) => set("pekerjaan_ayah", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Pekerjaan Ibu" id="pekerjaan_ibu">
            <input id="pekerjaan_ibu" type="text" value={form.pekerjaan_ibu} onChange={(e) => set("pekerjaan_ibu", e.target.value)} className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="No. Telepon Orang Tua/Wali" id="no_telp_ortu" required>
              <input id="no_telp_ortu" type="tel" value={form.no_telp_ortu} onChange={(e) => set("no_telp_ortu", e.target.value)} required className={inputCls} placeholder="08xxxxxxxxxx" />
            </Field>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl
          hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSaving ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
        ) : "Simpan & Lanjut ke Upload Berkas →"}
      </button>
    </form>
  );
}
