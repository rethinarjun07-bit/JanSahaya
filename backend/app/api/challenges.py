import json
from typing import Optional, List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, joinedload
# pyrefly: ignore [missing-import]
from sqlalchemy import desc, or_

from backend.app.db.session import get_db
from backend.app.models.entities import Challenge, User, Upvote, Comment, Solution, University
from backend.app.schemas.domain import ChallengeCreate, ChallengeUpdate, CommentCreate
from backend.app.api.deps import get_current_user, get_current_user_optional
from backend.app.services.ai.classifier import classify_challenge
from backend.app.services.ai.duplicate_detector import duplicate_detector

router = APIRouter(prefix="/challenges", tags=["Challenges"])

def format_challenge_dict(c: Challenge, current_user_id: Optional[str] = None) -> dict:
    media_urls = []
    if c.media_urls:
        try:
            media_urls = json.loads(c.media_urls)
        except Exception:
            media_urls = [c.media_urls]

    ai_tags = []
    if c.ai_tags:
        try:
            ai_tags = json.loads(c.ai_tags)
        except Exception:
            ai_tags = [c.ai_tags]

    upvotes_count = len(c.upvotes) if c.upvotes is not None else 0
    solutions_count = len(c.solutions) if c.solutions is not None else 0
    comments_count = len(c.comments) if c.comments is not None else 0

    has_upvoted = False
    if current_user_id and c.upvotes:
        has_upvoted = any(u.user_id == current_user_id for u in c.upvotes)

    creator_info = None
    if c.created_by:
        creator_info = {
            "id": c.created_by.id,
            "name": c.created_by.name,
            "email": c.created_by.email,
            "role": c.created_by.role,
            "avatar": c.created_by.avatar,
            "organization": c.created_by.organization,
        }

    uni_info = None
    if c.assigned_university:
        uni_info = {
            "id": c.assigned_university.id,
            "name": c.assigned_university.name,
            "code": c.assigned_university.code,
            "district": c.assigned_university.district,
        }

    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "category": c.category,
        "severity": c.severity,
        "urgencyScore": c.urgency_score,
        "status": c.status,
        "latitude": c.latitude,
        "longitude": c.longitude,
        "address": c.address,
        "district": c.district,
        "state": c.state,
        "pincode": c.pincode,
        "mediaUrls": media_urls,
        "audioUrl": c.audio_url,
        "voiceTranscript": c.voice_transcript,
        "language": c.language,
        "isMaster": c.is_master,
        "masterChallengeId": c.master_challenge_id,
        "duplicateScore": c.duplicate_score,
        "aiTags": ai_tags,
        "predictedSector": c.predicted_sector,
        "autoAssignedUniversity": c.auto_assigned_university,
        "officialNotes": c.official_notes,
        "verifiedAt": c.verified_at.isoformat() if c.verified_at else None,
        "verifiedById": c.verified_by_id,
        "assignedUniversityId": c.assigned_university_id,
        "assignedDepartment": c.assigned_department,
        "viewCount": c.view_count,
        "createdAt": c.created_at.isoformat() if c.created_at else None,
        "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
        "createdById": c.created_by_id,
        "createdBy": creator_info,
        "assignedUniversity": uni_info,
        "_count": {
            "upvotes": upvotes_count,
            "solutions": solutions_count,
            "comments": comments_count,
        },
        "hasUpvoted": has_upvoted,
    }

@router.get("")
def list_challenges(
    category: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Challenge).options(
        joinedload(Challenge.created_by),
        joinedload(Challenge.upvotes),
        joinedload(Challenge.solutions),
        joinedload(Challenge.comments),
        joinedload(Challenge.assigned_university),
    )

    if category and category != "ALL":
        query = query.filter(Challenge.category == category)
    if district and district != "ALL":
        query = query.filter(Challenge.district == district)
    if status and status != "ALL":
        query = query.filter(Challenge.status == status)
    if severity and severity != "ALL":
        query = query.filter(Challenge.severity == severity)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Challenge.title.ilike(term),
                Challenge.description.ilike(term),
                Challenge.district.ilike(term),
                Challenge.category.ilike(term)
            )
        )

    total = query.count()
    challenges = query.order_by(desc(Challenge.created_at)).offset(offset).limit(limit).all()

    current_id = current_user.id if current_user else None
    return {
        "challenges": [format_challenge_dict(c, current_id) for c in challenges],
        "total": total,
    }

@router.get("/{id}")
def get_challenge(
    id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    c = db.query(Challenge).options(
        joinedload(Challenge.created_by),
        joinedload(Challenge.upvotes),
        joinedload(Challenge.solutions).joinedload(Solution.author),
        joinedload(Challenge.solutions).joinedload(Solution.reviews),
        joinedload(Challenge.comments).joinedload(Comment.user),
        joinedload(Challenge.assigned_university),
    ).filter(Challenge.id == id).first()

    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Increment views
    c.view_count = (c.view_count or 0) + 1
    db.commit()

    current_id = current_user.id if current_user else None
    result = format_challenge_dict(c, current_id)

    # Attach full solutions list
    solutions_list = []
    for s in c.solutions:
        solutions_list.append({
            "id": s.id,
            "title": s.title,
            "abstract": s.abstract,
            "teamName": s.team_name,
            "status": s.status,
            "milestoneStage": s.milestone_stage,
            "budgetEstimate": s.budget_estimate,
            "timelineMonths": s.timeline_months,
            "govtEndorsed": s.govt_endorsed,
            "author": {
                "id": s.author.id,
                "name": s.author.name,
                "organization": s.author.organization,
                "avatar": s.author.avatar,
            } if s.author else None,
            "createdAt": s.created_at.isoformat() if s.created_at else None,
        })
    result["solutions"] = solutions_list

    # Attach comments
    comments_list = []
    for comm in c.comments:
        comments_list.append({
            "id": comm.id,
            "content": comm.content,
            "audioUrl": comm.audio_url,
            "createdAt": comm.created_at.isoformat() if comm.created_at else None,
            "user": {
                "id": comm.user.id,
                "name": comm.user.name,
                "role": comm.user.role,
                "avatar": comm.user.avatar,
            } if comm.user else None,
        })
    result["comments"] = comments_list

    return result

@router.post("")
def create_challenge(
    req: ChallengeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Automatic AI Classification & Urgency Scoring
    ai_classification = classify_challenge(req.title, req.description)

    # 2. Check for duplicate challenges in DB
    existing_challenges = db.query(Challenge.id, Challenge.title, Challenge.description, Challenge.latitude, Challenge.longitude, Challenge.district, Challenge.category, Challenge.severity, Challenge.status).limit(200).all()
    candidate_dicts = [
        {
            "id": ec.id,
            "title": ec.title,
            "description": ec.description,
            "latitude": ec.latitude,
            "longitude": ec.longitude,
            "district": ec.district,
            "category": ec.category,
            "severity": ec.severity,
            "status": ec.status,
        }
        for ec in existing_challenges
    ]

    dup_result = duplicate_detector.detect_duplicates(
        new_title=req.title,
        new_description=req.description,
        candidate_challenges=candidate_dicts,
        new_lat=req.latitude,
        new_lon=req.longitude,
    )

    duplicate_score = dup_result.get("highestScore", 0.0)

    # Merge tags
    tags = req.aiTags if req.aiTags else ai_classification.get("tags", [])

    new_challenge = Challenge(
        title=req.title,
        description=req.description,
        category=req.category or ai_classification.get("predictedCategory", "Disaster Management"),
        severity=req.severity or ai_classification.get("severity", "MEDIUM"),
        urgency_score=req.urgencyScore or ai_classification.get("urgencyScore", 50),
        status="SUBMITTED",
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.address,
        district=req.district,
        state=req.state or "Jharkhand",
        pincode=req.pincode,
        media_urls=json.dumps(req.mediaUrls or []),
        audio_url=req.audioUrl,
        voice_transcript=req.voiceTranscript,
        language=req.language or "en",
        duplicate_score=duplicate_score,
        ai_tags=json.dumps(tags),
        predicted_sector=ai_classification.get("predictedCategory"),
        auto_assigned_university=ai_classification.get("recommendedUniversity", {}).get("name"),
        created_by_id=current_user.id,
    )

    db.add(new_challenge)
    
    # Award karma points to citizen (+50)
    current_user.karma_points = (current_user.karma_points or 100) + 50

    db.commit()
    db.refresh(new_challenge)

    return {
        "challenge": format_challenge_dict(new_challenge, current_user.id),
        "aiClassification": ai_classification,
        "duplicateCheck": dup_result,
    }

@router.post("/{id}/upvote")
def toggle_upvote(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    existing_upvote = db.query(Upvote).filter(
        Upvote.user_id == current_user.id,
        Upvote.challenge_id == id
    ).first()

    if existing_upvote:
        db.delete(existing_upvote)
        db.commit()
        has_upvoted = False
    else:
        new_upvote = Upvote(user_id=current_user.id, challenge_id=id)
        db.add(new_upvote)
        current_user.karma_points = (current_user.karma_points or 100) + 5
        db.commit()
        has_upvoted = True

    total_upvotes = db.query(Upvote).filter(Upvote.challenge_id == id).count()
    return {
        "hasUpvoted": has_upvoted,
        "upvotes": total_upvotes,
    }

@router.post("/{id}/comments")
def add_comment(
    id: str,
    req: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    new_comment = Comment(
        content=req.content,
        audio_url=req.audioUrl,
        challenge_id=id,
        user_id=current_user.id,
    )
    db.add(new_comment)
    current_user.karma_points = (current_user.karma_points or 100) + 10
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "audioUrl": new_comment.audio_url,
        "createdAt": new_comment.created_at.isoformat(),
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "role": current_user.role,
            "avatar": current_user.avatar,
        }
    }

@router.post("/simulate-alert")
def simulate_alert(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulates an urgent disaster incident report for Hackathon demonstrations"""
    alert = Challenge(
        title="[SIMULATION] Embankment Breach Alert on Subarnarekha River",
        description="Flash flood warning: River water levels surged by 3.2 meters following heavy rainfall. Right embankment showing structural seepage near Birsanagar, Jamshedpur. Risk of inundating residential settlements.",
        category="Disaster Management",
        severity="CRITICAL",
        urgency_score=94,
        status="SUBMITTED",
        latitude=22.8046,
        longitude=86.2029,
        address="Subarnarekha River Bank, Birsanagar, Jamshedpur",
        district="East Singhbhum",
        state="Jharkhand",
        pincode="831019",
        media_urls="[]",
        ai_tags=json.dumps(["Flood & Drainage", "River Erosion & Silt", "Infrastructure"]),
        predicted_sector="Disaster Management",
        auto_assigned_university="NIT Jamshedpur",
        created_by_id=current_user.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "message": "Emergency alert simulated successfully",
        "challenge": format_challenge_dict(alert, current_user.id),
    }
