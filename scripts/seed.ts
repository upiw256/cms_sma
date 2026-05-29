import { config } from "dotenv";
config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@sekolah.sch.id";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
    } else {
      const hashedPassword = await bcrypt.hash("SuperPassword123!", 10);
      const adminUser = new User({
        name: "Super Administrator",
        email: adminEmail,
        password: hashedPassword,
        roles: ["SUPER_ADMIN", "ADMIN"],
        is_active: true,
      });

      await adminUser.save();
      console.log("Seeded default superuser: admin@sekolah.sch.id");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

seed();
