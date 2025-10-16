# Visual Product Matcher

An intelligent visual product matching system that uses AI-powered image embeddings to find similar products. Built with Next.js 15, Google Gemini AI, and Convex for real-time vector search capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0-orange)
![Convex](https://img.shields.io/badge/Convex-Vector_DB-purple)

## Features

- **Visual Search**: Upload any product image and find visually similar items
- **AI-Powered**: Utilizes Google Gemini 2.0 Flash for image captioning and text-embedding-004 for vector generation
- **Real-time Search**: Convex vector database provides blazing-fast similarity search
- **Bulk Upload**: Upload multiple products at once to build your catalog
- **Similarity Scores**: Get confidence scores for each match
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation

## Tech Stack

- **Frontend**: Next.js 15.5 with React 19 and App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI/ML**: Google Gemini AI (gemini-2.0-flash + text-embedding-004)
- **Database**: Convex (Vector Database with 768-dimensional embeddings)
- **File Storage**: UploadThing
- **HTTP Client**: Axios

## Project Structure

```
vpm_frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/route.ts      # Product CRUD operations
│   │   │   ├── search/route.ts        # Vector similarity search
│   │   │   ├── upload/route.ts        # Image upload & embedding
│   │   │   └── bulk-upload/route.ts   # Bulk product import
│   │   ├── page.tsx                   # Main UI component
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   └── lib/
│       ├── api.ts                     # Frontend API client
│       ├── clients.ts                 # External service clients (Gemini, Convex, UploadThing)
│       ├── embedding.ts               # Image-to-embedding pipeline
│       └── product.ts                 # Product data models & vector search
├── convex/
│   ├── schema.js                      # Database schema with vector index
│   ├── products.js                    # Product queries & mutations
│   └── search.js                      # Vector search actions
├── public/                            # Static assets
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **pnpm** (or npm/yarn)
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **Convex Account** ([Sign up free](https://convex.dev))
- **UploadThing Account** ([Get token](https://uploadthing.com))

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/arghya2801/visual-product-matcher-frontend.git
cd vpm_frontend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
# or
GOOGLE_API_KEY=your_gemini_api_key_here

# Convex
CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# UploadThing
UPLOADTHING_TOKEN=your_uploadthing_token
```

4. **Set up Convex**:

First, install Convex CLI globally (if not already):
```bash
pnpm add -g convex
```

Initialize and deploy Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Deploy your schema and functions
- Provide your `CONVEX_URL` (add it to `.env.local`)

5. **Run the development server**:

Open two terminal windows:

**Terminal 1** - Next.js dev server:
```bash
pnpm dev
```

**Terminal 2** - Convex dev mode (for real-time sync):
```bash
pnpm convex
```

6. **Open the application**:

Navigate to [http://localhost:3001](http://localhost:3001) in your browser.

## How It Works

### Image-to-Vector Pipeline

1. **Image Upload**: User uploads an image or provides URL
2. **Storage**: Image is uploaded to UploadThing CDN
3. **Captioning**: Google Gemini 2.0 Flash analyzes the image and generates a detailed description
4. **Embedding**: Caption is converted to a 768-dimensional vector using `text-embedding-004`
5. **Storage**: Vector is stored in Convex with product metadata
6. **Search**: Vector similarity search finds closest matches using cosine similarity

### Architecture Flow

```
┌─────────────┐
│   User UI   │
│  (page.tsx) │
└──────┬──────┘
    │
    ▼
┌─────────────┐
│  API Routes │
│ (/api/*)    │
└──────┬──────┘
    │
    ├──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Gemini  │   │ Convex   │   │UploadThing│   │Embedding │
│   AI     │   │   DB     │   │   CDN     │   │ Pipeline │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

## Usage Guide

### 1. Upload Products (Bulk)

Build your product catalog by uploading multiple images at once:

1. Click on "Bulk Upload" section
2. Select multiple product images
3. Click "Upload All"
4. System automatically:
   - Uploads images to CDN
   - Generates captions using Gemini Vision
   - Creates embeddings
   - Stores in Convex database

### 2. Search by Image

Find similar products using any image:

1. **Upload Search Image**:
   - Drag & drop an image, or
   - Click to browse, or
   - Paste an image URL

2. Click "Upload & Process"
3. Click "Search Similar Products"
4. View results ranked by similarity score

### 3. Search by Product

Find similar items to an existing product:

1. Browse the product catalog
2. Click "Find Similar" on any product
3. View visually similar products

## API Reference

### POST `/api/upload`

Upload and process a single image.

**Request Body**:
```typescript
{
  // Option 1: Base64 encoded image
  imageData: string;      // data:image/jpeg;base64,...
  filename?: string;      // Optional filename
  mimetype?: string;      // Optional MIME type
  
  // Option 2: Image URL
  imageUrl: string;       // https://example.com/image.jpg
}
```

**Response**:
```typescript
{
  url: string;           // UploadThing CDN URL
  key: string;           // Storage key
  embedding: number[];   // 768-dimensional vector
  dims: number;          // 768
}
```

### POST `/api/search`

Search for visually similar products.

**Request Body**:
```typescript
{
  // Option 1: Search by image URL
  imageUrl?: string;
  
  // Option 2: Search by existing product ID
  productId?: string;
  
  // Search parameters
  topK?: number;         // Max results (default: 20)
  minScore?: number;     // Minimum similarity (default: 0)
}
```

**Response**:
```typescript
{
  queryEmbeddingDims: number;
  results: Array<{
    _id: string;
    name: string;
    category: string;
    imageUrl: string;
    score: number;        // Similarity score (0-1)
    metadata?: {
      price?: number;
      brand?: string;
      description?: string;
    };
  }>;
}
```

### GET `/api/products`

Retrieve all products.

**Query Parameters**:
- `category` (optional): Filter by category

**Response**:
```typescript
Array<{
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  embedding: number[];
  metadata?: object;
}>
```

### POST `/api/bulk-upload`

Upload multiple products at once.

**Request Body**:
```typescript
{
  images: Array<{
    imageData: string;    // Base64 encoded
    filename: string;
    mimetype: string;
  }>;
  category?: string;      // Optional category for all products
}
```

**Response**:
```typescript
{
  inserted: number;       // Number of products added
  products: Product[];    // Created product documents
}
```

## Key Components

### Embedding Generation (`lib/embedding.ts`)

- **Image Captioning**: Uses Gemini 2.0 Flash to generate detailed descriptions
- **Text Embedding**: Converts captions to 768-dim vectors using `text-embedding-004`
- **Error Handling**: Graceful fallbacks for API failures

### Vector Search (`convex/search.js`)

- **Convex Vector Index**: Native vector similarity search
- **Cosine Similarity**: Measures angular distance between embeddings
- **Filtering**: Supports category-based filtering
- **Scalability**: Handles large catalogs efficiently

### Client Integration (`lib/clients.ts`)

- **Google Gemini AI**: Vision and embedding models
- **Convex**: Real-time database with vector search
- **UploadThing**: Serverless file storage

## Customization

### Adjust Search Parameters

In `src/app/page.tsx`, modify search behavior:

```typescript
const resp = await api.searchByImageUrl(q, {
  topK: 20,        // Change number of results
  minScore: 0.7    // Set minimum similarity threshold
});
```

### Change Embedding Model

In `src/lib/embedding.ts`:

```typescript
const EMBEDDING_MODEL = "text-embedding-004"; // 768 dims
// For higher dimensions, consider other models
```

### Customize Product Schema

In `convex/schema.js`, modify the product schema:

```javascript
products: defineTable({
  name: v.string(),
  category: v.string(),
  imageUrl: v.string(),
  // Add custom fields here
  customField: v.string(),
}).vectorIndex("byEmbedding", {
  vectorField: "embedding",
  dimensions: 768,
  filterFields: ["category", "customField"], // Add filter fields
})
```

## Performance Optimization

- **Vector Dimensions**: Using 768-dim (text-embedding-004) for optimal balance
- **Caching**: Embeddings are stored in Convex to avoid regeneration
- **CDN**: UploadThing provides global CDN for fast image delivery
- **Lazy Loading**: Products load progressively in the UI
- **Parallel Processing**: Bulk uploads process images concurrently

## Troubleshooting

### Images not uploading

**Issue**: Upload fails with error
**Solutions**:
- Check UploadThing token is valid
- Verify file size is under limits (default 4MB)
- Check console for detailed error messages

### Search returns no results

**Issue**: Vector search finds no matches
**Solutions**:
- Ensure products exist in database (check `/api/products`)
- Lower `minScore` threshold
- Verify embeddings are generated (check product documents)
- Confirm Convex vector index is deployed

### Convex deployment issues

**Issue**: `npx convex dev` fails
**Solutions**:
```bash
# Clear Convex cache
rm -rf .convex

# Reinstall Convex CLI
pnpm add -g convex@latest

# Re-run setup
npx convex dev
```

### Environment variables not loading

**Issue**: API keys not recognized
**Solutions**:
- Restart both dev servers after adding `.env.local`
- Verify variable names match exactly (case-sensitive)
- For Next.js client-side vars, use `NEXT_PUBLIC_` prefix

### Build errors

**Issue**: `pnpm build` fails
**Solutions**:
```bash
# Clear build cache
rm -rf .next

# Clear node modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

## Database Schema

### Products Table

```javascript
{
  _id: Id<"products">,
  name: string,
  category: string,
  imageUrl: string,
  uploadThingKey: string,
  embedding: number[],      // 768-dimensional vector
  metadata: {
    description?: string,
    price?: number,
    brand?: string,
    uploadedAt?: string,
  }
}

// Vector Index
vectorIndex("byEmbedding", {
  vectorField: "embedding",
  dimensions: 768,
  filterFields: ["category"]
})
```

## Development Scripts

```bash
pnpm dev          # Start Next.js dev server (port 3001)
pnpm convex       # Start Convex dev mode
pnpm build        # Build production bundle
pnpm start        # Start production server
```


