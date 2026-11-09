import type { CompanyInput } from "./schema";

/**
 * Company identity and core copy. Everything here comes from the owner. Only add facts that are true and public — dates, locations, numbers
 * and people appear on the site exactly as written.
 */
export const company: CompanyInput = {
  name: "Unique Labs",
  tagline: "Helping brands and Web3 projects build, launch and grow.",
  shortDescription:
    "Unique Labs offers KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow.",

  // founded: "2024",            // shown on the About page when set
  // logo: { src: "/images/brand/logo.svg", alt: "Unique Labs", width: 512, height: 512 },

  hero: {
    eyebrow: "KOC · Consultancy · Digital marketing · Web3",
    headline: "Build, launch and grow.",
    description:
      "Unique Labs offers KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow.",
    primaryCta: "Explore our services",
    secondaryCta: "Discover Unique Labs",
  },

  intro: {
    heading: "At the intersection of technology, AI and experimentation.",
    body: "Unique Labs is not just a software company. We offer KOC and consultancy services, digital marketing and blockchain development, helping brands and Web3 projects build, launch and grow. Alongside our services, we build our own software — Chrome extensions such as UnfollowX Pro, GrowX and Unique PDF.",
  },

  about: {
    whoWeAre:
      "Unique Labs works at the intersection of technology, AI and experimentation. We offer KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow.\n\nWe also design and build our own software products, including the Chrome extensions UnfollowX Pro, GrowX, Unique PDF, FrameShot and Twofold.",
    whyWeExist:
      "Good ideas still need to be built, launched and seen. Unique Labs exists to help brands and Web3 projects do all three — bringing strategy, marketing and development together, so teams can go from idea to growth with one partner.",
    mission: "To help brands and Web3 projects build, launch and grow — and to make useful technology accessible to everyone.",
    vision:
      "A trusted partner for brands and Web3 projects, and a recognizable technology brand built at the intersection of technology, AI and experimentation.",
    approach:
      "We start from the goal, not the tool: what needs to be built, who needs to hear about it and what growth should look like. Strategy, marketing and development sit under one roof, so they work together instead of in silos.\n\nWe experiment constantly — testing ideas quickly, keeping what works and dropping what doesn't.",
    longTermDirection:
      "We will keep growing our services for brands and Web3 projects — KOC and consultancy, digital marketing and blockchain development — while continuing to build our own software and AI products.",
    philosophyIntro: "Eight principles guide how we build our own products — and just as importantly, what we choose not to build.",
  },

  whatWeDoIntro:
    "KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow, backed by our own software and AI work.",

  // Shown above the departments in team.ts (the section appears once departments are added).
  structureIntro: "The teams behind our services and products, and what each one is responsible for.",

  closing: {
    headline: "Have something to build, launch or grow?",
    body: "Let's talk about how Unique Labs can help.",
  },

  contact: {
    intro: "KOC campaigns, consultancy, digital marketing, blockchain development or questions about our products — tell us what you're working on.",
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
