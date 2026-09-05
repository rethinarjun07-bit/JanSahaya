"""
JanSahaya Python FastAPI Backend Verification Script
Tests database models, AI/NLP classifier, Scikit-learn TF-IDF duplicate detector,
and solver matching engine.
"""
import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add workspace root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_tests():
    print("==================================================")
    print("  Testing JanSahaya Python Services")
    print("==================================================")

    # 1. Test AI Classifier & Urgency Scorer
    from backend.app.services.ai.classifier import classify_challenge
    print("\n[1] Testing AI NLP Classifier & Urgency Scorer...")
    test_title = "Underground coal seam fire and ground collapse near Jharia"
    test_desc = "Critical emergency: toxic carbon monoxide gas detected and ground collapsed near school."
    result = classify_challenge(test_title, test_desc)
    print(f"  - Input Title: '{test_title}'")
    print(f"  - Predicted Category: {result['predictedCategory']}")
    print(f"  - Severity: {result['severity']} (Urgency Score: {result['urgencyScore']}/100)")
    print(f"  - Emergency Flag: {result['isDisasterEmergency']}")
    print(f"  - Recommended University: {result['recommendedUniversity']['name']}")
    assert result['predictedCategory'] == "Mining & Geology"
    assert result['severity'] == "CRITICAL"
    assert result['isDisasterEmergency'] is True
    print("  => AI Classifier PASS ✅")

    # 2. Test TF-IDF Duplicate Detector
    from backend.app.services.ai.duplicate_detector import duplicate_detector
    print("\n[2] Testing Scikit-Learn TF-IDF Duplicate Detector...")
    candidates = [
        {
            "id": "c1",
            "title": "Underground coal seam fire in Jharia Bastacolla",
            "description": "Active subterranean fire in coal seam causing smoke and subsidence.",
            "category": "Mining & Geology",
            "district": "Dhanbad",
            "latitude": 23.74,
            "longitude": 86.41,
        },
        {
            "id": "c2",
            "title": "Severe waterlogging in Morabadi Ranchi",
            "description": "Rainwater overflow flooding houses.",
            "category": "Disaster Management",
            "district": "Ranchi",
            "latitude": 23.38,
            "longitude": 85.32,
        }
    ]
    dup_res = duplicate_detector.detect_duplicates(
        new_title="Jharia subterranean coal seam fire spreading",
        new_description="Smoke emerging from ground and coal seam fire active near Bastacolla.",
        candidate_challenges=candidates,
        new_lat=23.742,
        new_lon=86.415,
    )
    print(f"  - Highest Similarity: {int(dup_res['highestScore'] * 100)}%")
    print(f"  - Is Duplicate: {dup_res['isDuplicate']}")
    print(f"  - Top Matches Found: {len(dup_res['matches'])}")
    assert dup_res['isDuplicate'] is True
    assert dup_res['matches'][0]['id'] == "c1"
    print("  => Duplicate Detector PASS ✅")

    # 3. Test Solver-Challenge Matcher
    from backend.app.services.ai.solver_matcher import match_solvers_for_challenge
    print("\n[3] Testing Multi-Factor Solver Recommendation Engine...")
    ch_sample = {
        "id": "c1",
        "category": "Mining & Geology",
        "aiTags": ["Mine Safety & Fire", "Underground Coal Fire"],
        "district": "Dhanbad",
    }
    solvers_sample = [
        {
            "id": "s1",
            "name": "Prof. Rock Mechanics",
            "organization": "IIT (ISM) Dhanbad",
            "district": "Dhanbad",
            "skills": ["Mine Safety & Fire", "Underground Coal Fire", "Geotechnical"],
            "karmaPoints": 900,
        },
        {
            "id": "s2",
            "name": "Dr. Drone Hydrology",
            "organization": "BIT Mesra",
            "district": "Ranchi",
            "skills": ["Flood & Drainage", "Drone Mapping"],
            "karmaPoints": 400,
        }
    ]
    unis_sample = [
        {"name": "IIT (ISM) Dhanbad", "district": "Dhanbad"}
    ]
    matches = match_solvers_for_challenge(ch_sample, solvers_sample, unis_sample)
    print(f"  - Top Matched Solver: {matches[0]['name']} (Score: {matches[0]['matchScore']}/100)")
    print(f"  - Match Tier: {matches[0]['matchTier']}")
    print(f"  - Explanations: {matches[0]['explanations']}")
    assert matches[0]['solverId'] == "s1"
    assert matches[0]['matchScore'] >= 80.0
    print("  => Solver Matcher PASS ✅")

    # 4. Test Report Summarizer
    from backend.app.services.ai.summarizer import summarize_disaster_report
    print("\n[4] Testing Disaster Brief & Action Item Extraction...")
    summary = summarize_disaster_report(
        title="Flash Flood Breach in Damodar River Embankment",
        description="Embankment ruptured over 20 meters. 3 hamlets cut off without drinking water.",
        category="Disaster Management",
        district="Bokaro"
    )
    print(f"  - Summary: {summary['summary']}")
    print(f"  - Action Items: {summary.get('actionItems')}")
    assert summary['status'] == "SUCCESS"
    print("  => Summarizer PASS ✅")

    print("\n==================================================")
    print("  🎉 ALL PYTHON SERVICES VERIFIED SUCCESSFULLY!  ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
