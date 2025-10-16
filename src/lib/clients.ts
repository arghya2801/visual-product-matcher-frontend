import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConvexHttpClient } from "convex/browser";
import { UTApi } from "uploadthing/server";

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const CONVEX_URL = process.env.CONVEX_URL || "";
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN || "";

// Initialize clients
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
export const convex = new ConvexHttpClient(CONVEX_URL);
export const utapi = new UTApi({ token: UPLOADTHING_TOKEN });

// Helper functions
export async function fetchImageBuffer(url: string) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const contentType = res.headers["content-type"] || "image/jpeg";
  const buffer = Buffer.from(res.data);
  return { buffer, contentType };
}

export async function uploadBufferToUploadThing(
  buffer: Buffer,
  filename: string,
  contentType: string
) {
  // Convert Buffer to Uint8Array for File constructor
  const uint8Array = new Uint8Array(buffer);
  const file = new File([uint8Array], filename, { type: contentType });
  const uploaded = await utapi.uploadFiles(file);
  if (uploaded?.data?.url) {
    return { url: uploaded.data.url, key: uploaded.data.key };
  }
  throw new Error(uploaded?.error?.message || "Upload failed");
}

export async function uploadByUrlToUploadThing(url: string) {
  const { buffer, contentType } = await fetchImageBuffer(url);
  const filename = url.split("?")[0].split("/").pop() || `image_${Date.now()}.jpg`;
  return uploadBufferToUploadThing(buffer, filename, contentType);
}
