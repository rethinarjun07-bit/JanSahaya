import json
from typing import List, Dict, Any, Optional

def match_solvers_for_challenge(
    challenge: Dict[str, Any],
    solvers: List[Dict[str, Any]],
    universities: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Multi-factor explainable recommendation algorithm that scores researchers,
    innovators, and universities against an intake challenge.
    """
    results = []
    ch_category = (challenge.get("category") or "").lower()
    ch_tags = challenge.get("aiTags") or []
    if isinstance(ch_tags, str):
        try:
            ch_tags = json.loads(ch_tags)
        except Exception:
            ch_tags = [ch_tags]
    ch_tags_set = set(t.lower() for t in ch_tags)
    ch_district = (challenge.get("district") or "").lower()

    for solver in solvers:
        score = 0.0
        explanations = []

        # 1. Skills / Domain Alignment (Max 40 pts)
        solver_skills = solver.get("skills") or []
        if isinstance(solver_skills, str):
            try:
                solver_skills = json.loads(solver_skills)
            except Exception:
                solver_skills = [solver_skills]
        solver_skills_set = set(s.lower() for s in solver_skills)

        skill_overlap = ch_tags_set.intersection(solver_skills_set)
        if skill_overlap:
            overlap_score = min(40.0, len(skill_overlap) * 15.0)
            score += overlap_score
            explanations.append(f"Domain skills match: {', '.join(skill_overlap)}")
        elif any(term in s for s in solver_skills_set for term in ch_category.split()):
            score += 25.0
            explanations.append(f"Category alignment in {challenge.get('category')}")
        else:
            score += 10.0

        # 2. Institutional Department Match (Max 30 pts)
        solver_org = (solver.get("organization") or "").lower()
        matched_uni = next(
            (u for u in universities if u.get("name", "").lower() in solver_org or solver_org in u.get("name", "").lower()),
            None
        )
        if matched_uni:
            score += 25.0
            explanations.append(f"Affiliated with empaneled nodal institution: {matched_uni.get('name')}")
        else:
            score += 15.0

        # 3. District / Regional Proximity (Max 15 pts)
        solver_district = (solver.get("district") or "").lower()
        if solver_district and solver_district == ch_district:
            score += 15.0
            explanations.append(f"Located in same district ({challenge.get('district')}) for rapid field deployment")
        elif solver_district:
            score += 8.0
            explanations.append(f"Regional operational base in Jharkhand ({solver.get('district')})")

        # 4. Karma Points / Past Track Record (Max 15 pts)
        karma = solver.get("karmaPoints", 100)
        karma_score = min(15.0, (karma / 1000.0) * 15.0)
        score += karma_score
        if karma >= 500:
            explanations.append(f"High resolution credibility rating (Karma: {karma})")

        final_score = min(98.0, round(score, 1))

        results.append({
            "solverId": solver.get("id"),
            "name": solver.get("name"),
            "organization": solver.get("organization"),
            "designation": solver.get("designation"),
            "district": solver.get("district"),
            "matchScore": final_score,
            "matchTier": "EXCELLENT" if final_score >= 80 else ("STRONG" if final_score >= 60 else "MODERATE"),
            "explanations": explanations,
            "karmaPoints": solver.get("karmaPoints", 100),
            "avatar": solver.get("avatar"),
        })

    # Sort descending by match score
    results.sort(key=lambda x: x["matchScore"], reverse=True)
    return results
