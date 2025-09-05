# Online University Query Chat (MERN + OpenAI)

## Setup

Backend (`server`):
1. Create `server/.env` with:
   - `OPENAI_API_KEY=sk-...`
   - `OPENAI_MODEL=gpt-5o-mini` (or another supported model)
   - `PORT=5000`
2. From `server/`: `npm run dev` (defaults to port 5000).

Frontend (`frontend`):
1. From `frontend/`: `npm run dev`.
2. Vite proxy forwards `/api` to `http://localhost:5000`.

## API
`POST /api/query` with body `{ "question": "..." }` -> `{ "answer": "..." }`.

## Notes
- GPT prompt is constrained to online programs with fees, duration, eligibility in one paragraph.
- The server hides your API key; the frontend calls `/api/query` only.


