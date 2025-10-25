from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Poll(Base):
    __tablename__ = "polls"
    id = Column(Integer, primary_key=True)
    question = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    likes = Column(Integer, default=0)

class PollOption(Base):
    __tablename__ = "poll_options"
    id = Column(Integer, primary_key=True)
    poll_id = Column(Integer, ForeignKey("polls.id"))
    text = Column(String, nullable=False)
    votes = Column(Integer, default=0)