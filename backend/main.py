from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import SessionLocal, init_db
from models import Poll, PollOption
import json

app = FastAPI()

# Initialize database
init_db()

# CORS configuration - Must be configured properly for frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using wildcard origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request validation
class PollCreate(BaseModel):
    question: str
    options: List[str]

class VoteRequest(BaseModel):
    option_id: int

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# API Endpoints
@app.post("/api/polls")
async def create_poll(poll_data: PollCreate, db: Session = Depends(get_db)):
    """Create a new poll with options"""
    # Create poll
    new_poll = Poll(question=poll_data.question)
    db.add(new_poll)
    db.commit()
    db.refresh(new_poll)
    
    # Create options
    for option_text in poll_data.options:
        option = PollOption(poll_id=new_poll.id, text=option_text)
        db.add(option)
    
    db.commit()
    
    # Broadcast new poll to all connected clients
    await manager.broadcast({"type": "new_poll", "poll_id": new_poll.id})
    
    return {"id": new_poll.id, "question": new_poll.question}

@app.get("/api/polls")
async def get_polls(db: Session = Depends(get_db)):
    """Get all polls with their options and vote counts"""
    polls = db.query(Poll).all()
    result = []
    
    for poll in polls:
        options = db.query(PollOption).filter(PollOption.poll_id == poll.id).all()
        result.append({
            "id": poll.id,
            "question": poll.question,
            "likes": poll.likes,
            "created_at": poll.created_at.isoformat(),
            "options": [
                {
                    "id": opt.id,
                    "text": opt.text,
                    "votes": opt.votes
                }
                for opt in options
            ]
        })
    
    return result

@app.get("/api/polls/{poll_id}")
async def get_poll(poll_id: int, db: Session = Depends(get_db)):
    """Get a specific poll by ID"""
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    options = db.query(PollOption).filter(PollOption.poll_id == poll_id).all()
    
    return {
        "id": poll.id,
        "question": poll.question,
        "likes": poll.likes,
        "created_at": poll.created_at.isoformat(),
        "options": [
            {
                "id": opt.id,
                "text": opt.text,
                "votes": opt.votes
            }
            for opt in options
        ]
    }

@app.post("/api/polls/{poll_id}/vote")
async def vote(poll_id: int, vote_data: VoteRequest, db: Session = Depends(get_db)):
    """Vote on a poll option"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if option exists
    option = db.query(PollOption).filter(PollOption.id == vote_data.option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    
    # Increment vote count
    option.votes += 1
    db.commit()
    
    # Broadcast vote update to all connected clients
    await manager.broadcast({
        "type": "vote_update",
        "poll_id": poll_id,
        "option_id": vote_data.option_id,
        "new_votes": option.votes
    })
    
    return {"success": True, "votes": option.votes}

@app.post("/api/polls/{poll_id}/like")
async def like_poll(poll_id: int, db: Session = Depends(get_db)):
    """Like a poll"""
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Increment like count
    poll.likes += 1
    db.commit()
    
    # Broadcast like update to all connected clients
    await manager.broadcast({
        "type": "like_update",
        "poll_id": poll_id,
        "new_likes": poll.likes
    })
    
    return {"success": True, "likes": poll.likes}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "QuickPoll API is running", "version": "1.0.0"}
