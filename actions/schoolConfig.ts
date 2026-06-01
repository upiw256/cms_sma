"use server";

import dbConnect from "@/lib/db";
import SchoolConfig from "@/models/SchoolConfig";
import { revalidatePath } from "next/cache";
import { appendFileSync } from "fs";

export async function getSchoolConfig() {
  await dbConnect();
  const config = await SchoolConfig.findOne().lean();
  
  const defaults = {
    npsn: "12345678",
    name: "SMA KOMPLEKS",
    headmaster_name: "John Doe, M.Pd",
    headmaster_photo: "",
    headmaster_greeting: "Selamat datang di portal resmi sekolah kami. Kami berkomitmen memberikan pendidikan terbaik.",
    branding_logo: "",
    favicon: "",
    primary_color: "#3b82f6",
    secondary_color: "#1d4ed8",
    contact_info: { address: "", phone: "", email: "" },
    social_media: { facebook: "", instagram: "", twitter: "", youtube: "" },
    landing_bg_type: "default",
    landing_bg_color: "#0f172a",
    landing_bg_gradient: { from: "#0f172a", via: "#1e3a5f", to: "#1e293b", direction: "135deg" },
  };

  if (!config) {
    const newConfig = await SchoolConfig.create(defaults);
    return JSON.parse(JSON.stringify(newConfig));
  }
  
  // Merge defaults with config to ensure all fields exist
  const merged = { ...defaults, ...JSON.parse(JSON.stringify(config)) };
  try {
    appendFileSync("debug_logs.txt", `\n[GET] ${new Date().toISOString()}: ${JSON.stringify(merged)}`);
  } catch(e) {}
  return merged;
}

export async function updateSchoolConfig(data: any) {
  console.log("SERVER ACTION: updateSchoolConfig called with data keys:", Object.keys(data));
  try {
    appendFileSync("debug_logs.txt", `\n[UPDATE] ${new Date().toISOString()}: ${JSON.stringify(data)}`);
  } catch(e) {}
  await dbConnect();
  
  const config = await SchoolConfig.findOne();
  if (config) {
    await SchoolConfig.findByIdAndUpdate(config._id, { $set: data });
  } else {
    await SchoolConfig.create(data);
  }
  
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/profil");
  revalidatePath("/visi-misi");
  revalidatePath("/fasilitas");
  revalidatePath("/download");
  revalidatePath("/alumni");
  return { success: true };
}
