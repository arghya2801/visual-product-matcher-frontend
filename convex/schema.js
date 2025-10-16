import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    category: v.string(),
    imageUrl: v.string(),
    uploadThingKey: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      brand: v.optional(v.string()),
      uploadedAt: v.optional(v.string()),
    })),
  }).vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 768, // Gemini text-embedding model actual dimension
    filterFields: ["category"],
  }),
  
  searchHistory: defineTable({
    uploadedImageUrl: v.string(),
    queryEmbedding: v.array(v.float64()),
    results: v.array(v.id("products")),
    timestamp: v.number(),
  }),
});
