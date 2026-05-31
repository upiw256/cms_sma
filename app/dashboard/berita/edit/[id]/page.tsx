import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { notFound } from "next/navigation";
import EditBeritaClient from "./EditBeritaClient";

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  
  const article = await Article.findById(id).lean();
  if (!article) notFound();

  return <EditBeritaClient article={JSON.parse(JSON.stringify(article))} />;
}
