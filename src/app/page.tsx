"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { api, type Product, type SearchResult } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [lastQuery, setLastQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    onLoadProducts();
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

  const onBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    setLoading(true); setError(""); setUploadProgress(0);
    try {
      const resp = await api.bulkUpload(bulkFiles);
      setUploadProgress(100);
      alert(`Uploaded ${resp.inserted} products!`);
      await onLoadProducts();
      setBulkFiles([]);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-black/60 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                V
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">
                  Visual Product Matcher
                </h1>
                <p className="text-xs text-slate-400">AI-Powered Visual Search</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-gray-900 px-3 py-1.5 rounded-full shadow-sm border border-gray-800">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="font-mono text-xs text-slate-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Single Upload Card */}
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Query by Image
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-gray-800 text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Or Paste URL</label>
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-gray-800 text-sm text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onUpload}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-cyan-700/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? '⏳ Processing...' : '📤 Upload'}
                  </button>
                  <button
                    onClick={onSearchByImage}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-800 text-slate-100 rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? '⏳ Searching...' : '🔍 Search Similar'}
                  </button>
                </div>
                {lastQuery && (
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-800">
                    <span className="text-sm text-slate-300 font-medium">Last Query:</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lastQuery} alt="query" className="h-16 w-16 object-cover rounded-lg ring-1 ring-gray-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Upload Card */}
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Upload Products
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Multiple Images (up to 20)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                    className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-gray-800 text-sm text-slate-200"
                  />
                  {bulkFiles.length > 0 && (
                    <p className="mt-2 text-sm text-slate-400">
                      {bulkFiles.length} file{bulkFiles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-cyan-600 transition-all duration-500 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-center text-slate-400">{uploadProgress}%</p>
                  </div>
                )}
                <button
                  onClick={onBulkUpload}
                  disabled={loading || bulkFiles.length === 0}
                  className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-cyan-700/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? '⏳ Uploading...' : `🚀 Upload ${bulkFiles.length} Product${bulkFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product Catalog ({products.length})
                </h2>
                <button
                  onClick={onLoadProducts}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-slate-400">No products yet. Upload some images to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((p) => (
                      <button
                        key={(p as any)._id || p.imageUrl}
                        onClick={() => onSearchByProduct(p)}
                        className="group relative bg-gray-900 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 hover:scale-105 hover:-translate-y-1"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-800">
                          
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width:768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-3">
                          <div className="font-medium truncate text-sm text-slate-100" title={p.name}>
                            {p.name}
                          </div>
                          {p.metadata?.price && (
                            <div className="text-xs text-cyan-400 font-semibold mt-1">
                              ${p.metadata.price}
                            </div>
                          )}
                          {p.category && (
                            <div className="text-xs text-slate-400 mt-1 capitalize">
                              {p.category}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Search Results ({results.length})
                </h2>
              </div>
              <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm text-slate-400">Searching...</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
                    <p className="text-sm text-red-400">⚠️ {error}</p>
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">No results yet.<br/>Search for similar products!</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {results.map((r) => (
                    <div
                      key={r._id}
                      className="group bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-800 hover:scale-105"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-800">
                        <Image
                          src={r.imageUrl}
                          alt={r.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <div className="font-medium truncate text-sm text-slate-100" title={r.name}>
                          {r.name}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs font-semibold text-cyan-400">
                            {(r.score * 100).toFixed(1)}% match
                          </div>
                          <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-600"
                              style={{ width: `${Math.min(r.score * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
