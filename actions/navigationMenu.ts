"use server";

import dbConnect from "@/lib/db";
import NavigationMenu from "@/models/NavigationMenu";
import { revalidatePath } from "next/cache";

export async function getDynamicMenus(role: string = "GUEST") {
  await dbConnect();
  
  // Find menus where `allowed_roles` contains the user's role
  const menus = await NavigationMenu.find({
    is_active: true,
    allowed_roles: { $in: [role] }
  }).sort({ order: 1 }).lean();
  
  return JSON.parse(JSON.stringify(menus));
}

// For Admin Menu Builder: Fetch all regardless of role/active status
export async function getAllNavigationMenus() {
  await dbConnect();
  const menus = await NavigationMenu.find().sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(menus));
}

export async function saveNavigationMenu(data: any) {
  await dbConnect();
  try {
    if (data._id) {
      await NavigationMenu.findByIdAndUpdate(data._id, data);
    } else {
      await NavigationMenu.create(data);
    }
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/menus");
    return { success: true, message: "Menu berhasil disimpan." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteNavigationMenu(id: string) {
  await dbConnect();
  try {
    const children = await NavigationMenu.countDocuments({ parent_id: id });
    if (children > 0) {
      return { success: false, message: "Tidak dapat menghapus menu karena masih memiliki sub-menu." };
    }
    await NavigationMenu.findByIdAndDelete(id);
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/menus");
    return { success: true, message: "Menu berhasil dihapus." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateMenuOrder(items: { _id: string; order: number }[]) {
  await dbConnect();
  try {
    for (const item of items) {
      await NavigationMenu.findByIdAndUpdate(item._id, { order: item.order });
    }
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/menus");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
