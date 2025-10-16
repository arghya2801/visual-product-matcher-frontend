import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToUploadThing, uploadByUrlToUploadThing } from "@/lib/clients";
import { embedImageUrl } from "@/lib/embedding";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let url: string;
    let key: string;

    // Check if body contains base64 image or imageUrl
    if (body?.imageData) {
      // Handle base64 encoded image from frontend
      const { imageData, filename = `image_${Date.now()}.jpg`, mimetype = "image/jpeg" } = body;
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const result = await uploadBufferToUploadThing(buffer, filename, mimetype);
      url = result.url;
      key = result.key;
    } else if (body?.imageUrl) {
      const result = await uploadByUrlToUploadThing(body.imageUrl);
      url = result.url;
      key = result.key;
    } else {
      return NextResponse.json(
        { error: "Provide { imageData } (base64) or { imageUrl }" },
        { status: 400 }
      );
    }

    const embedding = await embedImageUrl(url);
    
    return NextResponse.json({
      url,
      key,
      embedding,
      dims: embedding.length,
    });
  } catch (error: any) {
    console.error("Error uploading:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
