import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const vectorSearch = action({
  args: {
    queryEmbedding: v.array(v.float64()),
    topK: v.optional(v.number()),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, { queryEmbedding, topK = 20, minScore = 0 }) => {
    // Use Convex vector search API - only available in actions
    const vectorResults = await ctx.vectorSearch("products", "byEmbedding", {
      vector: queryEmbedding,
      limit: topK,
    });

    // Filter by minimum score
    const filtered = vectorResults.filter(r => r._score >= minScore);

    // Fetch full product documents using the IDs
    const productsWithScores = await Promise.all(
      filtered.map(async (result) => {
        const product = await ctx.runQuery(api.products.get, { id: result._id });
        return {
          ...product,
          score: result._score,
        };
      })
    );

    return productsWithScores;
  },
});

export const logSearch = mutation({
  args: {
    uploadedImageUrl: v.optional(v.string()),
    queryEmbedding: v.array(v.float64()),
    results: v.array(v.id("products")),
  },
  handler: async (ctx, { uploadedImageUrl, queryEmbedding, results }) => {
    await ctx.db.insert("searchHistory", {
      uploadedImageUrl: uploadedImageUrl ?? "",
      queryEmbedding,
      results,
      timestamp: Date.now(),
    });
    return true;
  },
});
