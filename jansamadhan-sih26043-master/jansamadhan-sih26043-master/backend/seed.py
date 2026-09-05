import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.app.db.session import engine, Base, SessionLocal
from backend.app.models.entities import (
    User, University, Challenge, Solution, Milestone, Review, Upvote, Comment, AuditLog
)
from backend.app.core.security import get_password_hash

logger = logging.getLogger("seed")

def run_seed(db: Session):
    logger.info("🌱 Seeding JanSahaya PostgreSQL / Database with realistic SIH26043 data...")

    # Ensure tables
    Base.metadata.create_all(bind=engine)

    # 1. Clean existing records if any
    db.query(AuditLog).delete()
    db.query(Comment).delete()
    db.query(Upvote).delete()
    db.query(Review).delete()
    db.query(Milestone).delete()
    db.query(Solution).delete()
    db.query(Challenge).delete()
    db.query(University).delete()
    db.query(User).delete()
    db.commit()

    # Passwords
    admin_pwd = get_password_hash("Admin@123")
    citizen_pwd = get_password_hash("Citizen@123")
    solver_pwd = get_password_hash("Solver@123")
    industry_pwd = get_password_hash("Industry@123")

    # 2. Users
    admin_user = User(
        email="admin@demo.in",
        password=admin_pwd,
        name="Sri Rajesh Kumar Sinha, IAS",
        role="ADMIN",
        organization="Govt. of Jharkhand - Disaster Management Cell",
        designation="Principal Secretary & Nodal Officer",
        district="Ranchi",
        state="Jharkhand",
        phone="+91-651-2446900",
        bio="Heading state-level disaster mitigation, early warning systems, and inter-university research partnerships in Jharkhand.",
        karma_points=1250,
        badges=json.dumps([
            {"id": "gov_nodal", "name": "State Nodal Officer", "icon": "ShieldAlert", "date": "2024-01-15"},
            {"id": "disaster_lead", "name": "Disaster Commander", "icon": "Award", "date": "2024-03-20"},
        ]),
        is_verified=True,
    )

    citizen_user = User(
        email="citizen@demo.in",
        password=citizen_pwd,
        name="Priya Sharma",
        role="CITIZEN",
        organization="Morabadi Residents Welfare Association",
        designation="Secretary",
        district="Ranchi",
        state="Jharkhand",
        phone="+91-9431102938",
        bio="Active community volunteer reporting urban flooding and municipal infrastructure challenges in Ranchi.",
        karma_points=280,
        badges=json.dumps([
            {"id": "community_guardian", "name": "Community Guardian", "icon": "HeartHandshake", "date": "2024-02-10"},
            {"id": "voice_reporter", "name": "Voice Reporter", "icon": "Mic", "date": "2024-04-05"},
        ]),
        is_verified=True,
    )

    solver_user = User(
        email="solver@demo.in",
        password=solver_pwd,
        name="Dr. Aarav Mehta",
        role="SOLVER",
        organization="Birla Institute of Technology, Mesra",
        designation="Associate Professor, Dept. of Remote Sensing",
        district="Ranchi",
        state="Jharkhand",
        phone="+91-9835012456",
        bio="Lead Researcher in satellite-based disaster risk modeling, IoT geotechnical sensor networks, and UAV flood estimation.",
        skills=json.dumps(["Remote Sensing", "GIS Mapping", "IoT Geotechnical Sensors", "Hydrological Modeling", "UAV Drones"]),
        karma_points=840,
        badges=json.dumps([
            {"id": "pilot_innovator", "name": "Certified Innovator", "icon": "Lightbulb", "date": "2024-02-18"},
            {"id": "iit_fellow", "name": "Research Fellow", "icon": "GraduationCap", "date": "2024-05-12"},
        ]),
        is_verified=True,
    )

    industry_user = User(
        email="industry@demo.in",
        password=industry_pwd,
        name="Sunita Agarwal",
        role="INDUSTRY",
        organization="Tata Steel Foundation (CSR Division)",
        designation="Head of Societal Impact & Disaster Relief",
        district="East Singhbhum",
        state="Jharkhand",
        phone="+91-657-2431000",
        bio="Overseeing Section 135 CSR allocations for disaster resilient housing, clean drinking water, and community early-warning systems.",
        karma_points=650,
        badges=json.dumps([
            {"id": "csr_champion", "name": "CSR Champion", "icon": "Building2", "date": "2024-01-20"},
            {"id": "patron", "name": "Disaster Relief Patron", "icon": "Coins", "date": "2024-04-14"},
        ]),
        is_verified=True,
    )

    db.add_all([admin_user, citizen_user, solver_user, industry_user])
    db.flush()

    # 3. Universities
    unis_data = [
        {
            "name": "Indian Institute of Technology (ISM) Dhanbad",
            "code": "IIT-ISM",
            "state": "Jharkhand",
            "district": "Dhanbad",
            "departments": ["Mining Engineering", "Applied Geophysics", "Environmental Science & Engg", "Rock Mechanics"],
            "expertise_tags": ["Mine Safety & Fire", "Underground Coal Fire", "Slope Stability", "Subsidence Monitoring", "Methane Drainage"],
            "nodal_officer_name": "Prof. D. C. Panigrahi",
            "nodal_officer_email": "nodal.sih@iitism.ac.in",
        },
        {
            "name": "Birla Institute of Technology, Mesra",
            "code": "BIT-MESRA",
            "state": "Jharkhand",
            "district": "Ranchi",
            "departments": ["Remote Sensing & GIS", "Civil & Environmental Engineering", "Computer Science & AI"],
            "expertise_tags": ["Flood & Drainage", "River Erosion & Silt", "GIS Disaster Heatmap", "Hydrology Simulation", "Drone Surveys"],
            "nodal_officer_name": "Dr. Mili Ghosh",
            "nodal_officer_email": "nodal.sih@bitmesra.ac.in",
        },
        {
            "name": "National Institute of Technology Jamshedpur",
            "code": "NIT-JSR",
            "state": "Jharkhand",
            "district": "East Singhbhum",
            "departments": ["Civil Engineering", "Metallurgical & Materials Engineering", "Electrical Engineering"],
            "expertise_tags": ["Industrial Waste", "Fly Ash Utilization", "River Embankment Reinforcement", "Structural Health"],
            "nodal_officer_name": "Prof. S. B. Prasad",
            "nodal_officer_email": "nodal.sih@nitjsr.ac.in",
        },
        {
            "name": "Birsa Agricultural University, Ranchi",
            "code": "BAU-RANCHI",
            "state": "Jharkhand",
            "district": "Ranchi",
            "departments": ["Agronomy", "Soil Science", "Agricultural Engineering"],
            "expertise_tags": ["Water Quality & Drought", "Soil Salinity", "Drought Resilient Farming", "Micro-Irrigation"],
            "nodal_officer_name": "Dr. Rameshwar Singh",
            "nodal_officer_email": "nodal.sih@bauranchi.ac.in",
        },
        {
            "name": "Rajendra Institute of Medical Sciences, Ranchi",
            "code": "RIMS-RANCHI",
            "state": "Jharkhand",
            "district": "Ranchi",
            "departments": ["Preventive & Social Medicine", "Microbiology", "Emergency Medicine"],
            "expertise_tags": ["Public Health", "Epidemic Outbreak Surveillance", "Fluoride Toxicity", "Vector-Borne Diseases"],
            "nodal_officer_name": "Dr. Vivek Kashyap",
            "nodal_officer_email": "nodal.sih@rimsranchi.ac.in",
        }
    ]

    uni_objects = {}
    for u in unis_data:
        uni = University(
            name=u["name"],
            code=u["code"],
            state=u["state"],
            district=u["district"],
            departments=json.dumps(u["departments"]),
            expertise_tags=json.dumps(u["expertise_tags"]),
            nodal_officer_name=u["nodal_officer_name"],
            nodal_officer_email=u["nodal_officer_email"],
        )
        db.add(uni)
        uni_objects[u["code"]] = uni
    db.flush()

    # 4. Realistic Challenges
    ch1 = Challenge(
        title="Underground Coal Seam Fire & Ground Subsidence in Jharia Bastacolla",
        description="Active subterranean coal fire raging in seam IX/X. Surface temperature reaches 85°C. Multi-story residential structures showing wide cracks; high probability of ground caving in near Bastacolla settlement.",
        category="Mining & Geology",
        severity="CRITICAL",
        urgency_score=96,
        status="ASSIGNED",
        latitude=23.7423,
        longitude=86.4172,
        address="Bastacolla Colliery, Jharia Coalfield, Dhanbad",
        district="Dhanbad",
        state="Jharkhand",
        pincode="828111",
        media_urls=json.dumps(["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800"]),
        ai_tags=json.dumps(["Mine Safety & Fire", "Underground Coal Fire", "Subsidence Monitoring"]),
        predicted_sector="Mining & Geology",
        auto_assigned_university="IIT (ISM) Dhanbad",
        assigned_university_id=uni_objects["IIT-ISM"].id,
        assigned_department="Mining Engineering & Rock Mechanics",
        official_notes="Statutory verification completed. High priority alert issued to BCCL and Dhanbad District Magistrate.",
        verified_at=datetime.utcnow() - timedelta(days=5),
        verified_by_id=admin_user.id,
        created_by_id=citizen_user.id,
    )

    ch2 = Challenge(
        title="Severe Urban Waterlogging & Drain Choking in Morabadi & Harmu",
        description="Heavy pre-monsoon storm resulted in complete inundation of Morabadi road junction and Harmu residential blocks. Over 400 households marooned with zero vehicular movement and drain overflow.",
        category="Disaster Management",
        severity="HIGH",
        urgency_score=78,
        status="VERIFIED",
        latitude=23.3854,
        longitude=85.3283,
        address="Morabadi Main Circle & Harmu Bypass, Ranchi",
        district="Ranchi",
        state="Jharkhand",
        pincode="834008",
        media_urls=json.dumps(["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800"]),
        ai_tags=json.dumps(["Flood & Drainage", "Infrastructure"]),
        predicted_sector="Disaster Management",
        auto_assigned_university="Birla Institute of Technology, Mesra",
        assigned_university_id=uni_objects["BIT-MESRA"].id,
        assigned_department="Remote Sensing & GIS",
        official_notes="Inspected by Ranchi Municipal Corporation disaster response unit.",
        verified_at=datetime.utcnow() - timedelta(days=2),
        verified_by_id=admin_user.id,
        created_by_id=citizen_user.id,
    )

    ch3 = Challenge(
        title="Severe Fluoride & Arsenic Contamination in Daltonganj Borewells",
        description="Routine testing of deep borewells across 6 villages revealed fluoride concentration > 4.2 mg/L and arsenic trace levels. High incidence of skeletal fluorosis reported among school children.",
        category="Water & Sanitation",
        severity="HIGH",
        urgency_score=82,
        status="SUBMITTED",
        latitude=24.0416,
        longitude=84.0722,
        address="Chainpur Block & Daltonganj Rural, Palamu",
        district="Palamu",
        state="Jharkhand",
        pincode="822101",
        media_urls=json.dumps([]),
        ai_tags=json.dumps(["Water Quality & Drought", "Public Health"]),
        predicted_sector="Water & Sanitation",
        auto_assigned_university="National Institute of Technology Jamshedpur",
        created_by_id=citizen_user.id,
    )

    db.add_all([ch1, ch2, ch3])
    db.flush()

    # 5. Solutions & Milestones
    sol1 = Solution(
        challenge_id=ch1.id,
        author_id=solver_user.id,
        team_name="GeoShield Innovation Labs (BIT & IIT-ISM)",
        title="InSAR Satellite Telemetry & Thermocouple Sensor Grid for Jharia Mine Fire",
        abstract="A combined satellite synthetic aperture radar (InSAR) and IoT thermocouple underground borehole grid providing early warning of seam fire spread and millimeter-precision land subsidence tracking.",
        methodology="1. Borehole installation of high-temperature thermocouple sensors at 50m intervals.\n2. L-band SAR interferometry to map terrain displacement.\n3. Cloud predictive pipeline deploying automated SMS alerts to district authorities.",
        tech_stack=json.dumps(["Sentinel-1 InSAR", "LoRaWAN Geothermal Nodes", "FastAPI Python", "PostGIS GIS", "TensorFlow"]),
        budget_estimate=4500000.0,
        timeline_months=8,
        prototype_url="https://github.com/geoshield-sih/sensor-firmware",
        media_urls=json.dumps([]),
        status="GOVT_VERIFIED",
        milestone_stage="Phase 3: Government & Field Verification",
        govt_endorsed=True,
        endorsed_by="Sri Rajesh Kumar Sinha, IAS",
        endorsed_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add(sol1)
    db.flush()

    # Milestones for Sol1
    m1 = Milestone(solution_id=sol1.id, order=1, title="Sensor Firmware & IoT Grid Blueprint", description="Lab validation of high-temperature probes up to 250°C.", status="APPROVED")
    m2 = Milestone(solution_id=sol1.id, order=2, title="Jharia Bastacolla Pilot Deployment", description="Drilling 12 exploratory boreholes and telemetry node setup.", status="APPROVED")
    m3 = Milestone(solution_id=sol1.id, order=3, title="Nodal Disaster Cell Integration", description="Live feed streaming into Ranchi State Emergency Operations Centre.", status="SUBMITTED")
    m4 = Milestone(solution_id=sol1.id, order=4, title="District Evacuation Zone Mapping", description="Official publication of hazard zones under DMA Act 2005.", status="PENDING")
    db.add_all([m1, m2, m3, m4])

    # 6. Reviews for Sol1
    rev1 = Review(
        solution_id=sol1.id,
        reviewer_id=admin_user.id,
        role="GOVT_NODAL",
        rating=4.8,
        feasibility_score=4.9,
        impact_score=5.0,
        cost_effectiveness=4.6,
        scalability_score=4.7,
        feedback="Exceptional technical rigor. The InSAR telemetry matches ground borehole readings with 94% confidence. Endorsed for CSR matching with Tata Steel.",
    )
    rev2 = Review(
        solution_id=sol1.id,
        reviewer_id=industry_user.id,
        role="INDUSTRY",
        rating=4.7,
        feasibility_score=4.8,
        impact_score=4.9,
        cost_effectiveness=4.5,
        scalability_score=4.6,
        feedback="Tata Steel Foundation is prepared to co-sponsor the pilot deployment under Section 135 CSR schedule VII.",
    )
    db.add_all([rev1, rev2])

    # 7. Upvotes & Comments
    up1 = Upvote(user_id=citizen_user.id, challenge_id=ch1.id)
    up2 = Upvote(user_id=solver_user.id, challenge_id=ch1.id)
    up3 = Upvote(user_id=industry_user.id, challenge_id=ch1.id)
    db.add_all([up1, up2, up3])

    comm1 = Comment(
        content="Surface temperature in the adjacent school playground recorded at 62°C today. Please expedite sensor deployment.",
        challenge_id=ch1.id,
        user_id=citizen_user.id,
    )
    db.add(comm1)

    db.commit()
    logger.info("✅ Database seeded successfully with 4 users, 5 universities, 3 geo-challenges, and full solution pipelines!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
