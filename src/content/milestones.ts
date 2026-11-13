import type { MilestoneInput } from "./schema";

/**
 * The company journey (timeline). Only real events, ideally with a public
 * source. Order doesn't matter — the timeline sorts by date. Template:
 *
 * {
 *   title: "First Chrome extension published",
 *   date: "2025-05",                         // "2025", "2025-05" or "2025-05-14"
 *   kind: "LAUNCH",                          // FOUNDING · PRODUCT · LAUNCH · COLLABORATION ·
 *                                            // MILESTONE · PLATFORM · ORGANIZATION · OTHER
 *   description: "One or two sentences.",
 *   product: "my-product",                   // related product slug
 *   source: { url: "https://…", label: "Chrome Web Store" },
 *   featured: true,                          // show on the home page
 * },
 */
/*
 * Sources for the entries below: the 2019 beginning is the founders' own
 * account; 2020 onwards is drawn from the team members' X (Twitter) archives
 * (first posts about each partner, and what the posts were about each year);
 * the partner and product counts come from partnerships.ts and products.ts.
 */
export const milestones: MilestoneInput[] = [
  {
    title: "A group of friends, hunting airdrops",
    date: "2019",
    kind: "FOUNDING",
    description:
      "Unique Labs began as a friend group, not a company. We hunted crypto airdrops and took on pay-to-work jobs together, learning how Web3 projects find their first users by being those users.",
    featured: true,
  },
  {
    title: "Finding our way around the exchanges",
    date: "2020",
    kind: "MILESTONE",
    description:
      "Our earliest crypto posts date from this year: Bitcoin, and the first campaigns around exchanges such as KuCoin, Binance and BitMart. Small tasks, small rewards, and a lot to learn.",
  },
  {
    title: "From airdrops to launchpads",
    date: "2021",
    kind: "MILESTONE",
    description:
      "Airdrop season in full swing — wallet addresses, referral codes and “good project” replies. It was also the year we discovered IDO launchpads and first joined the Seedify community, which shaped much of what came next.",
  },
  {
    title: "From participants to contributors",
    date: "2022",
    kind: "ORGANIZATION",
    description:
      "We stopped only joining communities and started helping to run them. By the end of the year one of us was speaking for the Seedify ambassador team, and wallets such as MetaMask and Trust Wallet and exchanges such as LBank had entered the picture.",
  },
  {
    title: "The Web3 gaming year",
    date: "2023",
    kind: "COLLABORATION",
    description:
      "Blockchain gaming took over our feeds: Seedify and Seedworld, then game launches such as BloodLoop and Storm Warfare. We went from replying to posts to writing our own threads about where Web3 games were heading.",
    featured: true,
  },
  {
    title: "Exploring turns into a business",
    date: "2024",
    kind: "COLLABORATION",
    description:
      "The turning point. Around 90 of today's partners first appear in our posts this year — exchanges such as Bitget and OKX, launchpads such as Vision Launch, TrustFi and DAO Maker, and ecosystems such as Base and Galxe. We hosted our first AMAs and began working as KOL and KOC partners.",
    featured: true,
  },
  {
    title: "Scaling up",
    date: "2025",
    kind: "MILESTONE",
    description:
      "Our busiest year yet: roughly 80 more partners, and more than twice as many posts as the year before. Long-running work with LBank, Gate, Bybit, BitMEX and Bitget Wallet replaced one-off campaigns.",
  },
  {
    title: "Unique Labs today",
    date: "2026",
    kind: "PRODUCT",
    description:
      "The same friends, now a company: KOC and consultancy services, digital marketing and blockchain development for 243 partners, and seven Chrome extensions built in-house — from UnfollowX Pro and GrowX to Rowlio and ScoreX.",
    featured: true,
  },
];
