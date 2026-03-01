# Vercel Deployment Configuration

## Build Settings
Build Command: `npm run build`
Output Directory: `.next`
Install Command: `npm install`

## Environment Variables (add these in Vercel Dashboard)

### Required Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

## Deployment Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/concert-seating.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Configure Supabase**
   - Add your Vercel deployment URL to Supabase allowed origins
   - Go to: Supabase Dashboard > Authentication > URL Configuration
   - Add: `https://your-app.vercel.app`

## Auto-Deploy
Every push to `main` branch will trigger automatic deployment.

## Custom Domain (Optional)
Add your custom domain in Vercel Dashboard > Settings > Domains

## Performance Tips:
- Images are automatically optimized by Next.js
- Static pages are cached at the edge
- API routes run on Vercel's serverless functions
- Database queries are optimized with Supabase connection pooling
