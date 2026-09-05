import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.entities import Challenge, User, University
from backend.app.schemas.domain import DuplicateCheckRequest
from backend.app.services.ai.duplicate_detector import duplicate_detector
from backend.app.services.ai.solver_matcher import match_solvers_for_challenge
from backend.app.services.ai.summarizer import summarize_disaster_report

router = APIRouter(tags=["AI & NLP Services"])

@router.post("/duplicate-check")
def duplicate_check(req: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """
    Evaluates intake challenge title and description against all registered challenges.
    Returns TF-IDF cosine similarity scores and duplicate warnings.
    """
    candidates = db.query(Challenge).filter(Challenge.status != "MERGED").limit(300).all()
    candidate_dicts = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "district": c.district,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "severity": c.severity,
            "status": c.status,
        }
        for c in candidates
    ]

    result = duplicate_detector.detect_duplicates(
        new_title=req.title,
        new_description=req.description,
        candidate_challenges=candidate_dicts,
    )
    return result

@router.get("/match-solvers")
def get_solver_matches(
    challengeId: str = Query(..., description="ID of the challenge to match solvers for"),
    db: Session = Depends(get_db)
):
    """
    Ranks empaneled universities, researchers, and innovation labs based on domain alignment,
    department expertise tags, and historical resolution credentials.
    """
    challenge = db.query(Challenge).filter(Challenge.id == challengeId).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    solvers = db.query(User).filter(User.role.in_(["SOLVER", "INDUSTRY"])).all()
    universities = db.query(University).all()

    ch_dict = {
        "id": challenge.id,
        "title": challenge.title,
        "category": challenge.category,
        "district": challenge.district,
        "aiTags": challenge.ai_tags,
    }

    solvers_list = [
        {
            "id": s.id,
            "name": s.name,
            "organization": s.organization,
            "designation": s.designation,
            "district": s.district,
            "skills": s.skills,
            "karmaPoints": s.karma_points,
            "avatar": s.avatar,
        }
        for s in solvers
    ]

    unis_list = [
        {
            "id": u.id,
            "name": u.name,
            "code": u.code,
            "district": u.district,
            "expertiseTags": u.expertise_tags,
        }
        for u in universities
    ]

    matched_results = match_solvers_for_challenge(ch_dict, solvers_list, unis_list)

    return {
        "challengeId": challengeId,
        "challengeTitle": challenge.title,
        "category": challenge.category,
        "totalMatches": len(matched_results),
        "matches": matched_results,
    }

@router.post("/summarize-report")
def get_disaster_summary(
    title: str,
    description: str,
    category: str = "Disaster Management",
    district: str = "Ranchi"
):
    """
    Generates an executive triage brief and immediate intervention actions using NLP / Gemini.
    """
    return summarize_disaster_report(title, description, category, district)
