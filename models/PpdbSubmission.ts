import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStepDataDiri {
  nama_lengkap: string;
  nik: string;
  no_peserta: string;
  tempat_lahir: string;
  tanggal_lahir: string; // ISO string
  jenis_kelamin: "L" | "P";
  agama: string;
  alamat: string;
  rt_rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  no_telp: string;
  email?: string;
  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah?: string;
  pekerjaan_ibu?: string;
  no_telp_ortu: string;
}

export interface IStepBerkas {
  ijazah_url?: string;
  skhun_url?: string; // Surat Keterangan Hasil Ujian Nasional
  akte_kelahiran_url?: string;
  kartu_keluarga_url?: string;
  pas_foto_url?: string;
  surat_domisili_url?: string;
  kartu_prestasi_url?: string; // opsional
}

export interface IPpdbSubmission extends Document {
  registrant_id: mongoose.Types.ObjectId;
  step_data_diri?: IStepDataDiri;
  step_berkas?: IStepBerkas;
  step_pernyataan?: boolean; // true = sudah menyetujui pernyataan
  current_step: 1 | 2 | 3;
  is_submitted: boolean;
  submitted_at?: Date;
  verified_by?: mongoose.Types.ObjectId; // admin user ID
  verified_at?: Date;
  catatan_verifikasi?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StepDataDiriSchema = new Schema<IStepDataDiri>(
  {
    nama_lengkap: String,
    nik: String,
    no_peserta: String,
    tempat_lahir: String,
    tanggal_lahir: String,
    jenis_kelamin: { type: String, enum: ["L", "P"] },
    agama: String,
    alamat: String,
    rt_rw: String,
    kelurahan: String,
    kecamatan: String,
    kota: String,
    provinsi: String,
    no_telp: String,
    email: String,
    nama_ayah: String,
    nama_ibu: String,
    pekerjaan_ayah: String,
    pekerjaan_ibu: String,
    no_telp_ortu: String,
  },
  { _id: false }
);

const StepBerkasSchema = new Schema<IStepBerkas>(
  {
    ijazah_url: String,
    skhun_url: String,
    akte_kelahiran_url: String,
    kartu_keluarga_url: String,
    pas_foto_url: String,
    surat_domisili_url: String,
    kartu_prestasi_url: String,
  },
  { _id: false }
);

const PpdbSubmissionSchema = new Schema<IPpdbSubmission>(
  {
    registrant_id: {
      type: Schema.Types.ObjectId,
      ref: "PpdbRegistrant",
      required: true,
      unique: true,
    },
    step_data_diri: { type: StepDataDiriSchema },
    step_berkas: { type: StepBerkasSchema },
    step_pernyataan: { type: Boolean, default: false },
    current_step: { type: Number, enum: [1, 2, 3], default: 1 },
    is_submitted: { type: Boolean, default: false },
    submitted_at: { type: Date },
    verified_by: { type: Schema.Types.ObjectId, ref: "User" },
    verified_at: { type: Date },
    catatan_verifikasi: { type: String },
  },
  { timestamps: true }
);

const PpdbSubmission: Model<IPpdbSubmission> =
  mongoose.models.PpdbSubmission ||
  mongoose.model<IPpdbSubmission>("PpdbSubmission", PpdbSubmissionSchema);

export default PpdbSubmission;
