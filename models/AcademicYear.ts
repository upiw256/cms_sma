import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAcademicYear extends Document {
  name: string; // e.g., "2026/2027 Ganjil"
  is_active: boolean;
  start_date: Date;
  end_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>(
  {
    name: { type: String, required: true },
    is_active: { type: Boolean, default: false },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
  },
  { timestamps: true }
);

// Middleware to ensure only one active academic year
AcademicYearSchema.pre('save', async function () {
  if (this.is_active) {
    await mongoose.model('AcademicYear').updateMany({ _id: { $ne: this._id } }, { is_active: false });
  }
});

const AcademicYear: Model<IAcademicYear> =
  mongoose.models.AcademicYear || mongoose.model<IAcademicYear>("AcademicYear", AcademicYearSchema);

export default AcademicYear;
