import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISchoolConfig extends Document {
  npsn: string;
  name: string;
  headmaster_name: string;
  headmaster_photo: string;
  headmaster_greeting: string;
  branding_logo: string;
  favicon: string;
  primary_color: string;
  secondary_color: string;
  active_academic_year_id?: mongoose.Types.ObjectId;
  contact_info: {
    address: string;
    phone: string;
    email: string;
  };
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  landing_bg_type: string; // "default" | "solid" | "gradient"
  landing_bg_color: string;
  landing_bg_gradient: {
    from: string;
    via: string;
    to: string;
    direction: string; // e.g. "135deg", "to bottom right"
  };
}

const SchoolConfigSchema = new Schema<ISchoolConfig>(
  {
    npsn: { type: String, required: true },
    name: { type: String, required: true },
    headmaster_name: { type: String, required: true },
    headmaster_photo: { type: String, default: "" },
    headmaster_greeting: { type: String, default: "" },
    branding_logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    primary_color: { type: String, default: "#3b82f6" },
    secondary_color: { type: String, default: "#1d4ed8" },
    active_academic_year_id: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    contact_info: {
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    social_media: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
    },
    landing_bg_type: { type: String, default: "default" },
    landing_bg_color: { type: String, default: "#0f172a" },
    landing_bg_gradient: {
      from: { type: String, default: "#0f172a" },
      via: { type: String, default: "#1e3a5f" },
      to: { type: String, default: "#1e293b" },
      direction: { type: String, default: "135deg" },
    },
  },
  { timestamps: true }
);

const SchoolConfig: Model<ISchoolConfig> =
  mongoose.models.SchoolConfig || mongoose.model<ISchoolConfig>("SchoolConfig", SchoolConfigSchema);

export default SchoolConfig;
