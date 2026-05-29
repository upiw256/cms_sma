import { getPageById } from "@/actions/customPage";
import PageBuilderClient from "./PageBuilderClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPageById(id);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-6 py-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pages" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Page Builder: {page.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-mono">/page/{page.slug}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden flex">
        <PageBuilderClient pageId={page._id.toString()} initialBlocks={page.layout_blocks || []} />
      </div>
    </div>
  );
}
