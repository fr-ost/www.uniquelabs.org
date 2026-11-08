import { sentences } from "@/lib/importers/core/text";

/**
 * Evidence-based development-stage signals.
 *
 * Core rule from the brief: words such as "build", "launch", "create" or
 * "develop" ALONE never establish that a product was published. Publication
 * evidence requires a structured, past-tense, affirmative statement by the
 * owner (e.g. "it's now live on the Chrome Web Store", "my extension got
 * approved", "we launched last week"), a store listing URL shared by the
 * owner, or real usage numbers. Hypothetical, future, negated or questioning
 * sentences never count.
 */

export type SignalKind =
  | "published"
  | "usage"
  | "approved"
  | "beta"
  | "submitted"
  | "rejected"
  | "completed"
  | "development"
  | "planning"
  | "idea"
  | "cancelled"
  | "ambiguous_launch";

export interface Signal {
  kind: SignalKind;
  label: string;
  sentence: string;
}

const HYPOTHETICAL = /\b(will|won't|going to|gonna|plan(?:ning)? to|want(?:ed)? to|wanna|hope to|hoping to|should|could|would|might|before|once|when|whenever|if|unless|how (?:do|to|can|should)|what (?:if|do|should)|need to|trying to|try to|about to|let'?s|can i|can we|is it|are they|do i|does it)\b/i;
const BETA_WORDS = /\b(?:beta|alpha|early access|testflight|preview build|pre-?release)\b/i;
const NEGATION = /\b(not|isn'?t|hasn'?t|haven'?t|wasn'?t|weren'?t|never|no longer|didn'?t|doesn'?t|yet to|not yet|failed|couldn'?t)\b/i;

const PATTERNS: Array<{ kind: SignalKind; label: string; re: RegExp; guarded: boolean; ownerOnly: boolean }> = [
  {
    kind: "published",
    label: "release statement",
    re: /\b(?:i|we|i'?ve|we'?ve|i have|we have|i just|we just|finally)\s+(?:just\s+|finally\s+|officially\s+)?(?:launched|published|released|shipped|went live with|put (?:it|this) live)\b/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "published",
    label: "live/available statement",
    re: /\b(?:it'?s|it is|its|is|are|they'?re|now)\s+(?:now\s+|officially\s+|finally\s+)?(?:live|published|available)\s+(?:on|in|at)\s+(?:the\s+)?(?:chrome\s+web\s*store|web\s*store|chrome\s+store|firefox add-?ons|edge add-?ons|app\s*store|play\s*store|google play|product\s*hunt|[a-z0-9-]+\.(?:com|app|io|dev|co|org|net|ai|xyz))/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "published",
    label: "went live",
    re: /\b(?:went|has gone|just went)\s+live\b/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "published",
    label: "memory: user launched",
    re: /\b(?:user|they|he|she|who)\s+(?:has\s+|have\s+|recently\s+|successfully\s+)*(?:launched|published|released|shipped)\b/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "approved",
    label: "store approval",
    re: /\b(?:got|was|has been|have been|been|is|finally)\s+(?:finally\s+)?(?:approved|accepted)\b|\bapproved\s+(?:by|on)\s+(?:the\s+)?(?:chrome\s+web\s*store|web\s*store|google|store|app\s*store|mozilla)\b/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "usage",
    label: "usage numbers",
    re: /\b\d[\d,.]*\s*k?\+?\s*(?:active\s+|weekly\s+|daily\s+|monthly\s+)?(?:users|installs|downloads|customers|subscribers)\b/i,
    guarded: true,
    ownerOnly: true,
  },
  {
    kind: "usage",
    label: "store reviews",
    re: /\b(?:got|have|received|getting)\s+(?:\d+\s+|some\s+|my first\s+|a few\s+)?(?:\d-star\s+)?reviews?\b/i,
    guarded: true,
    ownerOnly: true,
  },
  { kind: "beta", label: "beta", re: /\b(?:beta(?:\s+testers?|\s+version|\s+release)?|early access|private beta|public beta|testflight|unlisted (?:listing|extension|version))\b/i, guarded: false, ownerOnly: true },
  {
    kind: "submitted",
    label: "submitted for review",
    re: /\b(?:submitted|uploaded|sent)\s+(?:it\s+|the extension\s+|my extension\s+)?(?:to|on|for)\s+(?:the\s+)?(?:chrome\s+web\s*store|web\s*store|store|app\s*store|play\s*store|review)\b|\b(?:pending|under|in)\s+review\b/i,
    guarded: true,
    ownerOnly: true,
  },
  { kind: "rejected", label: "store rejection", re: /\b(?:rejected|removed from the (?:chrome )?web\s*store|taken down|policy violation|violation reference|item has been (?:rejected|removed))\b/i, guarded: false, ownerOnly: true },
  {
    kind: "completed",
    label: "completed",
    re: /\b(?:it'?s|its|it is|everything is|the extension is|the app is)\s+(?:finally\s+)?(?:finished|complete|completed|done|working perfectly|ready)\b|\beverything works\b|\bfinal version\b|\bready (?:to|for) (?:publish|launch|submission|release|production)\b/i,
    guarded: false,
    ownerOnly: true,
  },
  { kind: "cancelled", label: "cancelled", re: /\b(?:abandon(?:ed|ing)?|giving up on|gave up on|cancel(?:led|ed|ing)? the project|not going to (?:continue|finish)|scrap(?:ped|ping)?|shelv(?:ed|ing)|discontinu(?:e|ed|ing)|shut (?:it )?down|killed the project)\b/i, guarded: false, ownerOnly: true },
  { kind: "planning", label: "planning", re: /\b(?:roadmap|architecture|feature list|list of features|requirements|tech stack|wireframes?|user stories|mvp scope|project plan|plan out|how should i structure)\b/i, guarded: false, ownerOnly: false },
  { kind: "idea", label: "idea", re: /\b(?:i have an idea|business idea|product idea|app idea|extension idea|what if i (?:built|made|created)|thinking (?:of|about) (?:building|making|creating)|could i build|i want to (?:build|create|make)|brainstorm)\b/i, guarded: false, ownerOnly: true },
  { kind: "development", label: "debugging", re: /\b(?:error|bug|not working|doesn'?t work|isn'?t working|fix(?:ed)? (?:the|this|it)|uncaught|typeerror|console\.log|stack trace|refactor)\b/i, guarded: false, ownerOnly: false },
  { kind: "ambiguous_launch", label: "launch mentioned", re: /\b(?:launch(?:ed|ing)?|publish(?:ed|ing)?|release[ds]?|go(?:ing)? live)\b/i, guarded: false, ownerOnly: true },
];

/**
 * Finds stage signals in a block of text. `owner` is true for the owner's own
 * words (human messages, project docs, memory); assistant text only feeds
 * development-activity signals.
 */
export function findSignals(text: string, owner: boolean): Signal[] {
  const found: Signal[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences(text)) {
    if (sentence.length > 1200) continue;
    const question = sentence.trim().endsWith("?");
    for (const pattern of PATTERNS) {
      if (pattern.ownerOnly && !owner) continue;
      const match = pattern.re.exec(sentence);
      if (!match) continue;
      if (pattern.guarded) {
        const before = sentence.slice(0, match.index + match[0].length);
        if (question || HYPOTHETICAL.test(before) || NEGATION.test(sentence)) continue;
      }
      // "We launched a beta" is a beta release, not a public launch.
      const kind: SignalKind =
        (pattern.kind === "published" || pattern.kind === "approved") && BETA_WORDS.test(sentence) ? "beta" : pattern.kind;
      const label = kind === pattern.kind ? pattern.label : "beta release";
      const key = `${kind}:${label}`;
      if (seen.has(key) && kind !== "development") continue;
      seen.add(key);
      found.push({ kind, label, sentence: sentence.slice(0, 400) });
    }
  }
  return found;
}

/** Counts code blocks — a proxy for hands-on development. */
export function codeBlockCount(text: string): number {
  return Math.floor((text.match(/```/g)?.length ?? 0) / 2);
}

const DEV_TERMS =
  /\b(chrome extension|browser extension|manifest(?:\.json| v3| version)|content[_ ]script|service[_ ]worker|background\.js|popup\.(?:html|js)|chrome\.(?:runtime|storage|tabs|action)|web\s*store|extension|web app|website|landing page|next\.js|react|vue|svelte|tailwind|vercel|netlify|railway|deploy(?:ed|ment)?|domain|database|api|frontend|backend|saas|mvp|user interface|ui|ux)\b/gi;

export function devTermScore(text: string): number {
  return Math.min(60, text.match(DEV_TERMS)?.length ?? 0);
}
