# QuickPoll - Real-Time Polling Platform

A modern polling application with real-time updates built using FastAPI and Next.js. Create polls, vote, and see results update instantly across all users via WebSocket.

## Features

- **Real-Time Updates** - Live vote/like counts via WebSocket
- **Create Polls** - Custom questions with multiple options
- **Vote & Like** - Interactive voting with visual feedback
- **Share Polls** - Copy poll link to clipboard
- **Delete Polls** - Remove polls with confirmation dialog
- **Toast Notifications** - Success/error feedback
- **Responsive UI** - Clean, minimal ChatGPT-inspired design
- **Dark Mode** - Full dark mode support

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, WebSockets  
**Frontend:** Next.js 16, TypeScript, Tailwind CSS, React

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/polls` | Get all polls |
| POST | `/api/polls` | Create poll |
| POST | `/api/polls/{id}/vote` | Vote on option |
| POST | `/api/polls/{id}/like` | Like poll |
| DELETE | `/api/polls/{id}` | Delete poll |
| WS | `/ws` | Real-time updates |

## Testing Real-Time

1. Open two browser windows at `http://localhost:3000`
2. Create/vote/like in one window
3. Watch updates appear instantly in both windows

## Project Structure

```
quickpoll/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py        # Database models
│   ├── database.py      # DB configuration
│   └── requirements.txt
└── frontend/
    ├── app/
    │   └── page.tsx     # Main page
    ├── components/
    │   ├── PollCard.tsx
    │   ├── Toast.tsx
    │   └── ConfirmDialog.tsx
    └── lib/
        └── useWebSocket.ts
```

## Built For

Lyzr AI Full-Stack Developer Challenge

## License

MIT
