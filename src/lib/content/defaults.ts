/**
 * Baseline copy for Unique Labs.
 *
 * Every string here is taken from — or written strictly from — the owner's
 * brief (positioning, philosophy and creative direction). Nothing states a
 * fact the owner has not supplied: no dates, locations, people, numbers,
 * partners or launched products. All of it is editable in the admin.
 */

export const DEFAULT_COMPANY = {
  name: "Unique Labs",
  tagline: "Tools that make the internet more useful.",
  shortDescription:
    "Unique Labs is building an ecosystem of useful digital products and utilities designed to make everyday digital experiences better.",
  heroEyebrow: "Unique Labs — digital product studio",
  heroHeadline: "Technology should make life easier.",
  heroDescription:
    "At Unique Labs, we build useful digital products that simplify everyday experiences and make better technology accessible to everyone.",
  primaryCtaLabel: "Explore Our Products",
  secondaryCtaLabel: "Discover Unique Labs",
  introHeading: "Software that earns its place in your day.",
  introBody:
    "Unique Labs is building an ecosystem of useful digital products and utilities designed to make everyday digital experiences better. Our long-term direction is to develop genuinely useful products across multiple platforms — starting with Chrome extensions and expanding into websites and other digital platforms.",
  whoWeAre:
    "Unique Labs is a technology company and digital product studio. We design and build useful digital products and utilities for everyday life online — starting with Chrome extensions, and expanding into websites and other digital platforms.\n\nWe care about the details most people never see: how fast a tool starts, how little data it needs, and how clearly it explains itself.",
  whyWeExist:
    "Everyday technology should make life easier — not more complicated, more expensive or more invasive. Unique Labs exists to build focused tools that solve real problems, respect the people who use them, and stay accessible to everyone.",
  mission:
    "To build useful digital products that simplify everyday experiences and make better technology accessible to everyone.",
  vision:
    "A recognizable global technology brand whose products make the internet more useful — trusted because they are private by design, free at their core and built to last.",
  philosophyIntro:
    "Eight principles guide what we build — and just as importantly, what we choose not to build.",
  approach:
    "We prefer local-first processing wherever practical, so your data can stay on your device. We keep operating costs low so core products can remain free without artificial paywalls. And we would rather release fewer, better products than many forgettable ones.\n\nEvery product starts from a real problem, and every release is judged on whether it makes that problem smaller.",
  longTermDirection:
    "We're starting with Chrome extensions — focused utilities that live where people already spend their day online. From there, our direction is to expand into websites, web applications and other digital platforms, growing an ecosystem of genuinely useful products under one recognizable brand.",
  whatWeDoIntro:
    "We design, build and maintain useful digital products — focused today on browser-based utilities and Chrome extensions, with websites and other digital platforms next.",
  closingHeadline: "We don't build technology just to add another product to the internet.",
  closingBody: "We build tools that make the internet more useful.",
} as const;

export const DEFAULT_PRINCIPLES: Array<{ title: string; description: string }> = [
  {
    title: "Accessible to everyone",
    description: "Useful technology should be accessible to everyone, wherever they are and whatever they can afford.",
  },
  {
    title: "Free at the core",
    description: "Core products should remain free — without artificial paywalls or features held hostage.",
  },
  {
    title: "Privacy and trust first",
    description: "Privacy and user trust are fundamental. We collect as little as possible and explain what we do.",
  },
  {
    title: "Quality over quantity",
    description: "Product quality matters more than product quantity. We'd rather ship one great tool than ten forgettable ones.",
  },
  {
    title: "Local-first by default",
    description: "Wherever practical, processing happens on your device — faster, more private and resilient.",
  },
  {
    title: "Sustainable by design",
    description: "We build products with low operating costs, so they can stay useful — and free — for the long run.",
  },
  {
    title: "Real problems only",
    description: "Every product starts from a real problem people actually have, not from a trend.",
  },
  {
    title: "A brand built to last",
    description: "We're building a recognizable global technology brand, one trustworthy product at a time.",
  },
];

/**
 * Proposed areas of focus from the brief. Seeded as DRAFTS so the owner can
 * verify and publish them — they are focus areas, not claims of past work.
 */
export const SUGGESTED_CAPABILITIES: Array<{
  title: string;
  summary: string;
  description: string;
  icon: string;
}> = [
  {
    title: "Browser-based digital utilities",
    summary: "Small, fast tools that live in the browser and remove friction from everyday tasks.",
    description:
      "Focused utilities that run where people already work. We favour instant start-up, minimal permissions and on-device processing wherever practical.",
    icon: "zap",
  },
  {
    title: "Chrome extension development",
    summary: "Extensions designed around a single job, built on modern Manifest V3 foundations.",
    description:
      "Chrome extensions are where Unique Labs starts. We design each one around a clear purpose, request only the permissions it needs, and keep it light.",
    icon: "puzzle",
  },
  {
    title: "Web-based applications",
    summary: "Web apps and websites that extend our products beyond the browser toolbar.",
    description:
      "Expanding into websites and web applications is a core part of our direction — bringing the same focus on usefulness, speed and privacy to the open web.",
    icon: "app-window",
  },
  {
    title: "Productivity solutions",
    summary: "Tools that give people back time and attention, without getting in the way.",
    description:
      "We look for repetitive, frustrating moments in everyday digital life and build tools that make them disappear.",
    icon: "gauge",
  },
  {
    title: "Software engineering",
    summary: "Careful, maintainable engineering with low operating costs.",
    description:
      "Sustainable products need sustainable engineering: simple architectures, few dependencies and costs low enough to keep core products free.",
    icon: "code",
  },
  {
    title: "Product research & experimentation",
    summary: "Testing ideas against real problems before turning them into products.",
    description:
      "Not every idea becomes a product. We prototype, test and discard freely so that what we release is worth people's time.",
    icon: "flask",
  },
  {
    title: "User experience",
    summary: "Interfaces that explain themselves and respect people's attention.",
    description:
      "Good tools feel obvious. We design for clarity first — fewer settings, better defaults and honest copy.",
    icon: "pen-tool",
  },
  {
    title: "Privacy-conscious software",
    summary: "Local-first processing and data minimisation as defaults, not afterthoughts.",
    description:
      "We treat privacy and user trust as product requirements: collect as little as possible, process locally where practical, and say plainly what happens to data.",
    icon: "shield",
  },
];

export const DEFAULT_CATEGORIES = [
  { name: "Browser Extensions", slug: "browser-extensions" },
  { name: "Web Applications", slug: "web-applications" },
  { name: "Productivity", slug: "productivity" },
  { name: "Utilities", slug: "utilities" },
];

export const DEFAULT_TEAM_GROUPS = [
  { name: "Leadership", slug: "leadership" },
  { name: "Team", slug: "team" },
];

export const DEFAULT_SEO = {
  seoTitleDefault: "Unique Labs — Useful digital products for everyday life",
  seoTitleTemplate: "%s — Unique Labs",
  seoDescription:
    "Unique Labs builds useful digital products that simplify everyday experiences and make better technology accessible to everyone — starting with Chrome extensions.",
  seoKeywords: [
    "Unique Labs",
    "digital product studio",
    "Chrome extensions",
    "browser extensions",
    "productivity tools",
    "privacy-first software",
  ],
};

/**
 * Legal page templates. They describe what this website actually does as
 * built (no analytics, no ads, contact form stored for replies, strictly
 * necessary admin cookie). Tokens: {{company}}, {{site}}, {{contact}}.
 * The owner should review them — ideally with qualified counsel — before launch.
 */
export const DEFAULT_PRIVACY_POLICY = `This Privacy Policy explains how {{company}} ("we", "us") handles personal information when you visit {{site}} (the "Website").

Individual products may process data differently. Where a product has its own privacy policy, it is linked from that product's page, and that policy applies to the product.

## Information we collect

**When you contact us.** If you use the contact form, we receive the name, email address, inquiry type, subject and message you provide. We use this information only to read and respond to your message and to handle any follow-up.

**Technical information.** Like most websites, our hosting infrastructure processes standard technical data — such as IP address, browser type and the pages requested — to deliver the Website and keep it secure. To protect our forms from abuse, we derive a pseudonymous, keyed hash of your IP address for rate limiting. We do not store your raw IP address with your message.

## Cookies

The public Website does not use advertising or analytics cookies, and it does not embed third-party tracking scripts. A strictly necessary cookie is set only when an authorized administrator signs in to manage the Website.

## How we use information

We use personal information to respond to inquiries, to operate and secure the Website, and to comply with legal obligations. We do not sell personal information, and we do not use contact-form submissions for advertising.

## Sharing

We share information only with service providers that host and operate the Website on our behalf, when required by law, or to protect the rights, safety and security of our users and of {{company}}.

## Retention

We keep contact messages for as long as needed to respond and handle follow-up, and then delete them. You can ask us to delete your message at any time.

## Your choices

You can ask us to access, correct or delete personal information you have sent us. To make a request, contact us at {{contact}}.

## Third-party services

Our products may be distributed through third-party platforms such as browser extension stores. Those platforms have their own privacy practices, which we do not control.

Market data on our Intelligence pages is retrieved by our own server from CoinMarketCap. Your browser does not contact CoinMarketCap when you view those pages (coin logos are served through our server too), and we do not share information about you with them.

## Changes to this policy

We may update this policy from time to time. The date at the top of this page shows when it last changed.

## Contact

Questions about this policy can be sent to {{contact}}.`;

export const DEFAULT_TERMS = `These Terms of Use govern your use of {{site}} (the "Website"), operated by {{company}}. By using the Website, you agree to these terms.

## Using the Website

You may use the Website for lawful purposes only. Please don't attempt to disrupt it, gain unauthorized access to any part of it, or use it to send spam or harmful content.

## Our products

Information about products on the Website is provided for general information. Products may be offered through third-party platforms — such as browser extension stores — and may come with their own terms and privacy policies, which apply to your use of those products.

## Market information

Market data and other information on our Intelligence pages are provided for general information only. They are not financial, investment or tax advice, and they may be delayed, incomplete or inaccurate. Market data is provided by CoinMarketCap. Always verify airdrops and token information on official project channels, and never share a seed phrase or private key with anyone.

## Intellectual property

The Unique Labs name, logo, and the content and design of the Website are owned by {{company}} unless stated otherwise. You may not copy or reuse them in a way that suggests endorsement or affiliation without our permission. Third-party names and marks belong to their respective owners.

## Messages you send us

When you send us a message, you confirm that the information is accurate and that you have the right to share it. Please don't send confidential information through the contact form.

## External links

The Website may link to external websites. We are not responsible for their content or practices.

## Disclaimer

The Website is provided "as is" and "as available". To the fullest extent permitted by law, we make no warranties that it will be uninterrupted, error-free or suitable for any particular purpose.

## Limitation of liability

To the fullest extent permitted by law, {{company}} will not be liable for any indirect, incidental or consequential damages arising from your use of the Website.

## Changes

We may update these terms from time to time. The date at the top of this page shows when they last changed. Continued use of the Website after changes means you accept the updated terms.

## Contact

Questions about these terms can be sent to {{contact}}.`;
