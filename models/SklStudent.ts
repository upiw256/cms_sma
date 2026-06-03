import mongoose, { Schema, Document, Model } from "mongoose";

export type StatusLulus = "lulus" | "tidak_lulus" | "ditunda";

export interface ISklStudent extends Document {
  no_ujian: string;
  nisn: string;
  nama: string;
  kelas: string;
  status_lulus: StatusLulus;
  catatan?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SklStudentSchema = new Schema<ISklStudent>(
  {
    no_ujian: { type: String, required: true, unique: true, trim: true },
    nisn: { type: String, required: true, trim: true },
    nama: { type: String, required: true, trim: true },
    kelas: { type: String, required: true, trim: true },
    status_lulus: {
      type: String,
      enum: ["lulus", "tidak_lulus", "ditunda"],
      default: "ditunda",
    },
    catatan: { type: String },
  },
  { timestamps: true }
);

SklStudentSchema.index({ no_ujian: 1, nisn: 1 });

const SklStudent: Model<ISklStudent> = 
  mongoose.models.SklStudent || mongoose.model<ISklStudent>("SklStudent", SklStudentSchema);

export default SklStudent;
