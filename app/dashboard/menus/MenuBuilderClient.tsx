"use client";

import { useState, useTransition } from "react";
import { saveNavigationMenu, deleteNavigationMenu, updateMenuOrder } from "@/actions/navigationMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, Edit2, Plus, Loader2, ArrowUp, ArrowDown } from "lucide-react";

export default function MenuBuilderClient({ initialMenus, customPages = [] }: { initialMenus: any[], customPages?: any[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    path: "/",
    icon: "Circle",
    parent_id: "null",
    allowed_roles: "GUEST,STUDENT,TEACHER",
    is_active: true,
    order: 0,
  });

  // Derived tree
  const rootMenus = menus.filter(m => !m.parent_id).sort((a, b) => a.order - b.order);
  const getSubMenus = (parentId: string) => menus.filter(m => m.parent_id === parentId).sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      path: "/",
      icon: "Circle",
      parent_id: "null",
      allowed_roles: "GUEST,STUDENT,TEACHER",
      is_active: true,
      order: 0,
    });
  };

  const handleEdit = (menu: any) => {
    setEditingId(menu._id);
    setFormData({
      title: menu.title,
      path: menu.path,
      icon: menu.icon || "Circle",
      parent_id: menu.parent_id || "null",
      allowed_roles: menu.allowed_roles.join(","),
      is_active: menu.is_active,
      order: menu.order,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus menu ini?")) return;
    startTransition(async () => {
      const res = await deleteNavigationMenu(id);
      if (res.success) {
        setMenus(menus.filter(m => m._id !== id));
      } else {
        alert(res.message);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        _id: editingId || undefined,
        title: formData.title,
        path: formData.path,
        icon: formData.icon,
        parent_id: formData.parent_id === "null" ? null : formData.parent_id,
        allowed_roles: formData.allowed_roles.split(",").map((r: string) => r.trim()).filter(Boolean),
        is_active: formData.is_active,
        order: Number(formData.order),
      };

      const res = await saveNavigationMenu(payload);
      if (res.success) {
        // optimistically reload window instead of complex state sync for tree
        window.location.reload();
      } else {
        alert(res.message);
      }
    });
  };

  const moveOrder = async (menuItem: any, direction: "up" | "down", siblingList: any[]) => {
    const currentIndex = siblingList.findIndex(m => m._id === menuItem._id);
    if (currentIndex < 0) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === siblingList.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newItems = [...siblingList];
    
    // Swap order values
    const tempOrder = newItems[currentIndex].order;
    newItems[currentIndex].order = newItems[swapIndex].order;
    newItems[swapIndex].order = tempOrder;

    // Fix if they were the same order (fallback)
    if (newItems[currentIndex].order === newItems[swapIndex].order) {
       newItems[currentIndex].order = direction === "up" ? tempOrder - 1 : tempOrder + 1;
    }

    startTransition(async () => {
       await updateMenuOrder([
         { _id: newItems[currentIndex]._id, order: newItems[currentIndex].order },
         { _id: newItems[swapIndex]._id, order: newItems[swapIndex].order }
       ]);
       window.location.reload();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List / Tree View */}
      <div className="lg:col-span-2 space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-white/5">
        <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Struktur Menu</h2>
        {rootMenus.length === 0 && <p className="text-sm text-slate-500">Belum ada menu.</p>}
        
        <div className="space-y-3">
          {rootMenus.map((root, i) => (
            <div key={root._id} className="space-y-2">
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveOrder(root, "up", rootMenus)} disabled={i===0} className="disabled:opacity-30 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ArrowUp className="w-3 h-3 text-slate-500" /></button>
                    <button onClick={() => moveOrder(root, "down", rootMenus)} disabled={i===rootMenus.length-1} className="disabled:opacity-30 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ArrowDown className="w-3 h-3 text-slate-500" /></button>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{root.title}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${root.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                      {root.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{root.path} • {root.allowed_roles?.join(", ")}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(root)} className="h-8 dark:border-white/10 dark:text-slate-300">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(root._id)} className="h-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sub Menus */}
              {getSubMenus(root._id).length > 0 && (
                <div className="pl-8 space-y-2 relative before:absolute before:left-[19px] before:top-[-8px] before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                  {getSubMenus(root._id).map((sub, j) => (
                    <div key={sub._id} className="relative flex items-center justify-between bg-slate-100 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                      <div className="absolute left-[-23px] top-1/2 w-[22px] h-[2px] bg-slate-200 dark:bg-slate-700" />
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveOrder(sub, "up", getSubMenus(root._id))} disabled={j===0} className="disabled:opacity-30 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ArrowUp className="w-3 h-3 text-slate-500" /></button>
                          <button onClick={() => moveOrder(sub, "down", getSubMenus(root._id))} disabled={j===getSubMenus(root._id).length-1} className="disabled:opacity-30 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ArrowDown className="w-3 h-3 text-slate-500" /></button>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.title}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${sub.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {sub.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">{sub.path} • Roles: {sub.allowed_roles?.join(", ")}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 relative z-10">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(sub)} className="h-8 dark:border-white/10 dark:text-slate-300">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(sub._id)} className="h-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-xl shadow-sm h-fit sticky top-6">
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
          {editingId ? <><Edit2 className="w-5 h-5 text-blue-500" /> Edit Menu</> : <><Plus className="w-5 h-5 text-emerald-500" /> Tambah Baru</>}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="dark:text-slate-300">Label Text</Label>
            <Input 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Beranda"
              className="dark:bg-slate-800 dark:border-white/10 mt-1"
            />
          </div>

          <div>
            <Label className="dark:text-slate-300">Path URL / Pilih Halaman</Label>
            <Input 
              required 
              list="custom-pages-list"
              value={formData.path}
              onChange={e => setFormData({...formData, path: e.target.value})}
              placeholder="🔍 Ketik path URL..."
              className="dark:bg-slate-800 dark:border-white/10 mt-1"
            />
            <p className="text-[10px] text-slate-500 mt-1">Ketik untuk mencari halaman yang sudah dibuat, atau isi path manual (contoh: /berita).</p>
            {customPages.length > 0 && (
              <datalist id="custom-pages-list">
                <option value="/">Beranda Utama</option>
                {customPages.map(page => (
                  <option key={page._id} value={`/page/${page.slug}`}>
                    Hal: {page.title}
                  </option>
                ))}
              </datalist>
            )}
          </div>

          <div>
            <Label className="dark:text-slate-300">Parent Menu</Label>
            <Select 
              value={formData.parent_id}
              onValueChange={v => setFormData({...formData, parent_id: v})}
            >
              <SelectTrigger className="mt-1 dark:bg-slate-800 dark:border-white/10">
                <SelectValue placeholder="Sebagai Root Menu..." />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-white/10">
                <SelectItem value="null">-- Tidak Ada (Root Menu) --</SelectItem>
                {rootMenus.map(m => (
                  // Prevent circular reference: parent cannot be itself or its current tree (simplified to just self)
                  m._id !== editingId && <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="dark:text-slate-300">Role Akses (Pisahkan koma)</Label>
            <Input 
              required 
              value={formData.allowed_roles}
              onChange={e => setFormData({...formData, allowed_roles: e.target.value})}
              placeholder="GUEST, STUDENT, TEACHER"
              className="dark:bg-slate-800 dark:border-white/10 mt-1 uppercase text-xs"
            />
          </div>

          <div className="flex items-center gap-4 py-2">
            <Label className="dark:text-slate-300 mr-2">Status Aktif</Label>
            <Button
              type="button"
              variant={formData.is_active ? "default" : "secondary"}
              className={formData.is_active ? "bg-emerald-500 hover:bg-emerald-600 dark:text-white" : ""}
              onClick={() => setFormData({...formData, is_active: !formData.is_active})}
            >
              {formData.is_active ? "AKTIF" : "NONAKTIF"}
            </Button>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-white/10">
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 dark:border-white/10 dark:text-slate-300">
                Batal
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1 bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingId ? "Simpan Perubahan" : "Tambahkan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
