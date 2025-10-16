import { genAI } from "./clients";
import axios from "axios";

const VISION_MODEL = "gemini-2.0-flash";
const EMBEDDING_MODEL = "text-embedding-004"; // 768 dims

export async function embedText(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const resp = await model.embedContent(text);
    const vec = resp?.embedding?.values || [];
    console.log(`Embedding dimensions: ${vec.length}`);
    return (vec || []).map(Number);
  } catch (e: any) {
    console.error("embedText error", e?.message || e);
    return [];
  }
}

export async function captionImageFromUrl(url: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: VISION_MODEL });
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const contentType = res.headers["content-type"] || "image/jpeg";
  const data = Buffer.from(res.data).toString("base64");
  const prompt =
    "Describe this product in a short, detailed phrase highlighting visual attributes useful for retrieval.";
  const result = await model.generateContent([
    { inlineData: { data, mimeType: contentType } },
    { text: prompt },
  ]);
  const text =
    result?.response?.text?.() ||
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "generic product";
  return text;
}

export async function embedImageUrl(url: string): Promise<number[]> {
  try {
    const caption = await captionImageFromUrl(url);
    const vec = await embedText(caption);
    return vec;
  } catch (e: any) {
    console.error("embedImageUrl error", e?.message || e);
    return [];
  }
}
