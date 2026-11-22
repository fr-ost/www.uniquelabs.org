import type { ServicePageInput } from "./schema";

/**
 * One page per service: /services/<slug>. Linked from /services, the home
 * page and the footer. See docs/seo/SEO-PROGRAM.md (section 5) for the brief
 * behind each page.
 *
 * Facts only. Proof is the partner list (partnerships.ts, by role); campaign
 * results are not published (the owner shares them privately). Every service
 * is priced per project. Template:
 *
 * {
 *   slug: "my-service",                      // → /services/my-service
 *   name: "My service",
 *   title: "Page heading",
 *   summary: "One line for cards.",
 *   quickAnswer: "40–70 words: what it is and what we do.",
 *   sections: [{ heading: "…", body: "Markdown" }],
 *   proofRoles: ["KOC Partner"],             // roles from partnerships.ts
 *   faqs: [{ question: "…", answer: "…" }],
 *   related: ["other-service"],
 *   seo: { title: "≤ 46 characters", description: "140–155 characters" },
 * },
 */
export const servicePages: ServicePageInput[] = [
  {
    slug: "koc-marketing",
    name: "KOC marketing",
    title: "Crypto KOC marketing that people trust",
    summary: "Real users and creators recommending your exchange, wallet or token to audiences that trust them.",
    quickAnswer:
      "KOC (key opinion consumer) marketing uses real users with small, engaged audiences to try a product and share an honest recommendation. Unique Labs plans and runs KOC campaigns for exchanges, wallets and Web3 projects: we find the right voices, shape the message and coordinate each campaign so authentic recommendations reach the right people.",
    icon: "sparkles",
    audience: [
      "Exchanges launching a product, feature or campaign",
      "Wallets and Web3 apps that need people to try them",
      "New tokens and projects building early trust",
    ],
    sections: [
      {
        heading: "What is KOC marketing?",
        body: `A **key opinion consumer** (KOC) is an ordinary user who shares their experience with a product. Their audience is usually small, but it is close: followers who know them and believe them when they say "I tried this, here's how it went."

KOC marketing turns that word of mouth into a planned campaign. Instead of one large announcement, many real users try the product and talk about it in their own words — a first trade, a wallet set-up, a feature they found useful. In crypto, where people are wary of scams and paid hype, that kind of first-hand recommendation is often what decides whether someone signs up.`,
      },
      {
        heading: "KOC or KOL: which does your project need?",
        body: `A **KOL** (key opinion leader) has reach: a large, established audience that pays attention when they post. A **KOC** has trust: a smaller audience that acts on their recommendation.

- Use **KOLs** when you need attention quickly — an announcement, a listing, big news.
- Use **KOCs** when you need people to act — sign up, try a feature, make a first deposit, stay active.

Most launches use both: KOLs to make people aware, KOCs to show real people using the product. We run [KOL campaigns](/services/kol-marketing) too, so the two can be planned together.`,
      },
      {
        heading: "What we do in a KOC campaign",
        body: `- **Find the right voices.** KOCs whose audience matches the people you want to reach, and who would genuinely use the product.
- **Shape the message.** A clear brief on what to try and what matters about it, while leaving room for each KOC's own words.
- **Coordinate the campaign.** Timing around your milestones and keeping every post on brief.

We work mainly on X (Twitter) and Telegram, where crypto audiences spend their time.`,
      },
      {
        heading: "Why Unique Labs",
        body: `We started in 2019 as a group of friends hunting airdrops and taking on pay-to-work jobs — the users that KOC campaigns are made of. We know what real users respond to because we were them for years before we ran campaigns ourselves.

Today we are a KOC partner to exchanges and wallets including Gate, Bybit and Bitget Wallet, and have run KOC campaigns for Binance and many Web3 projects. The partners we have worked with are listed below and on our [partners page](/partnerships).`,
      },
    ],
    proofRoles: ["KOC Partner", "KOC Campaigns", "KOC Campaign"],
    faqs: [
      {
        question: "What is KOC marketing in crypto?",
        answer:
          "It is word-of-mouth marketing run as a campaign: real users with small, engaged audiences try an exchange, wallet or token and share an honest experience. It builds trust, which matters in crypto, where people are wary of paid hype.",
      },
      {
        question: "What is the difference between a KOC and a KOL?",
        answer:
          "A KOL (key opinion leader) has a large audience and brings reach. A KOC (key opinion consumer) has a smaller, closer audience and brings trust and action. KOLs make people aware; KOCs show real people using the product. Most launches use both.",
      },
      {
        question: "Do KOCs have to disclose paid posts?",
        answer:
          "Yes. Paid or sponsored posts should be clearly disclosed. The exact rules depend on the country and on each platform's own policies.",
      },
      {
        question: "Which platforms do you run KOC campaigns on?",
        answer: "Mainly X (Twitter) and Telegram, where crypto audiences are most active.",
      },
      {
        question: "How much does a KOC campaign cost?",
        answer: "Every campaign is priced per project, based on its goals, size and timing. Tell us what you are launching and we will scope it.",
      },
      {
        question: "Can we see results from past campaigns?",
        answer:
          "We do not publish campaign results, out of respect for our partners. Get in touch and we can talk about the work we have done that is closest to yours.",
      },
    ],
    related: ["kol-marketing", "token-launch-marketing", "community-management"],
    seo: {
      title: "Crypto KOC Marketing Agency",
      description:
        "Crypto KOC marketing by Unique Labs: real users and creators recommend your exchange or token, planned and run end to end. KOC partner of Bybit and Gate.",
    },
  },
  {
    slug: "kol-marketing",
    name: "KOL marketing",
    title: "Web3 KOL marketing",
    summary: "Crypto KOL and influencer campaigns on X and Telegram, matched to your audience and timed to your milestones.",
    quickAnswer:
      "KOL (key opinion leader) marketing puts your project in front of established crypto voices and their audiences. Unique Labs runs KOL campaigns for exchanges and Web3 projects: we match you with KOLs whose audience fits, write the brief, time the posts around your milestones and keep the campaign coordinated from start to finish.",
    icon: "zap",
    audience: [
      "Projects announcing a launch, listing or major update",
      "Exchanges promoting campaigns and new products",
      "Ecosystems and apps that need reach in a new market",
    ],
    sections: [
      {
        heading: "What KOL marketing does for a Web3 project",
        body: `In crypto, attention moves through people. A KOL's post, thread or live session can put a project in front of tens of thousands of interested readers in a day — which is why KOL campaigns sit at the centre of most launches.

Done well, a KOL campaign creates a moment: several trusted voices talking about the same news at the right time. Done badly, it is a scatter of paid posts to audiences that do not care. The difference is in who you choose, what you ask them to say and when.`,
      },
      {
        heading: "Choosing the right KOLs",
        body: `- **Audience fit.** A KOL's followers should be the people you want: traders for an exchange, builders for a developer tool, gamers for a Web3 game.
- **Authenticity.** Real engagement, not bought followers. Replies and conversations tell you more than follower counts.
- **A mix of sizes.** Larger accounts for reach, smaller specialist voices for credibility.
- **Track record.** How a KOL has handled sponsored posts before, and whether their audience trusted them.`,
      },
      {
        heading: "Campaign formats",
        body: `- Threads and posts on X (Twitter)
- Quote-post campaigns around an announcement
- AMAs and live sessions with your team
- Telegram channel and group posts
- Creator campaigns that pair KOLs with [KOCs](/services/koc-marketing) for both reach and trust`,
      },
      {
        heading: "What we do",
        body: `We match KOLs to your goals, shape the message, time the posts around your milestones and keep the campaign coordinated from start to finish. For launches, KOL campaigns are usually one part of a wider [token launch plan](/services/token-launch-marketing).

We are a KOL partner to exchanges including KuCoin and OKX, and have run KOL campaigns for many Web3 projects — they are listed below.`,
      },
    ],
    proofRoles: ["KOL Partner", "KOL Campaign", "Creator Campaigns"],
    faqs: [
      {
        question: "What is a Web3 KOL?",
        answer:
          "A key opinion leader in crypto: an established voice — usually on X (Twitter), Telegram or YouTube — whose audience follows them for news, analysis or opinions about Web3.",
      },
      {
        question: "How do you avoid KOLs with fake followers?",
        answer:
          "We look past follower counts at real engagement: replies, conversations and how the audience has reacted to past posts. Accounts whose engagement does not match their size are left out.",
      },
      {
        question: "Should we use KOLs or KOCs?",
        answer:
          "KOLs bring reach, KOCs bring trust and action. For a launch, KOLs usually make people aware and KOCs show real people using the product. We run both, so they can be planned together.",
      },
      {
        question: "Do you run AMAs?",
        answer: "Yes. AMAs and live sessions are one of the formats we use in KOL and community campaigns.",
      },
      {
        question: "How is a KOL campaign priced?",
        answer: "Every campaign is priced per project, depending on the goals, the number and size of KOLs and the timeline.",
      },
      {
        question: "Can we see results from past campaigns?",
        answer: "We do not publish campaign results. Get in touch and we can talk about past work similar to yours.",
      },
    ],
    related: ["koc-marketing", "token-launch-marketing", "digital-marketing"],
    seo: {
      title: "Web3 & Crypto KOL Marketing Agency",
      description:
        "Web3 KOL marketing from Unique Labs: crypto influencer campaigns on X and Telegram, from KOL selection to briefs and timing. KOL partner of KuCoin and OKX.",
    },
  },
  {
    slug: "token-launch-marketing",
    name: "Token launch marketing",
    title: "Token launch marketing, from announcement to TGE",
    summary: "KOC and KOL campaigns, community and launchpad experience brought together around your launch date.",
    quickAnswer:
      "Token launch marketing builds awareness, a real community and demand before a token generation event (TGE), then keeps momentum after listing. Unique Labs brings KOC and KOL campaigns, community work and experience with launchpads and IDO platforms together into one plan around your launch date.",
    icon: "gauge",
    audience: [
      "Teams preparing an IDO, launchpad sale or TGE",
      "Projects heading to a centralised exchange listing",
      "Teams relaunching after a quiet period",
    ],
    sections: [
      {
        heading: "The phases of a token launch",
        body: `Most launches move through the same stages, whatever the chain:

1. **Before the announcement** — a clear story, a website and docs that answer the obvious questions, and community channels ready to receive people.
2. **Announcement and awareness** — the news goes out; KOLs, AMAs and quests bring attention.
3. **Sale or whitelist** — an IDO or launchpad round, with real users rather than bots and farmers.
4. **TGE and listing** — the token goes live; exchanges, community and partners amplify the moment.
5. **After launch** — keeping holders informed and engaged when the first wave of attention fades.

The most common mistake is starting marketing too late, or stopping the day after TGE.`,
      },
      {
        heading: "Where we help",
        body: `- **KOC and KOL campaigns** timed to each phase — awareness first, then real users showing the product ([KOC](/services/koc-marketing) and [KOL marketing](/services/kol-marketing)).
- **Community** — Telegram and X communities ready before the announcement, with AMAs along the way ([community management](/services/community-management)).
- **Campaigns** — quests and engagement campaigns that reward real participation.
- **Launchpads and IDO platforms** — we have worked alongside launchpads and IDO platforms and know what they expect from projects.
- **Planning** — one plan that ties these together, so nothing collides with your sale or listing dates ([Web3 consultancy](/services/web3-consulting)).`,
      },
      {
        heading: "Launchpads and IDO platforms we have worked with",
        body: `Our partners include launchpads such as TrustFi, SeaFi, Tenset, Vision Launch, RedKite, Nova Labs and Alpha Launcher, and IDO platforms such as OpenPad, BSCS, DAO Maker, DeXe and Fjord Foundry. We have also run token sale campaigns for CoinList, and are a core contributor to Seedify, whose community we joined in 2021.`,
      },
    ],
    proofRoles: ["Launchpad Partner", "IDO Partner", "Token Sale Campaigns", "Core Contributor", "Launch Support"],
    faqs: [
      {
        question: "When should token launch marketing start?",
        answer:
          "Well before the announcement. A community and a clear story need time to form, and launchpads look at community activity before a sale. Starting late is the most common mistake.",
      },
      {
        question: "What is a TGE?",
        answer:
          "A token generation event: the moment a token is created and starts to circulate, usually followed by trading on decentralised or centralised exchanges.",
      },
      {
        question: "Do you work with launchpads and IDO platforms?",
        answer:
          "Yes. We have worked with launchpads including TrustFi, SeaFi, Tenset and Vision Launch, and IDO platforms including DAO Maker, OpenPad, BSCS, DeXe and Fjord Foundry.",
      },
      {
        question: "Can you guarantee a sale result or token price?",
        answer:
          "No. Nobody honestly can. Marketing can build awareness, trust and a real community; prices and sale outcomes depend on many things outside any agency's control.",
      },
      {
        question: "What happens after listing?",
        answer:
          "Launches need a plan for the weeks after TGE too: regular updates, community activity and campaigns that give holders reasons to stay involved.",
      },
      {
        question: "How is launch marketing priced?",
        answer: "It is priced per project, based on the launch timeline, the channels involved and the scale of the campaigns.",
      },
    ],
    related: ["koc-marketing", "kol-marketing", "community-management", "web3-consulting"],
    seo: {
      title: "Token Launch & IDO Marketing Agency",
      description:
        "Token launch and IDO marketing by Unique Labs: KOC and KOL campaigns, launchpad coordination and community growth before and after your TGE.",
    },
  },
  {
    slug: "web3-consulting",
    name: "Web3 consultancy",
    title: "Web3 consultancy for founders and growth teams",
    summary: "Positioning, go-to-market and growth plans — and help putting them into action.",
    quickAnswer:
      "Unique Labs advises Web3 founders and teams on positioning, go-to-market and growth, then helps put the plan into action. From product and growth strategy to launch planning, we work alongside you to turn ideas into a clear plan, drawing on years of running campaigns with exchanges, launchpads and ecosystems.",
    icon: "compass",
    audience: [
      "Founders preparing a first launch",
      "Teams whose growth has stalled",
      "Exchanges and ecosystems entering new markets",
    ],
    sections: [
      {
        heading: "When to bring in a Web3 consultant",
        body: `- You have a product but no clear story for who it is for and why it matters.
- A launch is coming and the plan lives in a group chat.
- You are spending on marketing without knowing what works.
- You are entering a new market or audience and need people who know it.`,
      },
      {
        heading: "What we advise on",
        body: `- **Positioning** — who the product is for, what makes it different and how to say it.
- **Go-to-market** — the sequence of announcements, campaigns, partnerships and listings.
- **Growth strategy** — which channels to use, in what order, and what to stop doing.
- **Community** — how to grow one that stays, not just one that farms.
- **Product** — what users will actually respond to, from people who have used hundreds of Web3 products.`,
      },
      {
        heading: "From plan to execution",
        body: `Advice is most useful when someone helps carry it out. Because we also run [KOC](/services/koc-marketing) and [KOL campaigns](/services/kol-marketing), [community management](/services/community-management), [digital marketing](/services/digital-marketing) and [blockchain development](/services/blockchain-development), the plan does not have to be handed to a different team to become real.`,
      },
      {
        heading: "Where our perspective comes from",
        body: `We have been in Web3 since 2019 — first as users hunting airdrops, then as community contributors and ambassadors, and now as partners to exchanges, launchpads and ecosystems. That includes a strategic partnership with LBank, an ambassador role with Bitget and ecosystem campaigns on Base, Solana and BNB Chain. Read [our story](/journey).`,
      },
    ],
    proofRoles: ["Strategic Partnership", "Ambassador", "Ecosystem Campaigns", "Ecosystem Advocate"],
    faqs: [
      {
        question: "What does a Web3 consultant do?",
        answer:
          "Helps a project decide who it is for, how to launch and how to grow — positioning, go-to-market planning, channel choices and community strategy — and, ideally, helps carry the plan out.",
      },
      {
        question: "Do you only advise, or also execute?",
        answer:
          "Both. We advise and then help put the plan into action with campaigns, community management, digital marketing and development.",
      },
      {
        question: "Do you work with early-stage projects?",
        answer: "Yes. Early advice on positioning and launch planning often saves the most time and money later.",
      },
      {
        question: "How is consultancy priced?",
        answer: "It is priced per project, depending on the scope and how long you need us.",
      },
    ],
    related: ["token-launch-marketing", "digital-marketing", "koc-marketing"],
    seo: {
      title: "Web3 Consultancy & Go-to-Market Strategy",
      description:
        "Web3 consultancy from Unique Labs: positioning, go-to-market and growth plans for token projects and exchanges, from a team with 240+ Web3 partners.",
    },
  },
  {
    slug: "digital-marketing",
    name: "Digital marketing",
    title: "Digital marketing for Web3 projects and brands",
    summary: "Social media, content, community and campaigns on the channels where your audience spends its time.",
    quickAnswer:
      "Unique Labs runs digital marketing for brands and Web3 projects: social media, content, community and campaign management on the channels where your audience spends its time. The goal is simple — reach the right people, launch with momentum and keep growing after the launch.",
    icon: "globe",
    audience: ["Web3 projects that need a steady presence", "Brands reaching crypto-native audiences", "Teams without an in-house marketing team"],
    sections: [
      {
        heading: "What we cover",
        body: `- **Social media** — planning and posting on X (Twitter) and other channels your audience uses.
- **Content** — threads, announcements, explainers and campaign material.
- **Community** — keeping Telegram and X communities active ([community management](/services/community-management)).
- **Campaigns** — quests, engagement and growth campaigns, and trading campaigns for exchanges.`,
      },
      {
        heading: "Quest and engagement campaigns",
        body: `Quest platforms and engagement campaigns reward people for taking part: following, trying a product, joining a community. They work best when the tasks bring real users rather than farmers, and when there is something worthwhile for them afterwards. We have run quest campaigns with Galxe and engagement campaigns for projects such as Aptos, MetaMask, Aleo and Litecoin.`,
      },
      {
        heading: "Working with KOCs and KOLs",
        body: `Digital marketing rarely works on its own in crypto. It works best alongside [KOC](/services/koc-marketing) and [KOL campaigns](/services/kol-marketing), so the people talking about a project and the project's own channels say the same thing at the same time.`,
      },
    ],
    proofRoles: ["Quest Campaign Partner", "Engagement Campaign", "Growth Campaign", "Trading Campaign Partner", "Campaign Partner", "Promotional Partner"],
    faqs: [
      {
        question: "Do you only work with Web3 projects?",
        answer: "No. We work with brands as well as Web3 projects, though most of our experience is with exchanges and crypto projects.",
      },
      {
        question: "Which channels do you work on?",
        answer: "Mainly X (Twitter) and Telegram, plus the other channels where a project's audience spends its time.",
      },
      {
        question: "Do you run quest campaigns?",
        answer: "Yes. We have run quest campaigns with Galxe and engagement campaigns for many Web3 projects.",
      },
      {
        question: "How is digital marketing priced?",
        answer: "It is priced per project, based on the channels, the amount of content and the length of the engagement.",
      },
    ],
    related: ["community-management", "kol-marketing", "koc-marketing"],
    seo: {
      title: "Digital Marketing for Web3 Projects & Brands",
      description:
        "Digital marketing by Unique Labs: social media, content, community and campaigns on X, Telegram and beyond, for Web3 projects and brands that want to grow.",
    },
  },
  {
    slug: "community-management",
    name: "Community management",
    title: "Community management for crypto projects",
    summary: "Telegram and X communities, ambassador programmes and AMAs, run by a team that grew up in Web3 communities.",
    quickAnswer:
      "Crypto community management keeps a project's Telegram, X and other channels active, safe and on-message: moderation, announcements, AMAs and ambassador programmes. Unique Labs' team started as community members and ambassadors, and now runs community work for Web3 projects.",
    icon: "layers",
    audience: ["Projects launching a community from scratch", "Communities that have gone quiet", "Teams preparing for a launch or listing"],
    sections: [
      {
        heading: "What community management covers",
        body: `- **Moderation and safety** — keeping out scammers, impersonators and spam, and answering questions before misinformation spreads.
- **Announcements** — clear, timely updates in every channel.
- **Engagement** — conversations, events and reasons for members to stay.
- **AMAs and live sessions** — regular chances for the community to hear from the team.
- **Ambassador programmes** — giving your most active members a role.`,
      },
      {
        heading: "Ambassador programmes",
        body: `The best communities are partly run by their own members. An ambassador programme gives active people a role — welcoming newcomers, answering questions, creating content — and recognition for it.

We know these programmes from the inside: one of us was part of the Seedify ambassador team in 2022, and we have held ambassador roles since, including with Bitget.`,
      },
      {
        heading: "Why it matters at launch",
        body: `Launchpads, exchanges and investors look at a project's community. An active, well-run community is also where a [token launch](/services/token-launch-marketing) gets its first real holders — and where they decide whether to stay.`,
      },
    ],
    proofRoles: ["Community Campaign", "Community Partner", "Core Contributor", "Ambassador", "Early-Access Community", "Community Advocate"],
    faqs: [
      {
        question: "What does a crypto community manager do?",
        answer:
          "Keeps a project's channels active and safe: moderating, answering questions, posting announcements, running events and AMAs, and supporting ambassadors.",
      },
      {
        question: "Which platforms do you manage?",
        answer: "Mainly Telegram and X (Twitter), where crypto communities are most active.",
      },
      {
        question: "How do you deal with scams and impersonators?",
        answer:
          "With active moderation, clear rules and regular reminders of the official accounts, so members know who speaks for the project.",
      },
      {
        question: "Do you run ambassador programmes?",
        answer: "Yes. Our team has been on the ambassador side — including Seedify's ambassador team — and we help projects build their own programmes.",
      },
      {
        question: "How is community management priced?",
        answer: "It is priced per project, based on the channels, the size of the community and the hours of cover needed.",
      },
    ],
    related: ["token-launch-marketing", "digital-marketing", "koc-marketing"],
    seo: {
      title: "Crypto Community Management Services",
      description:
        "Crypto community management by Unique Labs: Telegram and X communities, ambassador programmes and AMAs, run by a team that grew up in Web3 communities.",
    },
  },
  {
    slug: "blockchain-development",
    name: "Blockchain development",
    title: "Blockchain and smart contract development",
    summary: "Smart contracts, decentralised applications and the websites and tools around them.",
    quickAnswer:
      "Unique Labs designs and develops blockchain solutions for Web3 projects — from smart contracts to decentralised applications and the websites and tools around them. The same team builds our own software, so a project gets one partner for the contracts, the product and the launch.",
    icon: "boxes",
    audience: ["Web3 projects that need contracts, a dApp or a site", "Teams that want development and marketing in one place", "Founders turning an idea into a first product"],
    sections: [
      {
        heading: "What we build",
        body: `- **Smart contracts** — the on-chain logic of a token, sale, staking or application.
- **Decentralised applications (dApps)** — the interface people use to interact with the contracts.
- **Websites and tools** — project sites, dashboards, documentation and the tools around a launch.
- **Browser extensions** — see [Chrome extension development](/services/chrome-extension-development).`,
      },
      {
        heading: "What drives the cost of a blockchain project",
        body: `- **Scope** — a standard token contract is a small job; a protocol with several interacting contracts is a large one.
- **Security** — the more value a contract holds, the more care, testing and independent review it needs.
- **Chain** — some chains and languages have more mature tooling than others.
- **The product around it** — most projects need a dApp, a website and launch support, not just contracts.

Every project is priced per project once the scope is clear.`,
      },
      {
        heading: "Development and launch together",
        body: `Building the product and launching it are usually handled by different teams that rarely talk. At Unique Labs they sit under one roof: the people who build your contracts and site work alongside the people running your [launch](/services/token-launch-marketing), [community](/services/community-management) and [campaigns](/services/koc-marketing).`,
      },
    ],
    faqs: [
      {
        question: "What does a blockchain development company do?",
        answer:
          "Designs and builds the on-chain and off-chain parts of a Web3 product: smart contracts, decentralised applications, and the websites and tools around them.",
      },
      {
        question: "How much does smart contract development cost?",
        answer:
          "It depends on scope, security needs and the chain. We price every project individually once the scope is clear — tell us what you are building.",
      },
      {
        question: "Can you also market what you build?",
        answer: "Yes. Development, launch marketing, community and campaigns are all done by the same company.",
      },
      {
        question: "Where is your team based?",
        answer: "In Bangladesh, with our office in Dhaka. We work with projects worldwide.",
      },
    ],
    related: ["chrome-extension-development", "web3-consulting", "token-launch-marketing"],
    seo: {
      title: "Blockchain & Smart Contract Development",
      description:
        "Blockchain development by Unique Labs: smart contracts, decentralised applications and the websites and tools around them, for Web3 projects worldwide.",
    },
  },
  {
    slug: "chrome-extension-development",
    name: "Chrome extension development",
    title: "Chrome extension development",
    summary: "The team behind nine of its own Chrome extensions, building yours — from idea to Chrome Web Store.",
    quickAnswer:
      "Unique Labs builds Chrome extensions end to end: design, development, privacy policy and Chrome Web Store listing. We have shipped nine extensions of our own — from a PDF editor and a screen recorder to a 2FA authenticator and an on-device AI reply generator — and bring the same care to extensions we build for others.",
    icon: "puzzle",
    audience: ["Companies that want a browser extension for their product", "Founders with an extension idea", "Teams moving an old extension to Manifest V3"],
    sections: [
      {
        heading: "Extensions we have built",
        body: `Our own products are the best proof of how we work. They include [Unique PDF](/products/unique-pdf) (20 PDF tools and AI chat, with files processed in the browser), [FrameShot](/products/frameshot) (screen recording and full-page screenshots), [Twofold](/products/twofold) (2FA codes, autofill and encrypted sync), [Rowlio](/products/rowlio) (web scraping to CSV, Excel or JSON), [XAICG](/products/xaicg) (AI replies written on the user's own computer) and growth tools for X such as [UnfollowX Pro](/products/unfollowx-pro) and [GrowX](/products/growx). All of them are listed below.`,
      },
      {
        heading: "How we build extensions",
        body: `- **Manifest V3** — the current extension format, which the Chrome Web Store requires.
- **Privacy first** — wherever practical, data stays on the user's device. Several of our extensions process files and run AI locally, in the browser.
- **Fast and light** — extensions run on every page a user opens, so they must not slow the browser down.
- **Store-ready** — a clear listing, screenshots, a privacy policy that matches what the code does, and permissions that reviewers can understand.`,
      },
      {
        heading: "What we deliver",
        body: `We take an extension from idea to the Chrome Web Store: design, development, the privacy policy and the store listing. Every project is priced per project once the scope is clear.`,
      },
    ],
    products: ["unique-pdf", "frameshot", "twofold", "rowlio", "xaicg", "unfollowx-pro", "growx", "scorex", "uniquefarm"],
    faqs: [
      {
        question: "Do you build Chrome extensions for clients?",
        answer: "Yes. We build extensions for other companies with the same team and approach as our own nine extensions.",
      },
      {
        question: "What is Manifest V3?",
        answer:
          "The current format for Chrome extensions. It changes how background code and network rules work, and the Chrome Web Store requires it for extensions.",
      },
      {
        question: "Can you help with the Chrome Web Store review?",
        answer:
          "Yes. The store listing and a privacy policy that matches what the extension does are part of building it, and they are what reviewers look at.",
      },
      {
        question: "Can an extension run AI without sending data to a server?",
        answer: "In many cases, yes. Our own XAICG writes its drafts with an AI model that runs on the user's computer.",
      },
      {
        question: "How is extension development priced?",
        answer: "It is priced per project, depending on features, integrations and design.",
      },
    ],
    related: ["blockchain-development", "web3-consulting", "digital-marketing"],
    seo: {
      title: "Chrome Extension Development Company",
      description:
        "Chrome extension development by the team behind nine of its own extensions, including Unique PDF, FrameShot and XAICG. Manifest V3, privacy-first.",
    },
  },
];
