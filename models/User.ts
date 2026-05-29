import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  nip_nisn?: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    nip_nisn: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for OAuth users
    roles: { type: [String], default: ["STUDENT"] },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
