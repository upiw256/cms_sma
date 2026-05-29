import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPiketPermit extends Document {
  student_id: mongoose.Types.ObjectId;
  permit_type: "KELUAR" | "MASUK" | "DISPENSASI";
  reason: string;
  printed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PiketPermitSchema = new Schema<IPiketPermit>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    permit_type: { type: String, enum: ["KELUAR", "MASUK", "DISPENSASI"], required: true },
    reason: { type: String, required: true },
    printed_at: { type: Date },
  },
  { timestamps: true }
);

const PiketPermit: Model<IPiketPermit> =
  mongoose.models.PiketPermit || mongoose.model<IPiketPermit>("PiketPermit", PiketPermitSchema);

export default PiketPermit;
