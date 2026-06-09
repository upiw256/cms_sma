"use client";

import { showToast, showAlert, showConfirm } from "@/lib/swal";
import { useState, useTransition } from "react";
import { createPage, deletePage, updatePageData } from "@/actions/customPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Trash2, Edit2, Loader2, PenTool } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function PagesListClient({ initialPages }: { initialPages: any[] }) {
  const [pages, setPages] = useState(initialPages);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", slug: "", meta_description: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const slugFormat = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const res = await createPage({ ...formData, slug: slugFormat });
      if (res.success) {
        setIsOpen(false);
        window.location.reload();
      } else {
        showAlert({ text: res.message, icon: "error" });
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!(await showConfirm("Hapus halaman permanen?"))) return;
    startTransition(async () => {
      const res = await deletePage(id);
      if(res.success) window.location.reload();
      else showAlert({ text: res.message, icon: "error" });
    });
  };

  const togglePublish = (page: any) => {
    startTransition(async () => {
      await updatePageData(page._id, { is_published: !page.is_published });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="dark:bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Buat Halaman Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 flex flex-col mt-4">
            <div>
              <Label>Judul Halaman</Label>
              <Input required value={formData.title} onChange={e => {
                setFormData(prev => ({
                  ...prev, 
                  title: e.target.value,
                  slug: prev.slug === "" ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
                }))
              }} placeholder="Contoh: Fasilitas Sekolah"/>
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}/>
            </div>
            <div>
              <Label>Meta Description</Label>
              <Input value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})}/>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="w-4 animate-spin"/> : "Buat"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Button onClick={() => {
        setFormData({ title: "", slug: "", meta_description: "" });
        setIsOpen(true);
      }} className="mb-4">Buat Halaman Baru</Button>

      {pages.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada custom page.</div>}

      <div className="grid gap-3">
        {pages.map((p) => (
          <div key={p._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/pages/builder/${p._id}`} className="font-bold text-lg hover:text-blue-600 transition-colors">{p.title}</Link>
                <div onClick={() => togglePublish(p)} className={`cursor-pointer px-2 py-0.5 text-xs rounded-full ${p.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                  {p.is_published ? "Published" : "Draft"}  
                </div>
              </div>
              <div className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">/page/{p.slug}</div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Link href={`/dashboard/pages/builder/${p._id}`} className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-medium text-white shadow-sm hover:opacity-90 transition-opacity">
                  <PenTool className="w-4 h-4 mr-2" />
                  Visual Builder
              </Link>
              <Link href={`/page/${p.slug}`} target="_blank" className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">View</Link>
              <Button onClick={() => handleDelete(p._id)} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
