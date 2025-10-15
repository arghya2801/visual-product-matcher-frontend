## Visual Product Matcher - Frontend (Next.js)

This Next.js app connects to the backend in `vpm_backend` to search visually similar products.

### Setup

1. Ensure the backend is configured and running on http://localhost:3000
2. Configure the frontend env by creating `.env.local` (already added):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Run

- Backend: `pnpm dev` in `vpm_backend`
- Frontend: `pnpm dev` in `vpm_frontend` (runs on http://localhost:3001)

### Features
- Health check display
- Upload image (file or URL) and search similar products
- Browse products and search by product
