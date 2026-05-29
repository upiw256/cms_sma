import mongoose, { Schema, Document, Model } from "mongoose";

export interface INavigationMenu extends Document {
  title: string;
  path: string;
  icon: string;
  parent_id: mongoose.Types.ObjectId | null;
  allowed_roles: string[];
  is_active: boolean;
  order: number;
}

const NavigationMenuSchema = new Schema<INavigationMenu>(
  {
    title: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String, default: "Circle" },
    parent_id: { type: Schema.Types.ObjectId, ref: "NavigationMenu", default: null },
    allowed_roles: { type: [String], default: ["SUPER_ADMIN"] },
    is_active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const NavigationMenu: Model<INavigationMenu> =
  mongoose.models.NavigationMenu || mongoose.model<INavigationMenu>("NavigationMenu", NavigationMenuSchema);

export default NavigationMenu;
