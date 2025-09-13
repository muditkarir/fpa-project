
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
   HUGGINGFACE_TOKEN=your_huggingface_token_here
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
- **Hugging Face API**: Get a free API token from [Hugging Face](https://huggingface.co/settings/tokens) to enable NLP features (summarization, sentiment analysis, Q&A)
- **EDGAR API**: Set a proper User-Agent for SEC EDGAR requests (required by SEC fair-access guidelines)

### Local Development Setup
1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```
2. **Add your API keys to `.env`:**
   ```env
   FRED_API_KEY=your_fred_api_key_here
   FINNHUB_TOKEN=your_finnhub_token_here
   HUGGINGFACE_TOKEN=hf_your_huggingface_token_here
   EDGAR_USER_AGENT=YourCompany-AppName/1.0 your-email@example.com
   ```
3. **Start development server:**
   ```bash
   npm run dev
   ```

### Vercel Deployment Setup
1. **In Vercel Dashboard → Project Settings → Environment Variables**, add:
   - `FRED_API_KEY` = your FRED API key
   - `FINNHUB_TOKEN` = your Finnhub API token
   - `HUGGINGFACE_TOKEN` = your Hugging Face API token (starts with `hf_`)
   - `EDGAR_USER_AGENT` = `YourCompany-AppName/1.0 your-email@example.com`
2. **Redeploy** to apply the environment variables

### API Endpoints
The project includes serverless endpoints for financial data and NLP analysis:

**NLP Analysis (Hugging Face):**
- **POST** `/api/nlp/summarize` - Text summarization using facebook/bart-large-cnn
- **POST** `/api/nlp/tone` - Financial sentiment analysis using ProsusAI/finbert  
- **POST** `/api/nlp/qa` - Question answering using deepset/roberta-base-squad2

**EDGAR SEC Filings:**
- **GET** `/api/edgar/latest-filing?cik=0000796343&form=10-Q` - Get latest filing metadata
- **GET** `/api/edgar/latest-outlook?cik=0000796343` - Extract MD&A outlook from latest 10-Q

## LLM Assist (Hugging Face)

The `/insights` page provides AI-powered analysis of financial text using three specialized models:

### Models Used
- **ProsusAI/finbert** - Financial sentiment analysis that classifies text as positive, negative, or neutral with confidence scores
- **facebook/bart-large-cnn** - Text summarization that generates concise bullet points from management commentary and press releases
- **deepset/roberta-base-squad2** - Question answering that extracts specific information from financial documents

### Security & Environment Variables
- **🔐 Server-side only:** HUGGINGFACE_TOKEN stays secure in Vercel Functions - never exposed to browser
- **⚠️ Never use VITE_HUGGINGFACE_TOKEN** - Vite exposes all `VITE_*` variables to the browser, compromising security
- **✅ Correct:** Use `HUGGINGFACE_TOKEN` in serverless functions only

### Local Testing
1. **Get Hugging Face token:**
   ```bash
   # Visit https://huggingface.co/settings/tokens
   # Create new token with "Read" permissions
   ```
2. **Add to .env:**
   ```env
   HUGGINGFACE_TOKEN=hf_your_token_here
   ```
3. **Test locally:**
   ```bash
   npm run dev
   # Navigate to http://localhost:5173/insights
   # Paste sample text and test all three features
   ```

### Production Deployment
1. **Set environment variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `HUGGINGFACE_TOKEN` = `hf_your_token_here`
   - **Apply to:** Production + Preview environments
2. **Deploy and test:**
   ```bash
   # After deployment, visit your live URL + /insights
   # Example: https://your-app.vercel.app/insights
   ```
3. **Verify functionality:**
   - Paste management text → Click "Summarize" → Check for bullet points
   - Same text → Click "Analyze Tone" → Check for sentiment chips
   - Ask question about the text → Check for AI answer

### Usage & Limitations
- **📊 Best for:** Earnings transcripts, MD&A sections, press releases, management commentary
- **⚠️ Limitations:** Models may misread financial nuance or context; treat results as directional insights, not financial advice
- **🔄 Rate limits:** Hugging Face free tier has usage limits; responses may be delayed during model warm-up
- **📱 Responsive:** Full mobile support for analyzing text on any device

## EDGAR SEC Filing Analysis

The project includes serverless functions to automatically discover and extract outlook content from SEC filings:

### User-Agent Requirement
- **🔒 Required:** Set `EDGAR_USER_AGENT` environment variable following SEC guidelines
- **Format:** `CompanyName-AppName/version contact@email.com`
- **Example:** `MyCompany-FPAAnalysis/1.0 analyst@mycompany.com`
- **Why:** SEC requires proper identification for fair access compliance

### Available Endpoints
1. **Latest Filing Discovery** (`/api/edgar/latest-filing`):
   - Finds most recent 10-Q for any company by CIK
   - Returns filing metadata and direct HTML document URL
   - Defaults to Adobe (CIK: 0000796343) if no CIK provided

2. **MD&A Outlook Extraction** (`/api/edgar/latest-outlook`):
   - Automatically fetches latest 10-Q HTML content
   - Extracts "Item 2: Management's Discussion and Analysis" section
   - Uses heuristics to find outlook/forward-looking statements
   - Returns confidence level based on extraction quality

### Testing EDGAR Functions
```bash
# Test latest filing discovery
curl "https://your-app.vercel.app/api/edgar/latest-filing?cik=0000796343&form=10-Q"

# Test outlook extraction  
curl "https://your-app.vercel.app/api/edgar/latest-outlook?cik=0000796343"
```

### API Security
- All API keys are kept server-side only via Vercel serverless functions
- No sensitive tokens are exposed to the client-side JavaScript
- Responses are cached appropriately to minimize API usage

---

*This project is intentionally simple for easy extension. Add your logic and integrations as needed!*
