import type { NormalisedTweet } from "@/lib/importers/x/parse";
import type { CollaborationCategoryValue } from "@/lib/importers/core/types";

/**
 * Evidence-based collaboration scoring for a single tweet.
 *
 * A mention of a brand is NOT a collaboration. Retweets are excluded
 * entirely; replies, appreciation posts, questions and "anyone want to
 * collab?" requests are heavily penalised. A tweet becomes a candidate only
 * with an explicit collaboration/partnership statement.
 */

interface Rule {
  re: RegExp;
  points: number;
  label: string;
  category?: CollaborationCategoryValue;
}

const POSITIVE: Rule[] = [
  { re: /\bin\s+partnership\s+with\b/i, points: 45, label: "“in partnership with”", category: "BRAND_PARTNERSHIP" },
  { re: /\b(?:partner(?:ed|ing)|partnership)\s+with\b/i, points: 45, label: "partnership statement", category: "BRAND_PARTNERSHIP" },
  { re: /\b(?:official|strategic|proud|new|launch)\s+partners?\b/i, points: 35, label: "official partner", category: "BRAND_PARTNERSHIP" },
  { re: /\b(?:in\s+)?collaborat(?:ion|ed|ing)\s+with\b/i, points: 42, label: "collaboration statement", category: "CO_CREATION" },
  { re: /\bteam(?:ed|ing)\s+up\s+with\b/i, points: 40, label: "teamed up", category: "CO_CREATION" },
  { re: /\bjoin(?:ed|ing)?\s+forces\s+with\b/i, points: 40, label: "joined forces", category: "CO_CREATION" },
  { re: /\bco-?(?:created|developed|built|designed|hosted|authored|produced)\b/i, points: 40, label: "co-created", category: "CO_CREATION" },
  { re: /\b(?:built|made|created)\s+(?:this\s+|it\s+)?together\s+with\b/i, points: 35, label: "built together", category: "CO_CREATION" },
  { re: /\bsponsored\s+by\b|\bthanks\s+to\s+our\s+sponsors?\b/i, points: 40, label: "sponsored by", category: "SPONSORSHIP" },
  { re: /\b(?:we(?:'re| are)?|proud(?:ly)?|excited)\s+(?:to\s+)?sponsor(?:ing|ed)?\b/i, points: 35, label: "sponsoring", category: "SPONSORSHIP" },
  { re: /\bbrand\s+ambassador\b|\bambassador\s+(?:for|of|program)\b/i, points: 35, label: "ambassador", category: "BRAND_PARTNERSHIP" },
  { re: /\bintegrat(?:ion|ed|es)\s+with\b|\bnow\s+integrat(?:es|ed)\b/i, points: 38, label: "integration", category: "PRODUCT_INTEGRATION" },
  { re: /\bnow\s+(?:available|live)\s+(?:on|in|inside|within)\b/i, points: 25, label: "now available on", category: "PRODUCT_INTEGRATION" },
  { re: /\bpowered\s+by\b/i, points: 18, label: "powered by", category: "PRODUCT_INTEGRATION" },
  { re: /\bcampaign\s+(?:with|for|alongside)\b/i, points: 32, label: "campaign", category: "CAMPAIGN" },
  { re: /\bcommunity\s+partner(?:ship)?\b/i, points: 38, label: "community partnership", category: "COMMUNITY" },
  { re: /\bcontribut(?:ed|ing|ion)\s+to\b|\bofficial\s+contributor\b/i, points: 24, label: "contribution", category: "CONTRIBUTION" },
  { re: /\b(?:worked|working)\s+(?:together\s+)?with\b/i, points: 22, label: "working with", category: "OTHER" },
  { re: /\bexcited\s+to\s+(?:announce|share|reveal)\b|\bthrilled\s+to\s+(?:announce|share)\b|\bproud\s+to\s+announce\b/i, points: 12, label: "announcement" },
  { re: /\bannounc(?:e|es|ed|ing)\b/i, points: 6, label: "announce" },
];

const NEGATIVE: Rule[] = [
  { re: /\b(?:looking\s+for|open\s+to|anyone\s+(?:want|interested|up for)|who\s+wants|dm\s+(?:me|us)\s+(?:for|to|if)|hmu|would\s+love\s+to|hope\s+to|want\s+to|wanna|let'?s\s+(?:collab|work|partner|team)|interested\s+in\s+(?:a\s+)?(?:collab|partnership)|accepting\s+(?:collabs?|partnerships?))\b/i, points: -45, label: "seeking a collaboration (not one)" },
  { re: /\b(?:thanks?|thank\s+you|thx|shout\s*-?out|congrats|congratulations|kudos|love\s+(?:this|it|your|that)|great\s+(?:job|work)|well\s+done|amazing\s+work)\b/i, points: -18, label: "appreciation" },
  { re: /\b(?:giveaway|retweet\s+to\s+win|rt\s+to\s+win|follow\s+and\s+rt)\b/i, points: -15, label: "giveaway" },
];

const HASHTAGS: Record<string, { points: number; category?: CollaborationCategoryValue }> = {
  partnership: { points: 18, category: "BRAND_PARTNERSHIP" },
  partner: { points: 14, category: "BRAND_PARTNERSHIP" },
  partners: { points: 14, category: "BRAND_PARTNERSHIP" },
  collab: { points: 16, category: "CO_CREATION" },
  collaboration: { points: 18, category: "CO_CREATION" },
  sponsored: { points: 22, category: "SPONSORSHIP" },
  sponsor: { points: 18, category: "SPONSORSHIP" },
  ad: { points: 16, category: "SPONSORSHIP" },
  ambassador: { points: 18, category: "BRAND_PARTNERSHIP" },
  integration: { points: 14, category: "PRODUCT_INTEGRATION" },
};

export interface TweetScore {
  score: number;
  category: CollaborationCategoryValue;
  matched: string[];
  partners: Array<{ handle: string; name: string | null }>;
  partnerName: string | null;
  excludedReason: string | null;
}

export const CANDIDATE_THRESHOLD = 40;

/** Picks a partner name from "with Acme Corp" when no @mention is present. */
function partnerFromText(text: string): string | null {
  const match = /\bwith\s+((?:[A-Z][\w&.'-]*)(?:\s+(?:[A-Z][\w&.'-]*|&|and|of)){0,4})/.exec(text);
  if (!match?.[1]) return null;
  const name = match[1].replace(/\s+(?:and|of|&)$/i, "").trim();
  if (name.length < 2 || /^(The|This|Our|My|Us|You|Them|Everyone|All)$/i.test(name)) return null;
  return name;
}

export function scoreTweet(tweet: NormalisedTweet, ownHandle: string | null): TweetScore {
  const own = ownHandle?.toLowerCase() ?? null;
  const partners = tweet.mentions
    .filter((m) => m.handle.toLowerCase() !== own)
    .sort((a, b) => a.start - b.start)
    .map(({ handle, name }) => ({ handle, name }));

  if (tweet.isRetweet) {
    return { score: 0, category: "OTHER", matched: [], partners, partnerName: null, excludedReason: "retweet" };
  }

  const text = tweet.text;
  let score = 0;
  const matched: string[] = [];
  const categoryVotes = new Map<CollaborationCategoryValue, number>();
  let strongest = 0;

  for (const rule of POSITIVE) {
    if (rule.re.test(text)) {
      // Diminishing returns after the strongest statement.
      const points = rule.points > strongest ? rule.points : Math.round(rule.points * 0.25);
      strongest = Math.max(strongest, rule.points);
      score += points;
      matched.push(rule.label);
      if (rule.category) categoryVotes.set(rule.category, (categoryVotes.get(rule.category) ?? 0) + rule.points);
    }
  }
  for (const tag of tweet.hashtags) {
    const rule = HASHTAGS[tag.toLowerCase()];
    if (rule) {
      score += rule.points;
      matched.push(`#${tag}`);
      if (rule.category) categoryVotes.set(rule.category, (categoryVotes.get(rule.category) ?? 0) + rule.points);
    }
  }
  const hasStatement = strongest >= 30;
  for (const rule of NEGATIVE) {
    if (rule.re.test(text)) {
      // Appreciation is only penalised when there's no explicit statement.
      if (rule.label === "appreciation" && hasStatement) continue;
      score += rule.points;
      matched.push(rule.label);
    }
  }
  if (/\?\s*$/.test(text.trim()) || /\?\s+\S/.test(text)) {
    score -= 12;
    matched.push("question");
  }
  const replyToOther = tweet.isReply && (!own || tweet.replyToScreenName?.toLowerCase() !== own);
  if (replyToOther) {
    score -= 25;
    matched.push("reply to another account");
  }
  const partnerName = partners.length ? null : partnerFromText(text);
  if (partners.length > 0) score += 10;
  else if (partnerName) score += 4;
  else score -= 15;

  let category: CollaborationCategoryValue = "OTHER";
  let best = 0;
  for (const [cat, votes] of categoryVotes) {
    if (votes > best) {
      best = votes;
      category = cat;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    category,
    matched,
    partners,
    partnerName,
    excludedReason: hasStatement || score >= CANDIDATE_THRESHOLD ? null : "no explicit collaboration statement",
  };
}
