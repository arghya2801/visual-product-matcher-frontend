import { convex } from "./clients";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export async function listProducts(category: string | null = null) {
  return convex.query(api.products.list, { category });
}

export async function getProduct(id: string) {
  return convex.query(api.products.get, { id: id as Id<"products"> });
}

export async function bulkAddProducts(items: any[]) {
  return convex.mutation(api.products.bulkAdd, { items });
}

export async function vectorSearch(
  queryEmbedding: number[],
  topK: number = 20,
  minScore: number = 0
) {
  // Access the vectorSearch action directly using module path
  const searchAction = (api as any).search.vectorSearch;
  return convex.action(searchAction, {
    queryEmbedding,
    topK,
    minScore,
  });
}
