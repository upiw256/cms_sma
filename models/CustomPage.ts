import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILayoutBlock {
  id: string; // unique string id for drag and drop key (e.g. uuid)
  component_type: string; // e.g., 'text', 'faq', 'image_grid', 'hero', 'banner'
  props_json_string: string; // JSON payload containing data (title, content, url, etc.)
  display_order: number;
}

export interface ICustomPage extends Document {
  title: string;
  slug: string;
  meta_description: string;
  layout_blocks: ILayoutBlock[];
  is_published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LayoutBlockSchema = new Schema<ILayoutBlock>(
  {
    id: { type: String, required: true },
    component_type: { type: String, required: true },
    props_json_string: { type: String, default: "{}" },
    display_order: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomPageSchema = new Schema<ICustomPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    meta_description: { type: String, default: "" },
    layout_blocks: { type: [LayoutBlockSchema], default: [] },
    is_published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CustomPage: Model<ICustomPage> =
  mongoose.models.CustomPage || mongoose.model<ICustomPage>("CustomPage", CustomPageSchema);

export default CustomPage;
