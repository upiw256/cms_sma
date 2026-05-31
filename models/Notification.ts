import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient_roles: string[];
  recipient_user_id?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient_roles: { type: [String], default: [] },
    recipient_user_id: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
