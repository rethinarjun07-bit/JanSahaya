/**
 * In-memory TF-IDF + N-Gram Cosine Similarity Engine.
 * 100% self-contained, offline, deterministic duplicate detection.
 */

const STOP_WORDS = new Set([
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
  // Hindi romanized stopwords
  "hai", "hain", "ko", "se", "ka", "ki", "ke", "mein", "aur", "ya", "yeh", "woh", "bhi", "par", "hota", "hoti",
]);

export function tokenize(text: string): string[] {
  if (!text) return [];
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const rawWords = clean.split(/\s+/).filter((w) => w.length > 2);
  const words = rawWords.filter((w) => !STOP_WORDS.has(w));

  // Add bigrams for context (e.g. "flash flood", "mine subsidence", "water logging")
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total tokens
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }
  return tf;
}

export function computeIDF(corpusTokens: string[][]): Map<string, number> {
  const N = corpusTokens.length;
  const idf = new Map<string, number>();
  if (N === 0) return idf;

  const docFreq = new Map<string, number>();
  for (const doc of corpusTokens) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  for (const [token, count] of docFreq.entries()) {
    idf.set(token, Math.log((N + 1) / (count + 1)) + 1);
  }
  return idf;
}

export function cosineSimilarity(
  tf1: Map<string, number>,
  tf2: Map<string, number>,
  idf: Map<string, number>
): { score: number; commonKeywords: string[] } {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const commonKeywords: string[] = [];

  const allTokens = new Set([...tf1.keys(), ...tf2.keys()]);

  for (const token of allTokens) {
    const w1 = (tf1.get(token) || 0) * (idf.get(token) || 1);
    const w2 = (tf2.get(token) || 0) * (idf.get(token) || 1);

    if (w1 > 0 && w2 > 0) {
      if (!token.includes("_")) {
        commonKeywords.push(token);
      }
    }

    dotProduct += w1 * w2;
    norm1 += w1 * w1;
    norm2 += w2 * w2;
  }

  if (norm1 === 0 || norm2 === 0) {
    return { score: 0, commonKeywords: [] };
  }

  const score = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return { score: Math.min(1, Math.max(0, score)), commonKeywords };
}

export interface DuplicateCandidate {
  id: string;
  title: string;
  district: string;
  category: string;
  similarityPercentage: number;
  confidence: "VERY_HIGH" | "HIGH" | "MODERATE" | "LOW";
  matchingKeywords: string[];
}

export function evaluateDuplicates(
  target: { title: string; description: string; district?: string; category?: string },
  corpus: Array<{ id: string; title: string; description: string; district?: string; category?: string }>,
  threshold: number = 0.45
): DuplicateCandidate[] {
  const targetText = `${target.title} ${target.title} ${target.description}`;
  const targetTokens = tokenize(targetText);
  const targetTF = computeTF(targetTokens);

  const corpusTokenDocs = corpus.map((c) => tokenize(`${c.title} ${c.title} ${c.description}`));
  corpusTokenDocs.push(targetTokens);
  const idf = computeIDF(corpusTokenDocs);

  const candidates: DuplicateCandidate[] = [];

  for (let i = 0; i < corpus.length; i++) {
    const item = corpus[i];
    const itemTokens = corpusTokenDocs[i];
    const itemTF = computeTF(itemTokens);

    const { score: rawCosine, commonKeywords } = cosineSimilarity(targetTF, itemTF, idf);

    // Location & Category boost
    let finalScore = rawCosine;
    if (target.district && item.district && target.district.toLowerCase() === item.district.toLowerCase()) {
      finalScore += 0.15;
    }
    if (target.category && item.category && target.category.toLowerCase() === item.category.toLowerCase()) {
      finalScore += 0.10;
    }

    // Cap at 0.99 unless identical
    const similarityPercentage = Math.round(Math.min(0.99, finalScore) * 100);

    if (similarityPercentage >= threshold * 100) {
      let confidence: "VERY_HIGH" | "HIGH" | "MODERATE" | "LOW" = "LOW";
      if (similarityPercentage >= 80) confidence = "VERY_HIGH";
      else if (similarityPercentage >= 65) confidence = "HIGH";
      else if (similarityPercentage >= 50) confidence = "MODERATE";

      candidates.push({
        id: item.id,
        title: item.title,
        district: item.district || "Unknown",
        category: item.category || "General",
        similarityPercentage,
        confidence,
        matchingKeywords: Array.from(new Set(commonKeywords)).slice(0, 6),
      });
    }
  }

  return candidates.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
}
