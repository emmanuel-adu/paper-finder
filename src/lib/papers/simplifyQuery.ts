// arXiv, Semantic Scholar, and Crossref all do keyword/term matching, not
// semantic search - a long, natural-language description ("a model that uses
// only attention mechanisms without recurrence for sequence transduction")
// gets diluted by filler words and can return results with nothing to do
// with the target paper. Stripping common stopwords before querying focuses
// the match on content words, which measurably improves recall for loosely
// remembered/described papers without hurting exact-title searches (verified:
// "attention is all you need" and its stopword-stripped "attention need"
// both rank the actual paper first on Semantic Scholar).
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can", "could", "did",
  "do", "does", "doing", "down", "during", "each", "few", "for", "from",
  "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
  "it", "its", "itself", "just", "let", "me", "more", "most", "my",
  "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
  "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same",
  "she", "should", "so", "some", "such", "than", "that", "the", "their",
  "theirs", "them", "themselves", "then", "there", "these", "they", "this",
  "those", "through", "to", "too", "under", "until", "up", "use", "used",
  "uses", "using", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "will", "with", "would", "you",
  "your", "yours", "yourself", "yourselves",
]);

/**
 * Strips common English stopwords, leaving the content words that keyword
 * search engines actually match on. Falls back to the original query if
 * stripping would leave nothing (e.g. the query was itself just stopwords).
 */
export function simplifyQuery(query: string): string {
  const words = query
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const contentWords = words.filter(
    (word) => !STOPWORDS.has(word.toLowerCase().replace(/[^a-z0-9']/g, "")),
  );

  if (contentWords.length === 0) return query;
  return contentWords.join(" ");
}
