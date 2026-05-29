import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDownloadFile extends Document {
  title: string;
  file_url: string;
  category: "materi" | "regulasi" | "formulir";
  target_role: string;
  createdAt: Date;
  updatedAt: Date;
}

const DownloadFileSchema = new Schema<IDownloadFile>(
  {
    title: { type: String, required: true },
    file_url: { type: String, required: true },
    category: { type: String, enum: ["materi", "regulasi", "formulir"], default: "formulir" },
    target_role: { type: String, default: "PUBLIC" },
  },
  { timestamps: true }
);

const DownloadFile: Model<IDownloadFile> =
  mongoose.models.DownloadFile || mongoose.model<IDownloadFile>("DownloadFile", DownloadFileSchema);

export default DownloadFile;
