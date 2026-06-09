import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassGroup extends Document {
  name: string; // e.g., "X IPA 1"
  room_name?: string; // e.g., "Ruang 103"
  grade_level: number; // 10, 11, 12
  homeroom_teacher_id: mongoose.Types.ObjectId;
  academic_year_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClassGroupSchema = new Schema<IClassGroup>(
  {
    name: { type: String, required: true },
    room_name: { type: String },
    grade_level: { type: Number, required: true },
    homeroom_teacher_id: { type: Schema.Types.ObjectId, ref: "Teacher" },
    academic_year_id: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
  },
  { timestamps: true }
);

const ClassGroup: Model<IClassGroup> =
  mongoose.models.ClassGroup || mongoose.model<IClassGroup>("ClassGroup", ClassGroupSchema);

export default ClassGroup;
