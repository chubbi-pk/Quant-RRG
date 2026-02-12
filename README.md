# QuantRotate RRG Dashboard 🚀

A professional Relative Rotation Graph dashboard for visualizing S&P 500 sector rotation with real-time data and AI insights.

![RRG Dashboard](https://img.shields.io/badge/Status-Production-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![React](https://img.shields.io/badge/React-19-blue)

## 🎯 Features

✅ **Real-time Sector Rotation** - Track all 11 S&P 500 sector ETFs  
✅ **Interactive RRG Chart** - Visualize leading, weakening, lagging, and improving sectors  
✅ **Multiple Timeframes** - 5min to 1month intervals  
✅ **Adjustable Trails** - Historical rotation patterns (5-60 periods)  
✅ **AI Market Insights** - Powered by Google Gemini (optional)  
✅ **Data Table View** - Detailed numerical analysis

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📦 Build & Deploy

### Local Build
```bash
npm run build
# Output in /dist
```

### Deploy to GitHub Pages

**Automatic Method:**
1. Push to GitHub
2. Go to Settings → Pages → Source: GitHub Actions
3. Done! Auto-deploys on every push

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed deployment guide.

## 🔧 Configuration

### Gemini AI (Optional)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to GitHub Secrets: `GEMINI_API_KEY`
3. Redeploy

**Note:** Works without API key - insights are optional!

## 📁 Project Structure

```
/
├── components/RRGChart.tsx    # Main chart
├── services/
│   ├── dataService.ts         # Yahoo Finance
│   └── geminiService.ts       # AI insights
├── App.tsx                    # Main app
├── constants.tsx              # Sector configs
└── types.ts                   # TypeScript types
```

## 🐛 Troubleshooting

**Blank Screen?**
1. Check browser console (F12)
2. Verify `vite.config.ts` base path
3. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**CORS Errors?**
- Check `services/dataService.ts`
- Try different proxy (see troubleshooting guide)

## 🎨 Tech Stack

- React 19 + TypeScript
- D3.js for visualization
- Tailwind CSS
- Vite build tool
- Yahoo Finance API
- Google Gemini AI

## 📊 RRG Quadrants

- **🟢 Leading** - Strong RS, Strong momentum
- **🟡 Weakening** - Strong RS, Weak momentum
- **🔴 Lagging** - Weak RS, Weak momentum
- **🔵 Improving** - Weak RS, Strong momentum

## 📄 License

MIT

---

**Need Help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or open an issue!
