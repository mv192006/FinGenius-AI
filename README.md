# FinGenius AI

An AI-assisted personal finance dashboard for expense tracking, savings forecasting, investment planning, financial health scoring, fraud signals, and conversational guidance.

## Run locally

```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev
```

The browser should open automatically at `http://127.0.0.1:5173`. If it does not,
open that address manually. Keep the terminal window running while using the app.
The API runs on `http://localhost:5001`.

The app runs with seeded demo data by default. Copy `server/.env.example` to `server/.env` to configure MongoDB or Gemini.
