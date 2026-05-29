import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlumniTracer extends Document {
  name: string;
  graduation_year: number;
  current_activity: string;
  testimonial: string;
  photo_url?: string;
}

const AlumniTracerSchema = new Schema<IAlumniTracer>(
  {
    name: { type: String, required: true },
    graduation_year: { type: Number, required: true },
    current_activity: { type: String, required: true }, // Kuliah / Bekerja / Usaha
    testimonial: { type: String, required: true },
    photo_url: { type: String },
  },
  { timestamps: true }
);

const AlumniTracer: Model<IAlumniTracer> =
  mongoose.models.AlumniTracer || mongoose.model<IAlumniTracer>("AlumniTracer", AlumniTracerSchema);

export default AlumniTracer;
