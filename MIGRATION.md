# Visual Product Matcher - Full-Stack Next.js Migration

This project has been successfully migrated from a separate Express backend to a **pure Next.js full-stack application**.

## 🎯 What Changed

### Before (Separated Architecture)
- **Frontend**: Next.js 15 (port 3001) → Calls external API
- **Backend**: Express.js (port 5000) → Handles all business logic
- **Deployment**: Two separate services (Vercel + Vercel serverless)

### After (Full-Stack Next.js)
- **Frontend + Backend**: Next.js 15 with API routes (single app)
- **API Routes**: `/api/products`, `/api/search`, `/api/upload`
- **Deployment**: Single Next.js app on Vercel

## 📁 Project Structure

```
vpm_frontend/
├── src/
│   ├── app/
│   │   ├── api/                    # ← Backend logic (NEW!)
│   │   │   ├── products/route.ts   # GET /api/products
│   │   │   ├── search/route.ts     # POST /api/search
│   │   │   └── upload/route.ts     # POST /api/upload
│   │   ├── page.tsx                # Main UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── lib/
│       ├── api.ts                  # Frontend API client
│       ├── clients.ts              # GoogleAI, Convex, UploadThing (NEW!)
│       ├── embedding.ts            # AI embeddings service (NEW!)
│       └── product.ts              # Convex operations (NEW!)
├── convex/                         # Convex database functions
│   ├── schema.js
│   ├── products.js
│   ├── search.js
│   └── _generated/
├── .env.local                      # Environment variables
└── package.json
```

## 🔧 Environment Variables

Update your `.env.local`:

```bash
# Backend services configuration
CONVEX_URL=https://colorful-hippopotamus-170.convex.cloud
GEMINI_API_KEY=AIzaSyBPuVfScpcEuLWwqIuXRXS4F1js1cb9zH0
UPLOADTHING_TOKEN=<your-token>

# Convex deployment (auto-generated)
CONVEX_DEPLOYMENT=dev:colorful-hippopotamus-170
```

## 🚀 Running the App

### Development Mode

```bash
# Install dependencies
pnpm install

# Run Convex dev server (in separate terminal)
pnpm convex

# Run Next.js dev server
pnpm dev
```

The app will be available at **http://localhost:3001**

### Production Build

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

## 📦 Dependencies Added

The following backend dependencies were added to the frontend:

```json
{
  "@google/generative-ai": "^0.24.1",  // Gemini AI for embeddings
  "axios": "^1.12.2",                   // HTTP client
  "convex": "^1.28.0",                  // Vector database
  "uploadthing": "^7.7.4"               // Image CDN
}
```

## 🔄 Migration Details

### Backend Services Migrated

1. **Google Generative AI** (`lib/clients.ts`, `lib/embedding.ts`)
   - Text embeddings (768 dimensions)
   - Image captioning with Gemini 2.0 Flash
   
2. **Convex Database** (`lib/clients.ts`, `lib/product.ts`)
   - Vector search operations
   - Product CRUD operations
   - Query/Mutation/Action functions

3. **UploadThing CDN** (`lib/clients.ts`)
   - Image upload from File or URL
   - Buffer to UploadThing conversion

### API Routes Created

| Route | Method | Description |
|-------|--------|-------------|
| `/api/products` | GET | List all products (optional category filter) |
| `/api/search` | POST | Visual search by image URL or product ID |
| `/api/upload` | POST | Upload image (base64 or URL) and generate embedding |

### Frontend Changes

- **`src/lib/api.ts`**: Updated to use relative paths (`BASE_URL = ""`)
- **Removed**: `NEXT_PUBLIC_BACKEND_URL` environment variable
- **All API calls now go to `/api/*`** instead of external backend

## 🎨 Features

- ✅ Visual product search using AI embeddings
- ✅ Image upload with automatic captioning
- ✅ Vector similarity search (768-dim embeddings)
- ✅ Category filtering
- ✅ Modern black + cyan UI theme
- ✅ Fully serverless deployment

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Migrate to full-stack Next.js"
   git push
   ```

2. **Deploy on Vercel**:
   - Connect your GitHub repo
   - Add environment variables:
     - `CONVEX_URL`
     - `GEMINI_API_KEY`
     - `UPLOADTHING_TOKEN`
   - Deploy!

3. **Deploy Convex Functions**:
   ```bash
   npx convex deploy --prod
   ```

### Environment Variables on Vercel

Go to **Settings → Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `CONVEX_URL` | `https://colorful-hippopotamus-170.convex.cloud` | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Google AI API key | Production, Preview, Development |
| `UPLOADTHING_TOKEN` | Your UploadThing token | Production, Preview, Development |

## 🧪 Testing the Migration

### 1. Test Product Listing
```bash
curl http://localhost:3001/api/products
```

### 2. Test Image Upload
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/512"}'
```

### 3. Test Visual Search
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/512", "topK": 10}'
```

## 📊 Architecture Benefits

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Services** | 2 (Frontend + Backend) | 1 (Next.js full-stack) |
| **Deployments** | 2 separate Vercel apps | 1 Vercel app |
| **API Calls** | External HTTP (slower) | Internal (faster) |
| **Cold Starts** | 2x (both services) | 1x (single service) |
| **Maintenance** | 2 codebases | 1 codebase |
| **Type Safety** | Partial (API boundary) | Full (TypeScript) |

## 🐛 Troubleshooting

### Convex Types Not Generated

Run:
```bash
npx convex dev --once --until-success
```

### Module Not Found Errors

Ensure all dependencies are installed:
```bash
pnpm install
```

### API Routes 404

Make sure you're running the dev server on port 3001:
```bash
pnpm dev
```

### Environment Variables Not Loaded

Restart the Next.js dev server after updating `.env.local`:
```bash
# Ctrl+C to stop
pnpm dev
```

## 🎉 Summary

The migration is complete! You now have a **single, unified Next.js application** that handles both frontend and backend logic. The backend Express.js service (`vpm_backend`) is no longer needed and can be archived or deleted.

All functionality remains intact:
- ✅ Visual search
- ✅ Image uploads
- ✅ Product management
- ✅ AI embeddings
- ✅ Vector database

But with improved:
- 🚀 Performance (no external API calls)
- 🔧 Maintainability (single codebase)
- 📦 Deployment (one service)
- 🎯 Type safety (full TypeScript)
