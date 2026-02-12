# RRG Dashboard - Blank Screen Troubleshooting Guide

## Issues Found and Fixed

### 1. **CORS Proxy Issue** (CRITICAL)
**Problem:** The CORS proxy `https://corsproxy.io/?` is unreliable and often blocked
**Fix:** Changed to `https://api.allorigins.win/raw?url=` which is more stable
**Location:** `services/dataService.ts` line 5

### 2. **Import Path Issues**
**Problem:** Your uploaded files have imports like:
- `import { getRealSectorRotationData } from './services/dataService';`
- `import RRGChart from './components/RRGChart';`

These paths assume the files are in subdirectories, but when viewing your file structure, the paths might not match the actual deployment structure.

**Fix:** Verify your GitHub repository structure matches:
```
/
├── App.tsx
├── index.tsx
├── index.html
├── constants.tsx
├── types.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── components/
│   └── RRGChart.tsx
└── services/
    ├── dataService.ts
    └── geminiService.ts
```

### 3. **Gemini API Configuration**
**Problem:** The Gemini API model name and Type enum usage may cause issues
**Fix:** 
- Changed model to `"gemini-2.0-flash-exp"`
- Simplified the response schema configuration
- Added better null checks for API key

### 4. **Console Logging for Debugging**
**Fix:** Added extensive console.log statements in `dataService.ts` to help debug data fetching issues

### 5. **Error Handling**
**Fix:** Improved error messages to be more descriptive and user-friendly

## How to Deploy to GitHub Pages

### Step 1: Fix vite.config.ts
Your `vite.config.ts` should be named `vite.config.ts` not `vite_config.ts`:

```typescript
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // Change to '/repository-name/' if not using custom domain
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
```

### Step 2: Update package.json
Add these scripts if they're not already there:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build"
  }
}
```

### Step 3: Create .github/workflows/deploy.yml
Create this file to enable GitHub Actions deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
          
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 4: Enable GitHub Pages
1. Go to your GitHub repository
2. Click "Settings"
3. Click "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. Save

### Step 5: Check Browser Console
Once deployed, if you still see a blank screen:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check the Network tab to see if files are loading

## Common Deployment Issues

### Issue: "Failed to fetch" errors
**Solution:** The CORS proxy may be rate-limited. Try these alternatives in `dataService.ts`:
- `https://corsproxy.io/?` (original, sometimes works)
- `https://api.allorigins.win/raw?url=` (recommended)
- `https://api.codetabs.com/v1/proxy?quest=` (backup)

### Issue: Blank white screen, no console errors
**Check:**
1. Is `index.html` loading? (View source)
2. Are JavaScript files being loaded? (Network tab)
3. Is there a `<div id="root"></div>` in index.html?
4. Is React rendering? (Check React DevTools)

### Issue: "Cannot find module" errors
**Solution:** 
1. Verify all imports use the correct file extensions (.tsx, .ts)
2. Check that paths are relative and correct
3. Make sure tsconfig.json has correct paths configuration

### Issue: Gemini AI not working
**Solution:**
1. Set `GEMINI_API_KEY` in GitHub repository secrets
2. Update the GitHub Actions workflow to pass it as an environment variable
3. Or simply let it fail gracefully - the app works without AI insights

## Testing Locally First

Before deploying, always test locally:

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and check:
1. Does the page load?
2. Does data fetch successfully?
3. Do console logs show the expected data?
4. Are there any errors in the console?

## Key Files to Check

1. **index.html** - Make sure `<div id="root"></div>` exists
2. **index.tsx** - Make sure it's importing and rendering App
3. **App.tsx** - Make sure imports are correct
4. **vite.config.ts** - Make sure base path is correct
5. **package.json** - Make sure all dependencies are listed

## Final Checklist

- [ ] File structure matches expected layout
- [ ] vite.config.ts exists (not vite_config.ts)
- [ ] All imports use correct paths
- [ ] CORS proxy is set to working URL
- [ ] GitHub Actions workflow exists
- [ ] GitHub Pages is enabled
- [ ] Repository is public (or you have Pages enabled for private repos)
- [ ] Built locally successfully with `npm run build`
- [ ] Checked dist/ folder has index.html and assets
