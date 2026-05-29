import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgenda extends Document {
  title: string;
  event_date: Date;
  location: string;
  description: string;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgendaSchema = new Schema<IAgenda>(
  {
    title: { type: String, required: true },
    event_date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String },
    is_public: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Agenda: Model<IAgenda> =
  mongoose.models.Agenda || mongoose.model<IAgenda>("Agenda", AgendaSchema);

export default Agenda;
