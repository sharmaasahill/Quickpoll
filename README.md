# QuickPoll - Real-Time Opinion Polling Platform

A real-time polling application built with FastAPI and Next.js where users can create polls, vote, and see live updates across all connected users using WebSocket technology.

## Features

- Create polls with multiple custom options
- Vote on polls with instant visual feedback
- Like polls to show appreciation
- Real-time updates across all connected users via WebSocket
- Responsive modern UI with Tailwind CSS
- Live connection status indicator

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - SQL toolkit and ORM
- SQLite - Lightweight database
- WebSockets - Real-time bidirectional communication
- Pydantic - Data validation

### Frontend
- Next.js 16 - React framework with App Router
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Lucide React - Icon library
- WebSocket API - Native browser WebSocket support

## Prerequisites

- Python 3.8 or higher
- Node.js 18.x or higher
- npm

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd quickpoll
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --port 8000
```

Backend will be running at: `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend will be running at: `http://localhost:3000`

## Testing Real-Time Updates

1. Open two browser windows at `http://localhost:3000`
2. Create a poll in the first window
3. Vote on the poll in one window
4. Watch the vote count update instantly in both windows
5. Like a poll and see it update in real-time

## Project Structure

```
quickpoll/
├── backend/
│   ├── main.py              # FastAPI application and routes
│   ├── models.py            # SQLAlchemy database models
│   ├── database.py          # Database configuration
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── page.tsx         # Main page
    │   ├── layout.tsx       # Root layout
    │   └── globals.css      # Global styles
    ├── components/
    │   └── PollCard.tsx     # Poll card component
    ├── lib/
    │   └── useWebSocket.ts  # WebSocket hook
    └── package.json         # Node dependencies
```

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/polls` | Get all polls |
| GET | `/api/polls/{poll_id}` | Get specific poll |
| POST | `/api/polls` | Create new poll |
| POST | `/api/polls/{poll_id}/vote` | Vote on poll option |
| POST | `/api/polls/{poll_id}/like` | Like a poll |

### WebSocket

- **Endpoint**: `ws://localhost:8000/ws`
- **Purpose**: Real-time updates for votes and likes

### Example Usage

**Create a Poll:**
```bash
curl -X POST "http://localhost:8000/api/polls" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite programming language?",
    "options": ["Python", "JavaScript", "TypeScript", "Go"]
  }'
```

**Get All Polls:**
```bash
curl "http://localhost:8000/api/polls"
```

**Vote:**
```bash
curl -X POST "http://localhost:8000/api/polls/1/vote" \
  -H "Content-Type: application/json" \
  -d '{"option_id": 1}'
```

## How It Works

### Real-Time Architecture

1. **User Action**: User votes or likes a poll
2. **Backend Update**: FastAPI updates the database
3. **WebSocket Broadcast**: Backend broadcasts update to all connected clients
4. **Client Update**: All connected browsers receive update and refresh data
5. **Live UI**: Users see changes instantly without page refresh

### Connection Flow

- Frontend establishes WebSocket connection on page load
- Connection status shown with live indicator (green = connected)
- Automatic reconnection with exponential backoff if disconnected
- Graceful error handling when backend is unavailable

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

### CORS errors
- Make sure backend is running before starting frontend
- Backend CORS is configured to allow all origins in development

### Real-time updates not working
- Verify backend is running on port 8000
- Check browser console for WebSocket connection status
- Ensure both browser windows are open simultaneously

## Development Notes

- Database (SQLite) is created automatically on first run
- Vote tracking is client-side only (refresh allows voting again)
- WebSocket attempts up to 10 reconnections with exponential backoff
- All errors are handled gracefully with user-friendly messages

## Built For

Lyzr AI Full-Stack Developer Challenge

## License

MIT License
