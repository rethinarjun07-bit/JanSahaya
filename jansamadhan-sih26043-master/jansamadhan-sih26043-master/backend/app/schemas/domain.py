from typing import List, Optional, Any, Dict
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# ==================== AUTH SCHEMAS ====================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "CITIZEN"
    organization: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class DemoSwitchRequest(BaseModel):
    role: str  # CITIZEN, SOLVER, INDUSTRY, ADMIN

class QuickLoginRequest(BaseModel):
    role: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    organization: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = []
    karmaPoints: int = 100
    badges: Optional[List[Any]] = []
    isVerified: bool = True

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

# ==================== CHALLENGE SCHEMAS ====================

class ChallengeCreate(BaseModel):
    title: str
    description: str
    category: str
    severity: Optional[str] = "MEDIUM"
    urgencyScore: Optional[int] = 50
    latitude: float
    longitude: float
    address: str
    district: str
    state: str
    pincode: Optional[str] = None
    mediaUrls: Optional[List[str]] = []
    audioUrl: Optional[str] = None
    voiceTranscript: Optional[str] = None
    language: Optional[str] = "en"
    aiTags: Optional[List[str]] = []

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    officialNotes: Optional[str] = None
    severity: Optional[str] = None
    assignedUniversityId: Optional[str] = None
    assignedDepartment: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    audioUrl: Optional[str] = None

# ==================== SOLUTION & REVIEW SCHEMAS ====================

class MilestoneCreate(BaseModel):
    order: int
    title: str
    description: str
    targetDate: Optional[datetime] = None

class SolutionCreate(BaseModel):
    challengeId: str
    title: str
    abstract: str
    methodology: str
    techStack: Optional[List[str]] = []
    budgetEstimate: Optional[float] = None
    timelineMonths: Optional[int] = None
    prototypeUrl: Optional[str] = None
    mediaUrls: Optional[List[str]] = []
    teamName: Optional[str] = None
    milestones: Optional[List[MilestoneCreate]] = []

class ReviewCreate(BaseModel):
    role: str = "MENTOR"
    rating: float = 4.0
    feasibilityScore: float = 4.0
    impactScore: float = 4.0
    costEffectiveness: float = 4.0
    scalabilityScore: float = 4.0
    feedback: str

class EndorseRequest(BaseModel):
    endorsedBy: Optional[str] = None

# ==================== AI SCHEMAS ====================

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    district: Optional[str] = None

class DuplicateMatchItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    district: str
    similarityScore: float
    severity: str
    status: str

class DuplicateCheckResponse(BaseModel):
    isDuplicate: bool
    highestScore: float
    threshold: float
    matches: List[DuplicateMatchItem]
    warningMessage: Optional[str] = None

class ClassificationResponse(BaseModel):
    predictedCategory: str
    severity: str
    urgencyScore: int
    tags: List[str]
    isDisasterEmergency: bool
    recommendedUniversity: Dict[str, str]

# ==================== ADMIN SCHEMAS ====================

class VerifyRequest(BaseModel):
    challengeId: str
    status: str = "VERIFIED"  # VERIFIED, REJECTED
    officialNotes: Optional[str] = None
    autoAssignedUniversity: Optional[str] = None

class AssignRequest(BaseModel):
    challengeId: str
    universityId: str
    assignedDepartment: Optional[str] = None
    notes: Optional[str] = None

class MergeRequest(BaseModel):
    masterChallengeId: str
    duplicateChallengeId: str
    similarityScore: float
    reason: str
