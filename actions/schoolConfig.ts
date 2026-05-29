"use server";

import dbConnect from "@/lib/db";
import SchoolConfig from "@/models/SchoolConfig";
import { revalidatePath } from "next/cache";

export async function getSchoolConfig() {
  await dbConnect();
  const config = await SchoolConfig.findOne().lean();
  
  if (!config) {
    // Return a default mock config if none exists, or generate one
    const defaultConfig = await SchoolConfig.create({
      npsn: "12345678",
      name: "SMA KOMPLEKS",
      headmaster_name: "John Doe, M.Pd",
    });
    return JSON.parse(JSON.stringify(defaultConfig));
  }
  
  return JSON.parse(JSON.stringify(config));
}

export async function updateSchoolConfig(data: Partial<typeof SchoolConfig.schema.obj>) {
  await dbConnect();
  
  const config = await SchoolConfig.findOne();
  if (config) {
    await SchoolConfig.updateOne({ _id: config._id }, data);
  } else {
    await SchoolConfig.create(data);
  }
  
  revalidatePath("/", "layout");
  return { success: true };
}
