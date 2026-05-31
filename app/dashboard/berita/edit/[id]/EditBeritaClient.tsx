"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader from "@/components/ImageUploader";
import { updateArticle } from "@/actions/article";

export default function EditBeritaClient({ article }: { article: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: article.title || "",
    category_type: article.category_type || "berita",
    image_banner: article.image_banner || "",
    content: article.content || "",
    status: article.status || "draft",
    tags: (article.tags || []).join(", "),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tagArray = formData.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t);
      await updateArticle(article._id, {
        ...formData,
        tags: tagArray,
        category_type: formData.category_type as "berita" | "pengumuman" | "fasilitas",
        status: formData.status as "draft" | "published",
      });
      router.push("/dashboard/berita");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Artikel</h1>
        <p className="text-slate-500 mt-1 text-sm">/{article.slug}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Judul Artikel</Label>
          <Input 
            id="edit-title" 
            required 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              value={formData.category_type} 
              onValueChange={(val) => setFormData({...formData, category_type: val})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="berita">Berita Utama</SelectItem>
                <SelectItem value="pengumuman">Pengumuman</SelectItem>
                <SelectItem value="fasilitas">Fasilitas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => setFormData({...formData, status: val})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-tags">Tags (Pisahkan dengan koma)</Label>
            <Input 
              id="edit-tags" 
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g. prestasi, lomba, osis"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Banner Artikel</Label>
            <ImageUploader
              value={formData.image_banner}
              onChange={(url) => setFormData({...formData, image_banner: url})}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Konten Artikel</Label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(html) => setFormData({...formData, content: html})} 
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
