import json
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.entities import University

router = APIRouter(prefix="/universities", tags=["Universities"])

def format_uni(u: University) -> dict:
    depts = []
    if u.departments:
        try:
            depts = json.loads(u.departments)
        except Exception:
            depts = [u.departments]

    tags = []
    if u.expertise_tags:
        try:
            tags = json.loads(u.expertise_tags)
        except Exception:
            tags = [u.expertise_tags]

    return {
        "id": u.id,
        "name": u.name,
        "code": u.code,
        "state": u.state,
        "district": u.district,
        "departments": depts,
        "expertiseTags": tags,
        "nodalOfficerName": u.nodal_officer_name,
        "nodalOfficerEmail": u.nodal_officer_email,
        "logoUrl": u.logo_url,
    }

@router.get("")
def list_universities(db: Session = Depends(get_db)):
    unis = db.query(University).all()
    return {
        "universities": [format_uni(u) for u in unis]
    }

@router.get("/{id}")
def get_university(id: str, db: Session = Depends(get_db)):
    u = db.query(University).filter(University.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="University not found")
    return format_uni(u)
