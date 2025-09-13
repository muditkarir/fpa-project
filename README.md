
# Adobe FP&A Scenario Analysis

A modern React.js web app for scenario analysis, built with Vite and ready for Vercel deployment.

## Pages
- **Home:** Project overview
- **Scenario Analysis:** Base, Upside, Downside cases
- **Data Sources:** Financials, macro, FX context
- **About/Reflection:** Learnings and summary

## Getting Started

1. **Install dependencies:**
	```sh
	npm install
	```
2. **Run locally:**
	```sh
	npm run dev
	```
3. **Build for production:**
	```sh
	npm run build
	```

## Deploy to Vercel

This project is ready for seamless deployment on Vercel as a static SPA:

### Quick Deploy Steps

1. **Clone/Fork Repository**
   ```bash
   git clone <your-repo-url>
   cd fpa-project
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings** (auto-detected):
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables** (optional):
   ```
   VITE_APP_NAME=Adobe FP&A
   FRED_API_KEY=your_fred_api_key_here
   FINNHUB_TOKEN=your_finnhub_api_key_here
   ```

5. **Deploy** - Click "Deploy" and you're live!

### SPA Routing Behavior
- The `vercel.json` rewrite rule ensures deep links like `/scenario`, `/sources`, and `/about` work correctly after deployment
- All routes are redirected to `/` and handled by React Router client-side
- No server-side rendering - pure static site generation

### Verification
✅ Home page loads at your domain  
✅ Direct navigation to `/scenario` works  
✅ Page refresh on any route works  
✅ Browser back/forward navigation works

## API Keys & Backend
- Add API keys or backend URLs to the `.env` file as needed.
- **FRED API**: Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) to enable macro data on the `/sources` page
- **Finnhub API**: Get a free API key from [Finnhub](https://finnhub.io/) to enable company fundamentals and financial metrics

### API Security
- All API keys are kept server-side only via Vercel serverless functions
- No sensitive tokens are exposed to the client-side JavaScript
- Responses are cached appropriately to minimize API usage

---

*This project is intentionally simple for easy extension. Add your logic and integrations as needed!*
