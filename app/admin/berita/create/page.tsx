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
import { createArticle } from "@/actions/article";

export default function CreateBeritaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    category_type: "berita" | "pengumuman" | "fasilitas";
    image_banner: string;
    content: string;
  }>({
    title: "",
    category_type: "berita",
    image_banner: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Dummy author ID (In real scenario, fetch from NextAuth session)
      const mockSessionUserId = "60c72b2f9b1d8b0015b6d5f7"; 
      
      await createArticle({
        ...formData,
        author_id: mockSessionUserId, // Should use actual objectId from session
      });
      router.push("/berita"); // Redirect to public page to view
    } catch (error) {
      console.error(error);
      alert("Gagal memposting artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Buat Artikel Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Artikel</Label>
          <Input 
            id="title" 
            placeholder="Masukkan judul artikel" 
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
              onValueChange={(val) => setFormData({...formData, category_type: val as "berita" | "pengumuman" | "fasilitas"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="berita">Berita Utama</SelectItem>
                <SelectItem value="pengumuman">Pengumuman</SelectItem>
                <SelectItem value="fasilitas">Fasilitas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_banner">URL Banner (Opsional)</Label>
            <Input 
              id="image_banner" 
              placeholder="https://images.unsplash..." 
              value={formData.image_banner}
              onChange={(e) => setFormData({...formData, image_banner: e.target.value})}
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
        
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Publikasikan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
