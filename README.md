# RB Textile Mills

TanStack Start website for RB Textile Mills, configured for Vercel.

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the Supabase values.
4. Start the development server:

   ```bash
   npm run dev
   ```

## Deploy on Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Set these environment variables in Vercel:

   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose this in client code)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

4. Deploy. Vercel should detect the `tanstack-start` framework from `vercel.json`.
