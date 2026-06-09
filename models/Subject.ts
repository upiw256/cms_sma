import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code: string;
  phase: "E" | "F" | "Umum";
  subject_type: "Wajib" | "Pilihan" | "Muatan Lokal" | "Kelompok_IPA" | "Kelompok_IPS" | "Prakarya";
  jp_per_week: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    phase: { type: String, enum: ["E", "F", "Umum"], default: "Umum" },
    subject_type: {
      type: String,
      enum: ["Wajib", "Pilihan", "Muatan Lokal", "Kelompok_IPA", "Kelompok_IPS", "Prakarya"],
      default: "Wajib",
    },
    jp_per_week: { type: Number, default: 2 },
  },
  { timestamps: true }
);

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
