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

export type SearchResult = {
  id: string;
  score: number;
  product: Product;
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
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },
  uploadByUrl: async (imageUrl: string): Promise<{ url: string; key: string; embedding: number[]; dims: number }> => {
    return http('/api/upload', { method: 'POST', body: JSON.stringify({ imageUrl }) });
  },
  searchByImageUrl: async (imageUrl: string, opts?: { topK?: number; minScore?: number }): Promise<{ queryEmbeddingDims: number; results: SearchResult[] }> => {
    return http('/api/search', { method: 'POST', body: JSON.stringify({ imageUrl, ...(opts || {}) }) });
  },
  searchByProductId: async (productId: string, opts?: { topK?: number; minScore?: number }): Promise<{ queryEmbeddingDims: number; results: SearchResult[] }> => {
    return http('/api/search', { method: 'POST', body: JSON.stringify({ productId, ...(opts || {}) }) });
  },
};
