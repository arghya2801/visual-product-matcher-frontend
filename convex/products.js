import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    imageUrl: v.string(),
    uploadThingKey: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const bulkAdd = mutation({
  args: { items: v.array(v.object({
    name: v.string(),
    category: v.string(),
    imageUrl: v.string(),
    uploadThingKey: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
  })) },
  handler: async (ctx, { items }) => {
    const ids = [];
    for (const item of items) {
      const id = await ctx.db.insert("products", item);
      ids.push(id);
    }
    return ids;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const list = query({
  args: { category: v.optional(v.union(v.null(), v.string())) },
  handler: async (ctx, { category }) => {
    const products = await ctx.db.query("products").collect();
    return category ? products.filter(p => p.category === category) : products;
  },
});
