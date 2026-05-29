"use client";

import React, { useState, useTransition } from "react";
import { savePageBlocks } from "@/actions/customPage";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Save, Loader2, GripVertical, Trash2, Type, Image as ImageIcon, LayoutGrid, HelpCircle, PlaySquare, Images, Megaphone, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadImageBase64 } from "@/actions/upload";

const TextareaClassName = "flex min-h-[80px] w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

const AVAILABLE_BLOCKS = [
  { type: "text", icon: <Type className="w-4 h-4"/>, label: "Rich Text", defaultProps: { content: "Masukkan konten teks di sini..." } },
  { type: "hero", icon: <ImageIcon className="w-4 h-4"/>, label: "Hero Banner", defaultProps: { title: "Judul Hero", subtitle: "Subjudul banner", imageUrl: "" } },
  { type: "grid", icon: <LayoutGrid className="w-4 h-4"/>, label: "Card Grid", defaultProps: { columns: 3, items: [] } },
  { type: "faq", icon: <HelpCircle className="w-4 h-4"/>, label: "FAQ / Accordion", defaultProps: { items: [] } },
  { type: "image", icon: <ImageIcon className="w-4 h-4"/>, label: "Gambar Tunggal", defaultProps: { imageUrl: "", caption: "", alignment: "center" } },
  { type: "video", icon: <PlaySquare className="w-4 h-4"/>, label: "Video Embed", defaultProps: { youtubeUrl: "", title: "" } },
  { type: "gallery", icon: <Images className="w-4 h-4"/>, label: "Galeri Foto", defaultProps: { columns: 3, images: [] } },
  { type: "cta", icon: <Megaphone className="w-4 h-4"/>, label: "Call to Action", defaultProps: { title: "Daftar Sekarang", description: "Mari bergabung bersama kami.", buttonText: "Daftar", buttonUrl: "#" } },
  { type: "divider", icon: <Minus className="w-4 h-4"/>, label: "Pemisah / Spacer", defaultProps: { style: "solid", spacing: "medium" } }
];

function SidebarDraggableItem({ ab }: { ab: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${ab.type}`,
    data: { isSidebarItem: true, ...ab }
  });

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 text-left w-full rounded-lg bg-white dark:bg-slate-800 border transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 border-blue-500 shadow-md' : 'border-slate-200 dark:border-white/10 hover:border-blue-400 hover:shadow-sm'}`}
    >
      <div className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-md">
        {ab.icon}
      </div>
      <span className="font-semibold text-sm">{ab.label}</span>
      <GripVertical className="w-4 h-4 ml-auto text-slate-400"/>
    </div>
  );
}

function SortableBlockItem({ id, block, onSelect, onRemove, isActive }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} 
         className={`relative group bg-white dark:bg-slate-800 border rounded-lg p-3 flex gap-3 items-start transition-all
         ${isActive ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
         onClick={() => onSelect(block)}
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden pointer-events-none">
        <h4 className="font-semibold text-sm uppercase text-slate-700 dark:text-slate-200">{block.component_type} Block</h4>
        <div className="text-xs text-slate-500 font-mono truncate mt-1">{block.props_json_string}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(block.id); }} className="text-red-500 opacity-0 group-hover:opacity-100 h-8 px-2 transition-opacity relative z-10">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CanvasDroppableArea({ children, isEmpty }: { children: React.ReactNode, isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-area",
  });

  return (
    <div ref={setNodeRef} className={`space-y-3 min-h-[400px] p-4 rounded-xl transition-colors border-2 ${isEmpty ? 'border-dashed border-slate-300 dark:border-white/10' : 'border-transparent'} ${isOver ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500' : ''}`}>
      {children}
    </div>
  );
}

function PropertyEditor({ block, onChange }: { block: any, onChange: (val: string) => void }) {
  const [isUploading, setIsUploading] = React.useState(false);

  const propsObj = React.useMemo(() => {
    try { return JSON.parse(block.props_json_string || "{}"); } catch(e) { return {}; }
  }, [block.props_json_string]);

  const updateField = (k: string, v: any) => {
    onChange(JSON.stringify({ ...propsObj, [k]: v }));
  };

  const doUpload = async (file: File, onSuccess: (url: string) => void) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new window.Image();
        img.onload = async function() {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX = 1920;
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.floor((height * MAX) / width);
              width = MAX;
            } else {
              width = Math.floor((width * MAX) / height);
              height = MAX;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const webpBase64 = canvas.toDataURL("image/webp", 0.85);
          
          const res = await uploadImageBase64(webpBase64);
          if (res.success && res.url) {
            onSuccess(res.url);
          } else {
            alert(res.message || "Gagal mengupload gambar.");
          }
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, objectKeyToUpdate: string) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file, (url) => updateField(objectKeyToUpdate, url));
  };
  
  const handleArrayFileUpload = (e: React.ChangeEvent<HTMLInputElement>, arrKey: string, idx: number, itemKey: string) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file, (url) => updateArrayField(arrKey, idx, itemKey, url));
  };

  const updateArrayField = (arrKey: string, idx: number, itemKey: string, v: any) => {
    const list = [...(propsObj[arrKey] || [])];
    list[idx] = { ...list[idx], [itemKey]: v };
    updateField(arrKey, list);
  };
  const addArrayItem = (arrKey: string, defItem: any) => {
    const list = [...(propsObj[arrKey] || []), defItem];
    updateField(arrKey, list);
  };
  const removeArrayItem = (arrKey: string, idx: number) => {
    const list = [...(propsObj[arrKey] || [])];
    list.splice(idx, 1);
    updateField(arrKey, list);
  };

  if (block.component_type === "text") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block">Konten Teks (HTML diizinkan)</Label>
          <textarea 
             className={TextareaClassName + " min-h-[250px]"}
             value={propsObj.content || ""} 
             onChange={e => updateField("content", e.target.value)} 
             placeholder="Tuliskan konten teks Anda di sini..."
          />
        </div>
      </div>
    );
  }

  if (block.component_type === "hero") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Judul Banner</Label>
          <Input value={propsObj.title || ""} onChange={e => updateField("title", e.target.value)} placeholder="Judul besar banner" />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">Sub Judul</Label>
          <textarea className={TextareaClassName} value={propsObj.subtitle || ""} onChange={e => updateField("subtitle", e.target.value)} placeholder="Teks deskripsi singkat..." />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">URL / Upload Gambar Latar Belakang</Label>
          <div className="flex gap-2">
            <Input className="flex-1" value={propsObj.imageUrl || ""} onChange={e => updateField("imageUrl", e.target.value)} placeholder="https://... atau klik Upload" />
            <div className="relative">
              <Button type="button" variant="outline" disabled={isUploading} className="relative z-10 pointer-events-none">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <ImageIcon className="w-4 h-4 mr-2"/>} Upload
              </Button>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full"
                title="Pilih Gambar dari Komputer"
                onChange={e => handleFileUpload(e, "imageUrl")}
              />
            </div>
          </div>
          {propsObj.imageUrl && <div className="mt-2 text-[10px] text-green-600 font-semibold truncate">Tersimpan: {propsObj.imageUrl}</div>}
        </div>
      </div>
    );
  }

  if (block.component_type === "grid") {
    const items = propsObj.items || [];
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Jumlah Kolom Tampilan</Label>
          <Input type="number" min="1" max="4" value={propsObj.columns || 3} onChange={e => updateField("columns", parseInt(e.target.value)||3)} />
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
          <Label className="mb-2 block font-semibold">Daftar Card</Label>
          {items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 dark:border-white/10 rounded-md mb-3 bg-white dark:bg-slate-900 relative shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem("items", idx)} className="absolute top-2 right-2 text-red-500 h-6 w-6 p-0 rounded bg-red-50 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20"><Trash2 className="w-3.5 h-3.5"/></Button>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Judul Card</Label>
              <Input className="mb-3 text-sm h-8" value={item.title || ""} onChange={e => updateArrayField("items", idx, "title", e.target.value)} placeholder="Judul" />
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Deskripsi Singkat</Label>
              <textarea className={`${TextareaClassName} text-sm min-h-[60px]`} value={item.desc || ""} onChange={e => updateArrayField("items", idx, "desc", e.target.value)} placeholder="Deskripsi pendek" />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-dashed border-2" onClick={() => addArrayItem("items", { title: "Title Card", desc: "Deskripsi card" })}>+ Tambah Card</Button>
        </div>
      </div>
    );
  }

  if (block.component_type === "faq") {
    const items = propsObj.items || [];
    return (
      <div className="space-y-4 text-sm mt-4">
        <div className="pt-2">
          <Label className="mb-2 block font-semibold">Daftar Pertanyaan</Label>
          {items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 dark:border-white/10 rounded-md mb-3 bg-white dark:bg-slate-900 relative shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem("items", idx)} className="absolute top-2 right-2 text-red-500 h-6 w-6 p-0 rounded bg-red-50 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20"><Trash2 className="w-3.5 h-3.5"/></Button>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Pertanyaan</Label>
              <Input className="mb-3 text-sm h-8" value={item.question || ""} onChange={e => updateArrayField("items", idx, "question", e.target.value)} placeholder="Apa itu..." />
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Jawaban</Label>
              <textarea className={`${TextareaClassName} text-sm min-h-[60px]`} value={item.answer || ""} onChange={e => updateArrayField("items", idx, "answer", e.target.value)} placeholder="Jawaban dari pertanyaan" />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-dashed border-2" onClick={() => addArrayItem("items", { question: "Pertanyaan Baru?", answer: "Jawaban pertanyaan." })}>+ Tambah Pertanyaan</Button>
        </div>
      </div>
    );
  }

  if (block.component_type === "image") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Tautan / Upload Gambar</Label>
          <div className="flex gap-2">
            <Input className="flex-1" value={propsObj.imageUrl || ""} onChange={e => updateField("imageUrl", e.target.value)} placeholder="https://..." />
            <div className="relative">
              <Button type="button" variant="outline" disabled={isUploading} className="relative z-10 pointer-events-none">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <ImageIcon className="w-4 h-4 mr-2"/>}
              </Button>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full z-20" onChange={e => handleFileUpload(e, "imageUrl")} />
            </div>
          </div>
        </div>
        <div>
          <Label className="mb-2 block font-semibold">Keterangan (Caption)</Label>
          <Input value={propsObj.caption || ""} onChange={e => updateField("caption", e.target.value)} placeholder="Gambar kegiatan siswa..." />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">Perataan (Alignment)</Label>
          <select 
            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-1 text-sm shadow-sm"
            value={propsObj.alignment || "center"} onChange={e => updateField("alignment", e.target.value)}
          >
            <option value="left" className="text-black">Kiri</option>
            <option value="center" className="text-black">Tengah</option>
            <option value="right" className="text-black">Kanan</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.component_type === "gallery") {
    const images = propsObj.images || [];
    // Re-use file upload to push arrays but it's complex, we'll just provide inputs. If they want to upload, they can use a temporary block or we let them paste URL.
    // For simplicity, we just provide text inputs. If we want upload, they upload locally somewhere then paste. BUT wait, let's just make it simple: array of urls.
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Jumlah Kolom Galeri</Label>
          <Input type="number" min="2" max="6" value={propsObj.columns || 3} onChange={e => updateField("columns", parseInt(e.target.value)||3)} />
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
          <Label className="mb-2 block font-semibold">Daftar Foto</Label>
          {images.map((img: any, idx: number) => (
            <div key={idx} className="p-3 border rounded-md mb-3 bg-white dark:bg-slate-900 relative shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem("images", idx)} className="absolute top-2 right-2 text-red-500 h-6 w-6 p-0 rounded bg-red-50 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/></Button>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Tautan / Upload Gambar</Label>
              <div className="flex gap-2 mb-2">
                <Input className="text-sm h-8 flex-1" value={img.url || ""} onChange={e => updateArrayField("images", idx, "url", e.target.value)} placeholder="https://..." />
                <div className="relative">
                  <Button type="button" variant="outline" size="sm" disabled={isUploading} className="h-8 px-2 relative z-10 pointer-events-none">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <ImageIcon className="w-3.5 h-3.5"/>}
                  </Button>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full z-20" onChange={e => handleArrayFileUpload(e, "images", idx, "url")} title="Upload Foto" />
                </div>
              </div>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">Caption Singkat</Label>
              <Input className="text-sm h-8" value={img.caption || ""} onChange={e => updateArrayField("images", idx, "caption", e.target.value)} placeholder="Caption..." />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-dashed border-2" onClick={() => addArrayItem("images", { url: "", caption: "Foto" })}>+ Tambah Foto</Button>
        </div>
      </div>
    );
  }

  if (block.component_type === "video") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">URL Video YouTube</Label>
          <Input value={propsObj.youtubeUrl || ""} onChange={e => updateField("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          <p className="text-[10px] text-slate-500 mt-1">Gunakan link penuh youtube atau youtube.com/embed/...</p>
        </div>
      </div>
    );
  }

  if (block.component_type === "cta") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Judul CTA</Label>
          <Input value={propsObj.title || ""} onChange={e => updateField("title", e.target.value)} placeholder="Ayo Bergabung..." />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">Deskripsi</Label>
          <textarea className={TextareaClassName} value={propsObj.description || ""} onChange={e => updateField("description", e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="mb-2 block font-semibold">Label Tombol</Label>
            <Input value={propsObj.buttonText || ""} onChange={e => updateField("buttonText", e.target.value)} placeholder="Klik Di Sini" />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block font-semibold">Tautan Tombol</Label>
            <Input value={propsObj.buttonUrl || ""} onChange={e => updateField("buttonUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>
    );
  }

  if (block.component_type === "divider") {
    return (
      <div className="space-y-4 text-sm mt-4">
        <div>
          <Label className="mb-2 block font-semibold">Gaya Pemisah</Label>
          <select 
            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-1 text-sm shadow-sm"
            value={propsObj.style || "solid"} onChange={e => updateField("style", e.target.value)}
          >
            <option value="solid" className="text-black">Garis Tipis (Solid)</option>
            <option value="dashed" className="text-black">Garis Putus (Dashed)</option>
            <option value="transparent" className="text-black">Ruang Kosong Saja (Spacer)</option>
          </select>
        </div>
        <div>
          <Label className="mb-2 block font-semibold">Ukuran Jarak Belakang</Label>
          <select 
            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-1 text-sm shadow-sm"
            value={propsObj.spacing || "medium"} onChange={e => updateField("spacing", e.target.value)}
          >
            <option value="small" className="text-black">Kecil</option>
            <option value="medium" className="text-black">Sedang</option>
            <option value="large" className="text-black">Besar</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm mt-4">
      <Label className="text-xs text-slate-500 mb-2 block">Data Mentah JSON (Tipe tidak dikenal)</Label>
      <textarea
        className="w-full h-40 p-3 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-slate-700 dark:text-green-400"
        value={block.props_json_string}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

export default function PageBuilderClient({ pageId, initialBlocks }: { pageId: string, initialBlocks: any[] }) {
  const [blocks, setBlocks] = useState<any[]>(
    initialBlocks.sort((a,b) => (a.display_order || 0) - (b.display_order || 0)).map(b => ({...b, id: b.id || Math.random().toString(36).substr(2, 9)}))
  );
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeBlock = blocks.find(b => b.id === activeBlockId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over } = event;
    
    if (!over) {
      return; 
    }

    if (active.data.current?.isSidebarItem) {
      const newBlock = {
        id: Math.random().toString(36).substr(2, 9),
        component_type: active.data.current.type,
        props_json_string: JSON.stringify(active.data.current.defaultProps),
        display_order: blocks.length
      };

      if (over.id === "canvas-area") {
        setBlocks([...blocks, newBlock]);
      } else {
        const overIndex = blocks.findIndex(t => t.id === over.id);
        if (overIndex >= 0) {
          const newBlocks = [...blocks];
          newBlocks.splice(overIndex + 1, 0, newBlock); // Insert after the hovered item
          setBlocks(newBlocks);
        } else {
          setBlocks([...blocks, newBlock]);
        }
      }
      setActiveBlockId(newBlock.id);
      return;
    }

    if (active.id !== over.id && over.id !== "canvas-area") {
      setBlocks((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateBlockProps = (jsonStr: string) => {
    if (!activeBlockId) return;
    setBlocks(blocks.map(b => b.id === activeBlockId ? { ...b, props_json_string: jsonStr } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const finalBlocks = blocks.map((b, idx) => ({ ...b, display_order: idx }));
      const res = await savePageBlocks(pageId, finalBlocks);
      if(res.success) {
        alert("Kanvas berhasil disimpan!");
      } else {
        alert("Gagal: " + res.message);
      }
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex w-full h-full">
        {/* LEFT SIDEBAR: Available Blocks */}
        <div className="w-64 border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 p-4 shrink-0 overflow-y-auto">
          <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider mb-4">Blok Komponen</h3>
          <p className="text-xs text-slate-400 mb-4">Tarik (drag) item di bawah ini ke area kanvas untuk menambah blok baru.</p>
          <div className="flex flex-col gap-2">
            {AVAILABLE_BLOCKS.map(ab => (
              <SidebarDraggableItem key={ab.type} ab={ab} />
            ))}
          </div>
        </div>

        {/* CENTER: Canvas Sortable items */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/50 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Canvas Layout</h2>
              <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 w-32 shadow-md hover:shadow-lg transition-all">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4 mr-2"/> Simpan</>}
              </Button>
            </div>

            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <CanvasDroppableArea isEmpty={blocks.length === 0}>
                {blocks.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-500 pointer-events-none mt-20">
                    Tarik (Drop) blok ke area ini.
                  </div>
                )}
                {blocks.map(block => (
                  <SortableBlockItem 
                    key={block.id} 
                    id={block.id} 
                    block={block} 
                    onSelect={() => setActiveBlockId(block.id)} 
                    onRemove={removeBlock} 
                    isActive={activeBlockId === block.id}
                  />
                ))}
              </CanvasDroppableArea>
            </SortableContext>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Property Editor */}
        <div className="w-80 border-l border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 p-4 shrink-0 overflow-y-auto z-10">
          <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-200 dark:border-white/10 pb-2">Properties</h3>
          {activeBlock ? (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4">
                 <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">{activeBlock.component_type}</div>
                 <span className="text-xs text-slate-500">ID: {activeBlock.id}</span>
               </div>
               <PropertyEditor block={activeBlock} onChange={updateBlockProps} />
            </div>
          ) : (
            <div className="text-sm text-slate-500 text-center mt-10">Pilih salah satu blok di kanvas untuk mengedit properti.</div>
          )}
        </div>
      </div>
      
      {/* Drag Overlay for better UX */}
      <DragOverlay dropAnimation={null}>
        {activeDragData?.isSidebarItem ? (
          <div className="flex items-center gap-3 p-3 text-left w-64 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-xl opacity-90 cursor-grabbing z-50">
            <div className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-md">
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">{activeDragData.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
