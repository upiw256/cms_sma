import mongoose, { Schema, Document } from "mongoose";

export interface ILandingSection extends Document {
  section_key: string;
  display_order: number;
  is_visible: boolean;
  custom_title?: string;
  custom_subtitle?: string;
}

const LandingSectionSchema: Schema = new Schema(
  {
    section_key: {
      type: String,
      required: true,
      unique: true,
      enum: ["hero", "sambutan", "stats", "news", "agenda", "alumni"],
    },
    display_order: {
      type: Number,
      required: true,
      default: 0,
    },
    is_visible: {
      type: Boolean,
      required: true,
      default: true,
    },
    custom_title: {
      type: String,
    },
    custom_subtitle: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LandingSection || mongoose.model<ILandingSection>("LandingSection", LandingSectionSchema);
