import mongoose, { Schema, Document, Model } from "mongoose";

export type PpdbStatus =
  | "diterima"
  | "daftar_ulang"
  | "terverifikasi"
  | "ditolak";

export interface IPpdbRegistrant extends Document {
  no_peserta: string;
  nama: string;
  tanggal_lahir: Date;
  jenis_kelamin: "L" | "P";
  asal_sekolah: string;
  pilihan_kelas?: string; // jurusan / kelas yang dipilih
  jalur_daftar?: string;
  token_daftar_ulang: string; // auto-generated unique token
  status: PpdbStatus;
  catatan_admin?: string;
  submission_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PpdbRegistrantSchema = new Schema<IPpdbRegistrant>(
  {
    no_peserta: { type: String, required: true, unique: true, trim: true },
    nama: { type: String, required: true, trim: true },
    tanggal_lahir: { type: Date, required: true },
    jenis_kelamin: { type: String, enum: ["L", "P"], default: "L" },
    asal_sekolah: { type: String, required: true, trim: true },
    pilihan_kelas: { type: String, trim: true },
    jalur_daftar: { type: String, trim: true },
    token_daftar_ulang: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["diterima", "daftar_ulang", "terverifikasi", "ditolak"],
      default: "diterima",
    },
    catatan_admin: { type: String },
    submission_id: { type: Schema.Types.ObjectId, ref: "PpdbSubmission" },
  },
  { timestamps: true }
);

// Index for fast lookup by token
PpdbRegistrantSchema.index({ token_daftar_ulang: 1 });
PpdbRegistrantSchema.index({ no_peserta: 1, tanggal_lahir: 1 });

const PpdbRegistrant: Model<IPpdbRegistrant> =
  mongoose.models.PpdbRegistrant ||
  mongoose.model<IPpdbRegistrant>("PpdbRegistrant", PpdbRegistrantSchema);

export default PpdbRegistrant;
