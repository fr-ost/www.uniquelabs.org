import type { CompanyInput } from "./schema";

/**
 * Company identity and core copy. Everything here comes from the owner's
 * brief. Only add facts that are true and public — dates, locations, numbers
 * and people appear on the site exactly as written.
 */
export const company: CompanyInput = {
  name: "Unique Labs",
  tagline: "Tools that make the internet more useful.",
  shortDescription:
    "Unique Labs is building an ecosystem of useful digital products and utilities designed to make everyday digital experiences better.",

  // founded: "2024",            // shown on the About page when set
  // logo: { src: "/images/brand/logo.svg", alt: "Unique Labs", width: 512, height: 512 },

  hero: {
    eyebrow: "Unique Labs — digital product studio",
    headline: "Technology should make life easier.",
    description:
      "At Unique Labs, we build useful digital products that simplify everyday experiences and make better technology accessible to everyone.",
    primaryCta: "Explore Our Products",
    secondaryCta: "Discover Unique Labs",
  },

  intro: {
    heading: "Software that earns its place in your day.",
    body: "Unique Labs is building an ecosystem of useful digital products and utilities designed to make everyday digital experiences better. Our long-term direction is to develop genuinely useful products across multiple platforms — starting with Chrome extensions and expanding into websites and other digital platforms.",
  },

  about: {
    whoWeAre:
      "Unique Labs is a technology company and digital product studio. We design and build useful digital products and utilities for everyday life online — starting with Chrome extensions, and expanding into websites and other digital platforms.\n\nWe care about the details most people never see: how fast a tool starts, how little data it needs, and how clearly it explains itself.",
    whyWeExist:
      "Everyday technology should make life easier — not more complicated, more expensive or more invasive. Unique Labs exists to build focused tools that solve real problems, respect the people who use them, and stay accessible to everyone.",
    mission: "To build useful digital products that simplify everyday experiences and make better technology accessible to everyone.",
    vision:
      "A recognizable global technology brand whose products make the internet more useful — trusted because they are private by design, free at their core and built to last.",
    approach:
      "We prefer local-first processing wherever practical, so your data can stay on your device. We keep operating costs low so core products can remain free without artificial paywalls. And we would rather release fewer, better products than many forgettable ones.\n\nEvery product starts from a real problem, and every release is judged on whether it makes that problem smaller.",
    longTermDirection:
      "We're starting with Chrome extensions — focused utilities that live where people already spend their day online. From there, our direction is to expand into websites, web applications and other digital platforms, growing an ecosystem of genuinely useful products under one recognizable brand.",
    philosophyIntro: "Eight principles guide what we build — and just as importantly, what we choose not to build.",
  },

  whatWeDoIntro:
    "We design, build and maintain useful digital products — focused today on browser-based utilities and Chrome extensions, with websites and other digital platforms next.",

  // Shown above the departments in team.ts (the section appears once departments are added).
  structureIntro: "The teams behind our products, and what each one is responsible for.",

  closing: {
    headline: "We don't build technology just to add another product to the internet.",
    body: "We build tools that make the internet more useful.",
  },

  contact: {
    intro: "Questions, partnership ideas or feedback about our products — we read every message.",
    // Add real addresses to show them on the Contact page and in the footer:
    emails: {
      // general: "hello@example.com",
      // business: "business@example.com",
      // partnerships: "partners@example.com",
      // press: "press@example.com",
    },
    // country: "…",
  },

  // Social profiles, e.g. { platform: "X", url: "https://x.com/…" }
  socials: [],
};
