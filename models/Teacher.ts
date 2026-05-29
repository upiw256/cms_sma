import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  user_id: mongoose.Types.ObjectId; // Link to User model
  subject_id: mongoose.Types.ObjectId; // Link to Subject model
  employment_status: "PNS" | "PPPK" | "Honorer";
  current_iki_reports: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    subject_id: { type: Schema.Types.ObjectId, ref: "Subject" },
    employment_status: { type: String, enum: ["PNS", "PPPK", "Honorer"], default: "PNS" },
    current_iki_reports: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
