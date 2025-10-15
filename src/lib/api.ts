// Fallback for TS type in browser env (Next provides process.env at build time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;
export type Product = {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  metadata?: Record<string, any> & { price?: number; brand?: string; description?: string };
};

export type SearchResult = Product & {
  score: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`,
    {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {} as any),
      },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const api = {
  health: async (): Promise<{ ok: true }> => http('/health'),
  products: async (category?: string): Promise<Product[]> => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return http(`/api/products${qs}`);
  },
  seedProducts: async (count = 50): Promise<{ inserted: number }> => {
    return http('/api/products/seed', { method: 'POST', body: JSON.stringify({ count }) });
  },
  uploadByFile: async (file: File): Promise<{ url: string; key: string; embedding: number[]; dims: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageData = reader.result as string;
          const resp = await http('/api/upload', { 
            method: 'POST', 
            body: JSON.stringify({ 
              imageData, 
              filename: file.name,
              mimetype: file.type 
            }) 
          });
          resolve(resp);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
  uploadByUrl: async (imageUrl: string): Promise<{ url: string; key: string; embedding: number[]; dims: number }> => {
    return http('/api/upload', { method: 'POST', body: JSON.stringify({ imageUrl }) });
  },
  bulkUpload: async (files: File[], category?: string): Promise<{ inserted: number; products: Product[] }> => {
    // Convert files to base64
    const imagePromises = files.map(file => {
      return new Promise<{ imageData: string; filename: string; mimetype: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ 
          imageData: reader.result as string, 
          filename: file.name,
          mimetype: file.type 
        });
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    const images = await Promise.all(imagePromises);
    const body = { images, category };
    
    return http('/api/bulk-upload', { method: 'POST', body: JSON.stringify(body) });
  },
  searchByImageUrl: async (imageUrl: string, opts?: { topK?: number; minScore?: number }): Promise<{ queryEmbeddingDims: number; results: SearchResult[] }> => {
    return http('/api/search', { method: 'POST', body: JSON.stringify({ imageUrl, ...(opts || {}) }) });
  },
  searchByProductId: async (productId: string, opts?: { topK?: number; minScore?: number }): Promise<{ queryEmbeddingDims: number; results: SearchResult[] }> => {
    return http('/api/search', { method: 'POST', body: JSON.stringify({ productId, ...(opts || {}) }) });
  },
};
