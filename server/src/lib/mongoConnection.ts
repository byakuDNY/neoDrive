import mongoose from "mongoose";
import { envConfig } from "./envConfig";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(envConfig.MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ Error connecting to MongoDB: ", error);
  }
};
