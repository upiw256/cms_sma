import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISklSetting extends Document {
  is_published: boolean;
  tanggal_pengumuman: Date;
  pesan_lulus?: string;
  pesan_tidak_lulus?: string;
  kop_surat_base64?: string;
  tanda_tangan_kepsek_base64?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SklSettingSchema = new Schema<ISklSetting>(
  {
    is_published: { type: Boolean, default: false },
    tanggal_pengumuman: { type: Date, required: true },
    pesan_lulus: { type: String },
    pesan_tidak_lulus: { type: String },
    kop_surat_base64: { type: String },
    tanda_tangan_kepsek_base64: { type: String },
  },
  { timestamps: true }
);

const SklSetting: Model<ISklSetting> = 
  mongoose.models.SklSetting || mongoose.model<ISklSetting>("SklSetting", SklSettingSchema);

export default SklSetting;
