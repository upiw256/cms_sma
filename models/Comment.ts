import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  article_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  content: string;
  is_approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    article_id: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    is_approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
