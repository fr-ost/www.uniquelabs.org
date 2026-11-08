import type { PrincipleInput } from "./schema";

/** The philosophy principles shown on the home and About pages, in this order. */
export const principles: PrincipleInput[] = [
  { title: "Accessible to everyone", description: "Useful technology should be accessible to everyone, wherever they are and whatever they can afford." },
  { title: "Free at the core", description: "Core products should remain free — without artificial paywalls or features held hostage." },
  { title: "Privacy and trust first", description: "Privacy and user trust are fundamental. We collect as little as possible and explain what we do." },
  { title: "Quality over quantity", description: "Product quality matters more than product quantity. We'd rather ship one great tool than ten forgettable ones." },
  { title: "Local-first by default", description: "Wherever practical, processing happens on your device — faster, more private and resilient." },
  { title: "Sustainable by design", description: "We build products with low operating costs, so they can stay useful — and free — for the long run." },
  { title: "Real problems only", description: "Every product starts from a real problem people actually have, not from a trend." },
  { title: "A brand built to last", description: "We're building a recognizable global technology brand, one trustworthy product at a time." },
];
