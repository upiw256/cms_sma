import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  user_id: mongoose.Types.ObjectId; // Link to User model
  class_id?: mongoose.Types.ObjectId; // Link to ClassGroup model
  birth_date?: Date;
  gender: "L" | "P";
  address?: string;
  parent_info: {
    father_name?: string;
    mother_name?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    class_id: { type: Schema.Types.ObjectId, ref: "ClassGroup" },
    birth_date: { type: Date },
    gender: { type: String, enum: ["L", "P"], default: "L" },
    address: { type: String },
    parent_info: {
      father_name: { type: String },
      mother_name: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
