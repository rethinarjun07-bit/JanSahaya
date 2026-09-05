import math
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did",
    "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
    "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in",
    "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with",
    "would", "you", "your", "yours", "yourself", "yourselves",
    # Hindi romanized stopwords
    "hai", "hain", "ko", "se", "ka", "ki", "ke", "mein", "aur", "ya", "yeh", "woh", "bhi", "par", "hota", "hoti"
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS points."""
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DuplicateDetector:
    def __init__(self, threshold: float = 0.45):
        self.threshold = threshold

    def detect_duplicates(
        self,
        new_title: str,
        new_description: str,
        candidate_challenges: List[Dict[str, Any]],
        new_lat: Optional[float] = None,
        new_lon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculates cosine similarity using TF-IDF across candidate challenges.
        Also factors in geographical distance if coordinates are provided.
        """
        if not candidate_challenges:
            return {
                "isDuplicate": False,
                "highestScore": 0.0,
                "threshold": self.threshold,
                "matches": [],
                "warningMessage": None,
            }

        new_text = f"{new_title} {new_description}".strip()
        corpus = [new_text]
        for c in candidate_challenges:
            corpus.append(f"{c.get('title', '')} {c.get('description', '')}".strip())

        try:
            vectorizer = TfidfVectorizer(
                stop_words=list(STOP_WORDS),
                ngram_range=(1, 2),
                min_df=1,
            )
            tfidf_matrix = vectorizer.fit_transform(corpus)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        except Exception:
            # Fallback word-overlap if vectorizer fails
            similarities = [0.0] * len(candidate_challenges)

        matches = []
        highest_score = 0.0

        for idx, challenge in enumerate(candidate_challenges):
            sim_score = float(similarities[idx])

            # Apply proximity boost if within 5 km and textual similarity > 0.25
            if new_lat is not None and new_lon is not None:
                c_lat = challenge.get("latitude")
                c_lon = challenge.get("longitude")
                if c_lat is not None and c_lon is not None:
                    dist_km = haversine_distance(new_lat, new_lon, float(c_lat), float(c_lon))
                    if dist_km <= 2.0 and sim_score > 0.20:
                        sim_score = min(1.0, sim_score + 0.20)
                    elif dist_km <= 5.0 and sim_score > 0.25:
                        sim_score = min(1.0, sim_score + 0.10)

            sim_score = round(sim_score, 3)
            if sim_score > highest_score:
                highest_score = sim_score

            if sim_score >= 0.20:  # Include any meaningful overlap
                matches.append({
                    "id": challenge.get("id"),
                    "title": challenge.get("title"),
                    "description": challenge.get("description", "")[:120] + "...",
                    "category": challenge.get("category"),
                    "district": challenge.get("district"),
                    "similarityScore": sim_score,
                    "severity": challenge.get("severity", "MEDIUM"),
                    "status": challenge.get("status", "SUBMITTED"),
                })

        # Sort matches by similarity descending
        matches.sort(key=lambda x: x["similarityScore"], reverse=True)

        is_duplicate = highest_score >= self.threshold
        warning_message = None
        if is_duplicate and matches:
            top = matches[0]
            warning_message = (
                f"High similarity detected ({int(top['similarityScore'] * 100)}%) with "
                f"existing challenge '{top['title']}' in {top['district']}."
            )

        return {
            "isDuplicate": is_duplicate,
            "highestScore": highest_score,
            "threshold": self.threshold,
            "matches": matches[:5],
            "warningMessage": warning_message,
        }

duplicate_detector = DuplicateDetector()
