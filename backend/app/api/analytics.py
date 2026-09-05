from collections import defaultdict
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func

from backend.app.db.session import get_db
from backend.app.models.entities import Challenge, Solution, User, University

router = APIRouter(prefix="/analytics", tags=["Analytics & GIS Heatmap"])

@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    total_challenges = db.query(Challenge).count()
    verified_challenges = db.query(Challenge).filter(Challenge.status.in_(["VERIFIED", "ASSIGNED", "IN_PROGRESS", "SOLVED"])).count()
    solved_challenges = db.query(Challenge).filter(Challenge.status == "SOLVED").count()
    in_progress = db.query(Challenge).filter(Challenge.status == "IN_PROGRESS").count()

    total_solutions = db.query(Solution).count()
    endorsed_solutions = db.query(Solution).filter(Solution.govt_endorsed == True).count()
    total_users = db.query(User).count()
    total_universities = db.query(University).count()

    # Category breakdown
    challenges = db.query(Challenge).all()
    category_counts = defaultdict(int)
    district_counts = defaultdict(int)
    severity_counts = defaultdict(int)
    heatmap_points = []

    for c in challenges:
        category_counts[c.category] += 1
        district_counts[c.district] += 1
        severity_counts[c.severity] += 1

        heatmap_points.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "severity": c.severity,
            "urgencyScore": c.urgency_score,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "district": c.district,
            "address": c.address,
        })

    # Convert to list formats for frontend Recharts
    category_data = [{"category": k, "count": v} for k, v in category_counts.items()]
    district_data = [{"district": k, "count": v} for k, v in district_counts.items()]
    severity_data = [{"severity": k, "count": v} for k, v in severity_counts.items()]

    resolution_rate = round((solved_challenges / total_challenges * 100), 1) if total_challenges > 0 else 0.0

    return {
        "overview": {
            "totalChallenges": total_challenges,
            "verifiedChallenges": verified_challenges,
            "solvedChallenges": solved_challenges,
            "inProgress": in_progress,
            "totalSolutions": total_solutions,
            "endorsedSolutions": endorsed_solutions,
            "totalUsers": total_users,
            "totalUniversities": total_universities,
            "resolutionRate": resolution_rate,
        },
        "byCategory": category_data,
        "byDistrict": district_data,
        "bySeverity": severity_data,
        "gisHeatmapPoints": heatmap_points,
    }
