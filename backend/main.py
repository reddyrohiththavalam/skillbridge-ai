
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="SkillBridge AI API",
    description="Learning and employability platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProgressCreate(BaseModel):
    learner_name: str = Field(default="Student", max_length=100)
    course_title: str = Field(min_length=1, max_length=200)
    progress: int = Field(ge=0, le=100)


class AssessmentCreate(BaseModel):
    learner_name: str = Field(default="Student", max_length=100)
    assessment_name: str = Field(min_length=1, max_length=200)
    score: int = Field(ge=0)
    total_questions: int = Field(gt=0)


@app.get("/")
def home():
    return {
        "message": "Welcome to SkillBridge AI!",
        "status": "Backend is running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/progress")
def save_progress(
    item: ProgressCreate,
    db: Session = Depends(get_db),
):
    record = models.CourseProgress(
        learner_name=item.learner_name,
        course_title=item.course_title,
        progress=item.progress,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "learner_name": record.learner_name,
        "course_title": record.course_title,
        "progress": record.progress,
    }


@app.get("/api/progress")
def get_progress(db: Session = Depends(get_db)):
    records = (
        db.query(models.CourseProgress)
        .order_by(models.CourseProgress.id.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "learner_name": r.learner_name,
            "course_title": r.course_title,
            "progress": r.progress,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in records
    ]


@app.post("/api/assessments")
def save_assessment(
    item: AssessmentCreate,
    db: Session = Depends(get_db),
):
    if item.score > item.total_questions:
        raise HTTPException(
            status_code=400,
            detail="Score cannot exceed total questions.",
        )

    percentage = round(
        item.score / item.total_questions * 100, 2
    )

    record = models.AssessmentResult(
        learner_name=item.learner_name,
        assessment_name=item.assessment_name,
        score=item.score,
        total_questions=item.total_questions,
        percentage=percentage,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "assessment_name": record.assessment_name,
        "score": record.score,
        "total_questions": record.total_questions,
        "percentage": record.percentage,
    }


@app.get("/api/assessments")
def get_assessments(db: Session = Depends(get_db)):
    records = (
        db.query(models.AssessmentResult)
        .order_by(models.AssessmentResult.id.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "learner_name": r.learner_name,
            "assessment_name": r.assessment_name,
            "score": r.score,
            "total_questions": r.total_questions,
            "percentage": r.percentage,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]