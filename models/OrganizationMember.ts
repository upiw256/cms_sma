import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizationMember extends Document {
  name: string;
  position: string;
  photo?: string;
  parent_id?: mongoose.Types.ObjectId; // For hierarchy
  display_order: number;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    photo: { type: String, default: "" },
    parent_id: { type: Schema.Types.ObjectId, ref: "OrganizationMember", default: null },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const OrganizationMember: Model<IOrganizationMember> =
  mongoose.models.OrganizationMember || mongoose.model<IOrganizationMember>("OrganizationMember", OrganizationMemberSchema);

export default OrganizationMember;
