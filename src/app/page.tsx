"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { api, type Product, type SearchResult } from "@/lib/api";

export default function Home() {
  const backendUrl = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", []);
  const [health, setHealth] = useState<string>("unknown");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [lastQuery, setLastQuery] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Try a health check on load
    api.health().then(() => setHealth("ok")).catch(() => setHealth("fail"));
  }, []);

  const onLoadProducts = async () => {
    setLoading(true); setError("");
    try {
      const list = await api.products();
      setProducts(list);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async () => {
    setLoading(true); setError(""); setResults([]);
    try {
      let uploaded: { url: string } | null = null;
      if (file) uploaded = await api.uploadByFile(file);
      else if (imageUrl) uploaded = await api.uploadByUrl(imageUrl);
      else throw new Error("Select a file or provide an image URL");
      setLastQuery(uploaded.url);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onSearchByImage = async () => {
    if (!lastQuery && !imageUrl) return;
    setLoading(true); setError("");
    try {
      const q = lastQuery || imageUrl;
      const resp = await api.searchByImageUrl(q, { topK: 20 });
      setResults(resp.results);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onSearchByProduct = async (p: Product) => {
    setLoading(true); setError("");
    try {
      const id = (p as any)._id || (p as any).id || (p as any).doc?._id || "";
      const resp = await api.searchByProductId(id, { topK: 20 });
      setResults(resp.results);
      setLastQuery(p.imageUrl);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Image src="/next.svg" alt="Logo" width={120} height={26} className="dark:invert" />
          <h1 className="text-xl font-semibold">Visual Product Matcher</h1>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Backend: <span className="font-mono">{backendUrl}</span> • Health: <span className={health === 'ok' ? 'text-green-600' : 'text-red-600'}>{health}</span>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="font-medium">Query by Image</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="border rounded p-2 w-full" />
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="or paste image URL" className="border rounded p-2 w-full" />
            </div>
            <div className="flex gap-3">
              <button onClick={onUpload} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" disabled={loading}>Upload</button>
              <button onClick={onSearchByImage} className="px-3 py-2 rounded border disabled:opacity-50" disabled={loading}>Search similar</button>
            </div>
            {lastQuery ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Last uploaded/query:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lastQuery} alt="query" className="h-16 w-16 object-cover rounded" />
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Products</h2>
              <div className="flex gap-3">
                <button onClick={onLoadProducts} className="px-3 py-2 rounded border disabled:opacity-50" disabled={loading}>Load products</button>
              </div>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">No products loaded. Click "Load products". Seeding requires backend credentials.</p>
            ) : null}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <button key={(p as any)._id || p.imageUrl}
                        onClick={() => onSearchByProduct(p)}
                        className="text-left rounded border hover:shadow focus:shadow p-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded">
                    {/* Next/Image for remote URLs */}
                    {/* @ts-expect-error - external domains configured in next.config */}
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="font-medium truncate" title={p.name}>{p.name}</div>
                    {p.metadata?.price ? <div className="text-gray-600">${p.metadata?.price}</div> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="font-medium">Results</h2>
            {loading ? <div className="text-sm">Loading…</div> : null}
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {results.length === 0 ? <div className="text-sm text-gray-500">No results</div> : null}
            <div className="grid grid-cols-2 gap-3">
              {results.map((r) => (
                <div key={r.id} className="rounded border overflow-hidden">
                  <div className="relative aspect-square w-full">
                    {/* @ts-expect-error */}
                    <Image src={r.product.imageUrl} alt={r.product.name} fill className="object-cover" />
                  </div>
                  <div className="p-2 text-sm">
                    <div className="font-medium truncate" title={r.product.name}>{r.product.name}</div>
                    <div className="text-gray-600">Score: {r.score.toFixed(3)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
