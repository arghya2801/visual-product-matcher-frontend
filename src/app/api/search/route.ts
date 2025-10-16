import { NextRequest, NextResponse } from "next/server";
import { vectorSearch, getProduct } from "@/lib/product";
import { embedImageUrl } from "@/lib/embedding";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, productId, topK = 20, minScore = 0 } = body;

    let queryEmbedding: number[];

    if (imageUrl) {
      queryEmbedding = await embedImageUrl(imageUrl);
    } else if (productId) {
      const product = await getProduct(productId);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      queryEmbedding = product.embedding;
    } else {
      return NextResponse.json(
        { error: "Provide imageUrl or productId" },
        { status: 400 }
      );
    }

    const results = await vectorSearch(queryEmbedding, topK, minScore);
    
    return NextResponse.json({
      queryEmbeddingDims: queryEmbedding.length,
      results,
    });
  } catch (error: any) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
