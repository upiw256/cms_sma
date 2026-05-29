import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrade extends Document {
  student_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  academic_year_id: mongoose.Types.ObjectId;
  tugas: number;
  uts: number;
  uas: number;
  final_score: number;
  grade_letter: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    subject_id: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    class_id: { type: Schema.Types.ObjectId, ref: "ClassGroup", required: true },
    academic_year_id: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    tugas: { type: Number, default: 0, min: 0, max: 100 },
    uts: { type: Number, default: 0, min: 0, max: 100 },
    uas: { type: Number, default: 0, min: 0, max: 100 },
    final_score: { type: Number, default: 0, min: 0, max: 100 },
    grade_letter: { type: String, default: "E" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index to ensure one grade record per student per subject per class per academic year
GradeSchema.index({ student_id: 1, subject_id: 1, class_id: 1, academic_year_id: 1 }, { unique: true });

const Grade: Model<IGrade> = mongoose.models.Grade || mongoose.model<IGrade>("Grade", GradeSchema);

export default Grade;
