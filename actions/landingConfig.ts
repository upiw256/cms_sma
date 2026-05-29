"use server";

import dbConnect from "@/lib/db";
import LandingSection, { ILandingSection } from "@/models/LandingSection";
import { revalidatePath } from "next/cache";

const DEFAULT_SECTIONS = [
  { section_key: "hero", display_order: 1, is_visible: true, custom_title: "" },
  { section_key: "stats", display_order: 2, is_visible: true, custom_title: "" },
  { section_key: "sambutan", display_order: 3, is_visible: true, custom_title: "Sambutan Kepala Sekolah" },
  { section_key: "news", display_order: 4, is_visible: true, custom_title: "Berita & Pengumuman" },
  { section_key: "agenda", display_order: 5, is_visible: true, custom_title: "Agenda Sekolah" },
  { section_key: "alumni", display_order: 6, is_visible: true, custom_title: "Tracer Study Alumni" },
];

export async function getLandingSections() {
  await dbConnect();
  
  let sections = await LandingSection.find().sort({ display_order: 1 }).lean();
  
  if (sections.length === 0) {
    // Seed default sections if empty
    sections = await LandingSection.insertMany(DEFAULT_SECTIONS);
  }
  
  return JSON.parse(JSON.stringify(sections));
}

export async function updateLandingSections(updates: { _id: string; display_order: number; is_visible: boolean; custom_title: string }[]) {
  await dbConnect();
  
  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { _id: update._id },
      update: { 
        $set: { 
          display_order: update.display_order, 
          is_visible: update.is_visible,
          custom_title: update.custom_title,
        } 
      }
    }
  }));

  if (bulkOps.length > 0) {
    await LandingSection.bulkWrite(bulkOps);
    revalidatePath("/");
    revalidatePath("/dashboard/landing-builder");
  }

  return { success: true, message: "Pengaturan tata letak berhasil disimpan." };
}
