"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadImageBase64(base64Data: string) {
  try {
    // Extract base64 header (e.g., data:image/webp;base64,.....)
    const matches = base64Data.match(/^data:image\/([wA-Za-z0-9+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { success: false, message: "Format gambar tidak valid" };
    }
    
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1]; // handles image/webp etc
    const buffer = Buffer.from(matches[2], "base64");
    
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // Return relative URL for clients
    return { success: true, url: `/uploads/${fileName}` };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
