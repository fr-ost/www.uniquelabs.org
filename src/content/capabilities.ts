import type { CapabilityInput } from "./schema";

/**
 * Services ("what we do"), in display order — shown on /services and the home
 * page. The first four are the company's core services (from the owner);
 * software and AI support them. Describe what each service is, not results
 * or clients. `products` links related product slugs.
 * Icons: puzzle, globe, app-window, zap, code, flask, pen-tool, shield, layers,
 * cpu, compass, sparkles, lock, gauge, boxes, workflow.
 */
export const capabilities: CapabilityInput[] = [
  {
    title: "KOC marketing",
    summary: "Campaigns powered by key opinion consumers — real users and creators whose recommendations people trust.",
    description:
      "We plan and run KOC (key opinion consumer) campaigns for brands and Web3 projects: finding the right voices, shaping the message and coordinating each campaign so authentic recommendations reach the right audience.",
    icon: "sparkles",
    featured: true,
  },
  {
    title: "Consultancy",
    summary: "Strategic advice for brands and Web3 projects on how to build, launch and grow.",
    description:
      "From positioning and go-to-market planning to product and growth strategy, we work alongside founders and teams to turn ideas into a clear plan — and help put that plan into action.",
    icon: "compass",
    featured: true,
  },
  {
    title: "Digital marketing",
    summary: "Marketing across the channels where your audience spends its time.",
    description:
      "Social media, content, community and campaign management — digital marketing that helps brands and Web3 projects reach the right people, launch with momentum and keep growing.",
    icon: "globe",
    featured: true,
  },
  {
    title: "Blockchain development",
    summary: "Smart contracts, decentralised applications and Web3 products, built with care.",
    description:
      "We design and develop blockchain solutions for Web3 projects — from smart contracts to decentralised applications and the websites and tools around them.",
    icon: "boxes",
    featured: true,
  },
  {
    title: "Software development",
    summary: "Chrome extensions, websites and web apps — the same craft behind our own products.",
    description:
      "We build software in-house, including our own Chrome extensions. The same engineering, design and attention to detail goes into the products and tools we build for others.",
    icon: "puzzle",
    featured: true,
    products: ["unfollowx-pro", "growx", "unique-pdf", "frameshot", "twofold", "rowlio", "scorex"],
  },
  {
    title: "AI & experimentation",
    summary: "Building at the intersection of technology, AI and experimentation.",
    description:
      "We prototype quickly, test ideas against real problems and put AI to work where it genuinely helps — as in Unique AI inside Unique PDF, the AI writer in GrowX and the AI replies in ScoreX.",
    icon: "flask",
    featured: true,
    products: ["unique-pdf", "growx", "scorex"],
  },
];
