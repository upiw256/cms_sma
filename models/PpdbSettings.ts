import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBerkasRequirement {
  id: string; // e.g. "ijazah", "akte_kelahiran"
  label: string; // e.g. "Ijazah / STTB"
  is_required: boolean;
  keterangan?: string; // additional notes for this document
}

export interface IPpdbSettings extends Document {
  // Session control
  is_open: boolean; // whether daftar ulang is currently open
  tanggal_buka: Date;
  tanggal_tutup: Date;

  // Quota
  kuota_total: number;
  kuota_per_kelas?: { nama_kelas: string; kuota: number }[];

  // Document requirements
  syarat_berkas: IBerkasRequirement[];

  // Info text
  pengumuman_info?: string; // HTML content / markdown for the public info page

  // Contact
  contact_info?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PpdbSettingsSchema = new Schema<IPpdbSettings>(
  {
    is_open: { type: Boolean, default: false },
    tanggal_buka: { type: Date, required: true },
    tanggal_tutup: { type: Date, required: true },
    kuota_total: { type: Number, default: 0 },
    kuota_per_kelas: [
      {
        nama_kelas: String,
        kuota: Number,
        _id: false,
      },
    ],
    syarat_berkas: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        is_required: { type: Boolean, default: true },
        keterangan: { type: String },
        _id: false,
      },
    ],
    pengumuman_info: { type: String },
    contact_info: { type: String },
  },
  { timestamps: true }
);

const PpdbSettings: Model<IPpdbSettings> =
  mongoose.models.PpdbSettings ||
  mongoose.model<IPpdbSettings>("PpdbSettings", PpdbSettingsSchema);

export default PpdbSettings;
