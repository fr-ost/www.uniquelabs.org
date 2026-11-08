import type { CapabilityInput } from "./schema";

/**
 * "What we do" — the company's areas of focus (from the owner's brief).
 * They describe focus, not past work. `products` links related product slugs.
 * Icons: puzzle, globe, app-window, zap, code, flask, pen-tool, shield, layers,
 * cpu, compass, sparkles, lock, gauge, boxes, workflow.
 */
export const capabilities: CapabilityInput[] = [
  {
    title: "Browser-based digital utilities",
    summary: "Small, fast tools that live in the browser and remove friction from everyday tasks.",
    description: "Focused utilities that run where people already work. We favour instant start-up, minimal permissions and on-device processing wherever practical.",
    icon: "zap",
    featured: true,
  },
  {
    title: "Chrome extension development",
    summary: "Extensions designed around a single job, built on modern Manifest V3 foundations.",
    description: "Chrome extensions are where Unique Labs starts. We design each one around a clear purpose, request only the permissions it needs, and keep it light.",
    icon: "puzzle",
    featured: true,
  },
  {
    title: "Web-based applications",
    summary: "Web apps and websites that extend our products beyond the browser toolbar.",
    description: "Expanding into websites and web applications is a core part of our direction — bringing the same focus on usefulness, speed and privacy to the open web.",
    icon: "app-window",
    featured: true,
  },
  {
    title: "Productivity solutions",
    summary: "Tools that give people back time and attention, without getting in the way.",
    description: "We look for repetitive, frustrating moments in everyday digital life and build tools that make them disappear.",
    icon: "gauge",
    featured: true,
  },
  {
    title: "Software engineering",
    summary: "Careful, maintainable engineering with low operating costs.",
    description: "Sustainable products need sustainable engineering: simple architectures, few dependencies and costs low enough to keep core products free.",
    icon: "code",
    featured: true,
  },
  {
    title: "Product research & experimentation",
    summary: "Testing ideas against real problems before turning them into products.",
    description: "Not every idea becomes a product. We prototype, test and discard freely so that what we release is worth people's time.",
    icon: "flask",
    featured: true,
  },
  {
    title: "User experience",
    summary: "Interfaces that explain themselves and respect people's attention.",
    description: "Good tools feel obvious. We design for clarity first — fewer settings, better defaults and honest copy.",
    icon: "pen-tool",
  },
  {
    title: "Privacy-conscious software",
    summary: "Local-first processing and data minimisation as defaults, not afterthoughts.",
    description: "We treat privacy and user trust as product requirements: collect as little as possible, process locally where practical, and say plainly what happens to data.",
    icon: "shield",
  },
];
