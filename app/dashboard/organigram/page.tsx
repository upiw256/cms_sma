"use client";

import { useState, useEffect } from "react";
import { 
  getOrganizationStructure, 
  addOrganizationMember, 
  updateOrganizationMember, 
  deleteOrganizationMember 
} from "@/actions/organization";
import { uploadImageBase64 } from "@/actions/upload";
import { convertToWebP } from "@/lib/image-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ChevronDown, 
  UserPlus, 
  Loader2, 
  ImagePlus,
  ArrowUpRight,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OrganigramPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    photo: "",
    parent_id: null as string | null
  });

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const data = await getOrganizationStructure();
    setMembers(data);
    setLoading(false);
  }

  const handleOpenAdd = (parentId: string | null = null) => {
    setEditingMember(null);
    setFormData({ name: "", position: "", photo: "", parent_id: parentId });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (member: any) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      position: member.position, 
      photo: member.photo, 
      parent_id: member.parent_id 
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const webpBase64 = await convertToWebP(file, 0.7, 500); // Smaller for profile photos
      const res = await uploadImageBase64(webpBase64);
      if (res.success) setFormData(prev => ({ ...prev, photo: res.url! }));
    } catch (err) {
      console.error("Gagal memproses gambar", err);
    }
  };

  const handleSubmit = async () => {
    if (editingMember) {
      await updateOrganizationMember(editingMember._id, formData);
    } else {
      await addOrganizationMember({ ...formData, display_order: members.length });
    }
    setIsDialogOpen(false);
    loadMembers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus anggota ini dan semua bawahannya?")) {
      await deleteOrganizationMember(id);
      loadMembers();
    }
  };

  const buildTree = (parentId: string | null = null) => {
    return members
      .filter(m => m.parent_id === parentId)
      .map(member => (
        <div key={member._id} className="ml-8 mt-4">
          <div className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0">
               {member.photo ? (
                 <img src={member.photo} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">{member.name[0]}</div>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{member.name}</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{member.position}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => handleOpenAdd(member._id)}>
                 <Plus className="w-4 h-4" />
               </Button>
               <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenEdit(member)}>
                 <Edit2 className="w-4 h-4" />
               </Button>
               <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(member._id)}>
                 <Trash2 className="w-4 h-4" />
               </Button>
            </div>
          </div>
          <div className="border-l-2 border-slate-100 dark:border-white/5 ml-6 pl-2">
            {buildTree(member._id)}
          </div>
        </div>
      ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Struktur Organisasi</h1>
          <p className="text-slate-500 mt-1">Susun hierarki kepemimpinan dan staf sekolah.</p>
        </div>
        <Button onClick={() => handleOpenAdd()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20">
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pimpinan Utama
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-8">
           {members.length === 0 ? (
             <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500">Belum ada struktur organisasi. Mulai dengan menambah Pimpinan Utama.</p>
             </div>
           ) : (
             <div className="-ml-8">
               {buildTree(null)}
             </div>
           )}
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Anggota" : "Tambah Anggota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
                   {formData.photo ? (
                     <img src={formData.photo} className="w-full h-full object-cover" />
                   ) : (
                     <ImagePlus className="w-8 h-8 text-slate-300" />
                   )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl text-white text-xs font-bold">
                  Ganti Foto
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Nama beserta gelar" />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} placeholder="Contoh: Kepala Sekolah / Wakasek" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
