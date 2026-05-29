import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  student_id: mongoose.Types.ObjectId;
  date: Date;
  status: "HADIR" | "IZIN" | "SAKIT" | "ALFA";
  scanned_by: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["HADIR", "IZIN", "SAKIT", "ALFA"], default: "HADIR" },
    scanned_by: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index: satu siswa hanya boleh satu record per hari
AttendanceSchema.index({ student_id: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
