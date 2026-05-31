"use server";

import dbConnect from "@/lib/db";
import OrganizationMember from "@/models/OrganizationMember";
import { revalidatePath } from "next/cache";

export async function getOrganizationStructure() {
  await dbConnect();
  const members = await OrganizationMember.find().sort({ display_order: 1 }).lean();
  return JSON.parse(JSON.stringify(members));
}

export async function addOrganizationMember(data: any) {
  await dbConnect();
  const member = await OrganizationMember.create(data);
  revalidatePath("/dashboard/organigram");
  revalidatePath("/profil"); // Assuming it's shown here
  return { success: true, data: JSON.parse(JSON.stringify(member)) };
}

export async function updateOrganizationMember(id: string, data: any) {
  await dbConnect();
  await OrganizationMember.findByIdAndUpdate(id, data);
  revalidatePath("/dashboard/organigram");
  revalidatePath("/profil");
  return { success: true };
}

export async function deleteOrganizationMember(id: string) {
  await dbConnect();
  // Optional: Update children to point elsewhere or delete them
  await OrganizationMember.deleteMany({ parent_id: id }); 
  await OrganizationMember.findByIdAndDelete(id);
  revalidatePath("/dashboard/organigram");
  revalidatePath("/profil");
  return { success: true };
}

export async function updateMemberOrder(updates: { id: string, display_order: number, parent_id: string | null }[]) {
  await dbConnect();
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { _id: update.id },
      update: { 
        $set: { 
          display_order: update.display_order,
          parent_id: update.parent_id as any
        } 
      }
    }
  }));
  await OrganizationMember.bulkWrite(bulkOps as any);
  revalidatePath("/dashboard/organigram");
  revalidatePath("/profil");
  return { success: true };
}
