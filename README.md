# 💱 RupeeShift — LKR ⇄ INR Currency Converter

> Lightning-fast, bidirectional **Sri Lankan Rupee (LKR)** to **Indian Rupee (INR)** currency converter with live rates, custom rates, traveler cheat sheet, and offline capability. Ready for **GitHub** and **Vercel** with zero configuration required!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Features

- 🔄 **Bidirectional Real-Time Conversion**:
  - Convert **LKR ➔ INR** (Sri Lankan Rupee to Indian Rupee).
  - Convert **INR ➔ LKR** (Indian Rupee to Sri Lankan Rupee).
  - Type directly in *either* box — the other updates automatically in real time.
- ⚡ **Instant Swap**: Swap currencies with one click or keyboard shortcut (`Ctrl+S` / `Cmd+S`).
- 🌐 **Live Real-Time Exchange Rates**:
  - Automatically fetches the latest mid-market forex rates on startup.
  - Manual "Refresh" button to pull live rates on demand.
  - Graceful fallback with cached/offline rate in case of network interruption.
- 🛠️ **Custom Rate & Forex Fee Calculator**:
  - Override the exchange rate to match your bank, credit card, or local exchange counter.
  - Optional slider to account for 0% - 5% bank international card markups.
- 📋 **One-Click Copy & Quick Amount Chips**:
  - Copy formatted results with symbol directly to clipboard.
  - Quick-add denomination buttons (+500, +1,000, +5,000, +10,000, etc.).
- 📖 **Traveler & Shopper Cheat Sheet**:
  - Dynamic side-by-side reference table for everyday amounts (e.g. 100, 500, 1,000, 5,000, 10,000).
- 🗣️ **Number to Words**: Reads out the amount in verbal Indian numbering format (Lakhs / Crores / Thousands).
- 🌓 **Dark & Light Mode**: Clean, modern financial UI with system preference detection and localStorage persistence.
- 📱 **Mobile & PWA Ready**: Fully responsive layout designed for iOS, Android, tablets, and desktop.
- 🚀 **Zero Build Step & Zero Dependencies**: Deploys instantly in 2 seconds on Vercel without large `node_modules` or bundler overhead.

---

## 📁 Project Structure

```text
lkr-inr-converter/
├── index.html        # Clean semantic HTML5 with embedded SVG icons
├── styles.css        # Modern responsive design tokens (dark/light themes)
├── app.js            # Dual conversion logic, live FX API, offline fallback
├── dev-server.js     # Zero-dependency local development server
├── vercel.json       # Vercel deployment headers and routing config
├── package.json      # NPM scripts and project metadata
├── manifest.json     # PWA web manifest
├── .gitignore        # Git ignore rules
└── README.md         # Documentation & deployment guide
```

---

## 💻 Local Development

You can run this project locally in multiple ways:

### Option A: Using NPM (Recommended)
```bash
npm start
# or
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Using Node directly
```bash
node dev-server.js
```

### Option C: Direct Browser Opening
Simply double-click `index.html` in your file explorer or open it in any web browser.

---

## 🚀 Deploy to GitHub & Vercel

### Step 1: Push to GitHub

1. Initialize Git and make the first commit (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of LKR <-> INR converter webapp"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g., `lkr-inr-converter`).

3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/lkr-inr-converter.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy on Vercel

#### Method 1: Via Vercel Dashboard (Easiest - 1 Click)

1. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Under **"Import Git Repository"**, select your `lkr-inr-converter` repository.
4. Vercel will automatically detect the static project:
   - **Framework Preset**: `Other` (Static)
   - **Root Directory**: `./`
   - **Build Command**: Leave default or empty
   - **Output Directory**: Leave default or empty
5. Click **"Deploy"**.
6. Within 5 seconds, your live URL will be active (e.g., `https://lkr-inr-converter.vercel.app`)!
7. *Any future `git push` to your GitHub `main` branch will automatically trigger a new deployment.*

#### Method 2: Via Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI globally (if needed)
npm i -g vercel

# Deploy directly from the project directory
vercel

# Deploy to production
vercel --prod
```

---

### Step 3: (Optional) Deploy to GitHub Pages

You can also host this directly on GitHub Pages for free:
1. In your GitHub repository, go to **Settings** ➔ **Pages**.
2. Under **Build and deployment** ➔ **Source**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` folder.
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/lkr-inr-converter/`.

---

## 🔌 API & Exchange Rates

- **Primary API**: [open.er-api.com](https://open.er-api.com/) — Free, reliable public exchange rate endpoint with no API keys required.
- **Secondary Fallback API**: [@fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange-api) on jsDelivr CDN.
- **Offline / Static Fallback**: Reference rate is stored locally to ensure the app works even completely offline or on flight mode.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
