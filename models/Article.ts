import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  image_banner?: string;
  author_id: mongoose.Types.ObjectId;
  published_at: Date;
  category_type: "berita" | "pengumuman" | "fasilitas";
  status: "draft" | "published";
  tags: string[];
  seo_meta: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image_banner: { type: String },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    published_at: { type: Date, default: Date.now },
    category_type: { 
      type: String, 
      enum: ["berita", "pengumuman", "fasilitas"], 
      default: "berita" 
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    tags: { type: [String], default: [] },
    seo_meta: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String] },
    },
  },
  { timestamps: true }
);

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
