How to run the Speed Insights React demo

1. Install dependencies

   cd speed-insights-app
   npm install

2. Start dev server

   npm run dev

3. Open the URL shown by Vite (usually http://localhost:5173) and you should see the demo.

Notes:
- Replace the URL passed to <SpeedInsights url="..." /> with your deployed site URL.
- This creates a small Vite React app inside `speed-insights-app` so it doesn't modify your existing static site.
- If you prefer integrating into your main site, you'll need to build this app and include the generated bundle in your site, or convert the entire project to a React/Vite structure.