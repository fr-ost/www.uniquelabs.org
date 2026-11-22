import type { CategoryInput, ProductInput } from "./schema";

/** Product categories (shown as filters once a product uses them). */
export const categories: CategoryInput[] = [
  { slug: "browser-extensions", name: "Browser Extensions" },
  { slug: "web-applications", name: "Web Applications" },
  { slug: "productivity", name: "Productivity" },
  { slug: "utilities", name: "Utilities" },
];

/**
 * Products, in display order. Add only real products. Template:
 *
 * {
 *   slug: "my-product",                      // → /products/my-product
 *   name: "My Product",
 *   tagline: "One short line.",
 *   summary: "One or two sentences for cards.",
 *   description: "Longer **Markdown** description.",
 *   category: "browser-extensions",
 *   platforms: ["CHROME_EXTENSION", "EDGE_ADDON"],
 *   stage: "AVAILABLE",                      // AVAILABLE · BETA · COMING_SOON · PRIVATE · DISCONTINUED
 *   pricing: "FREE",                         // FREE · FREEMIUM · PAID · OPEN_SOURCE · UNSPECIFIED
 *   released: "2025-06",
 *   cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/…" },
 *   website: "https://…",
 *   logo: { src: "/images/products/my-product/logo.png", alt: "My Product logo", width: 256, height: 256 },
 *   cover: { src: "/images/products/my-product/cover.png", alt: "My Product screenshot" },
 *   screenshots: [{ src: "/images/products/my-product/1.png", caption: "Main view" }],
 *   features: [{ title: "Works offline", description: "…" }],
 *   links: [{ kind: "PRIVACY_POLICY", url: "https://…" }],
 *   accentColor: "#ff6b35",
 *   featured: true,
 * },
 */
export const products: ProductInput[] = [
  {
    slug: "unfollowx-pro",
    name: "UnfollowX Pro",
    tagline: "Free & unlimited mass unfollow on X (Twitter).",
    summary:
      "See who doesn't follow you back on X, who unfollowed you and which accounts have gone quiet — then unfollow the ones you choose, at a safe pace. Free, with no limits and no sign-up.",
    description: `UnfollowX Pro shows you who doesn't follow you back on X (Twitter), who unfollowed you, and which accounts have gone quiet. Then it unfollows the ones you choose, at a safe pace, while you keep browsing. It's free, with no limits, no sign-up and no subscription.

### How it works

1. Open x.com and sign in as usual.
2. Click the extension icon and press **Scan my following**. It takes about a minute and changes nothing.
3. Look through the results and add anyone you want to keep to the whitelist.
4. Press **Unfollow non-followers**, or open the dashboard and choose exactly who goes.

### Safe by design

X restricts accounts that unfollow too quickly, so UnfollowX Pro works at a human pace: random gaps between unfollows, regular breaks and a daily limit. Choose Safe, Balanced or Fast, or set your own numbers — and stop instantly at any time.

Works with both the new and the classic X website, in English, Spanish, Portuguese (Brazil), Hindi, Indonesian, Turkish and Arabic.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREE",
    audience: "Anyone who wants a cleaner X (Twitter) following list",
    website: "https://www.unfollowx.com",
    cta: { label: "Add to Chrome — free", url: "https://chromewebstore.google.com/detail/x-twitter-mass-unfollow-t/igpjmagghnibmjkkdcgpjgpkfkpiglnl" },
    logo: { src: "/images/products/unfollowx-pro/logo.png", alt: "UnfollowX Pro logo", width: 128, height: 128 },
    cover: { src: "/images/products/unfollowx-pro/cover.webp", alt: "UnfollowX Pro: unfollow everyone who doesn't follow you back", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/unfollowx-pro/screenshot-1.webp", alt: "Unfollowing non-followers with UnfollowX Pro", width: 1280, height: 800, caption: "Unfollow non-followers in one click, or pick exactly who goes" },
      { src: "/images/products/unfollowx-pro/screenshot-2.webp", alt: "UnfollowX Pro showing who unfollowed you", width: 1280, height: 800, caption: "See who unfollowed you since your last check" },
      { src: "/images/products/unfollowx-pro/screenshot-3.webp", alt: "UnfollowX Pro filtering inactive and non-verified accounts", width: 1280, height: 800, caption: "Find inactive accounts and accounts without a blue check" },
    ],
    features: [
      { title: "Non-followers", description: "Lists everyone you follow who doesn't follow you back — unfollow them all in one click, or only the ones you pick." },
      { title: "Who unfollowed you", description: "Each scan shows who left, who's new and who you haven't followed back yet." },
      { title: "Inactive accounts", description: "Finds accounts that haven't posted in 30 days, 90 days, 6 months or a year, and accounts without a blue check." },
      { title: "Whitelist & rules", description: "Keep the people you care about, plus whole groups such as verified, private or recently followed accounts." },
      { title: "Choose exactly who goes", description: "Search, filter, save selections as groups, export to CSV or import a list of handles." },
      { title: "Safe pacing", description: "Random gaps, regular breaks and a daily limit; it keeps working in the background and stops instantly when you ask." },
      { title: "Undo mistakes", description: "Follow people back, or re-follow anyone you removed by mistake from History." },
      { title: "Free & private", description: "No limits, no sign-up and no subscription." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://www.unfollowx.com" },
      { kind: "STORE_LISTING", url: "https://chromewebstore.google.com/detail/x-twitter-mass-unfollow-t/igpjmagghnibmjkkdcgpjgpkfkpiglnl" },
      { kind: "PRIVACY_POLICY", url: "https://www.unfollowx.com/privacy" },
    ],
    seo: {
      title: "UnfollowX Pro: Free Mass Unfollow Tool for X",
      description: "UnfollowX Pro is a free Chrome extension that shows who doesn't follow you back on X (Twitter) and unfollows them at a safe pace. No limits, no sign-up.",
    },
    accentColor: "#3d5afe",
    featured: true,
  },
  {
    slug: "growx",
    name: "GrowX",
    tagline: "The ultimate X (Twitter) growth tool.",
    summary:
      "The all-in-one X (Twitter) growth tool for Chrome: smart auto follow, a post scheduler, an on-device AI writer, analytics, an unfollower tracker and cleanup.",
    description: `GrowX is the all-in-one X (Twitter) growth tool for Chrome: smart auto follow, a post scheduler, an on-device AI writer, analytics, an unfollower tracker and cleanup — in one extension.

### Free forever, with an optional Premium

The free plan includes the Safe and Balanced auto-follow paces, sources and core filters, and scheduling with up to 10 posts waiting. Premium adds faster paces and more room, with a free 30-day trial and no credit card required.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREEMIUM",
    audience: "Creators and brands growing on X (Twitter)",
    website: "https://www.growxapp.org",
    cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh" },
    logo: { src: "/images/products/growx/logo.png", alt: "GrowX logo", width: 128, height: 128 },
    cover: { src: "/images/products/growx/cover.webp", alt: "GrowX: the ultimate X growth tool", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/growx/screenshot-1.webp", alt: "GrowX dashboard overview", width: 1280, height: 614, caption: "Your growth at a glance" },
      { src: "/images/products/growx/screenshot-2.webp", alt: "GrowX smart auto follow", width: 1280, height: 560, caption: "Smart auto follow at a safe pace" },
      { src: "/images/products/growx/screenshot-3.webp", alt: "GrowX analytics", width: 1280, height: 560, caption: "Analytics and insights" },
    ],
    features: [
      { title: "Smart auto follow", description: "Grow your audience from the sources you choose, with filters and safe daily paces." },
      { title: "Post scheduler", description: "Queue posts and threads to go out at the right time." },
      { title: "On-device AI writer", description: "Draft posts with the GrowX AI writer." },
      { title: "Analytics", description: "Track followers and growth over time." },
      { title: "Unfollower tracker", description: "See who unfollowed you." },
      { title: "Cleanup", description: "Tidy up the accounts you follow." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://www.growxapp.org" },
      { kind: "STORE_LISTING", url: "https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh" },
      { kind: "PRIVACY_POLICY", url: "https://www.growxapp.org/privacy" },
    ],
    seo: {
      title: "GrowX: X (Twitter) Growth Tool for Chrome",
      description: "GrowX is an all-in-one X (Twitter) growth extension for Chrome: smart auto follow, a post scheduler, an on-device AI writer and an unfollower tracker.",
    },
    accentColor: "#f0405a",
    featured: true,
  },
  {
    slug: "unique-pdf",
    name: "Unique PDF",
    tagline: "The free PDF editor with AI chat.",
    summary:
      "20 PDF tools in one Chrome extension — merge, split, compress, edit, sign and protect, plus Unique AI to chat with any PDF. Everything runs in your browser: nothing is uploaded.",
    description: `Unique PDF brings 20 PDF tools into a full-tab application, including **Unique AI**: chat with any PDF (answers link to the pages they come from) and get an AI summary.

Every file is processed in your browser — nothing is uploaded, there is no account, no quota, no watermark and no tracking. It keeps working offline once installed.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREE",
    website: "https://pdf.uniquelabs.org",
    cta: { label: "Add to Chrome — free", url: "https://chromewebstore.google.com/detail/ogajiapfmheeiadeflajlkikpfkoobfl" },
    logo: { src: "/images/products/unique-pdf/logo.png", alt: "Unique PDF logo", width: 256, height: 256 },
    cover: { src: "/images/products/unique-pdf/cover.webp", alt: "Unique PDF: the free PDF editor with AI chat", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/unique-pdf/screenshot-1.webp", alt: "Chatting with a PDF in Unique PDF", width: 1280, height: 800, caption: "Chat with any PDF — answers cite their pages" },
      { src: "/images/products/unique-pdf/screenshot-2.webp", alt: "Unique PDF AI summary", width: 1280, height: 800, caption: "Instant AI summaries" },
      { src: "/images/products/unique-pdf/screenshot-3.webp", alt: "Unique PDF tools", width: 1280, height: 800, caption: "20 PDF tools, all free" },
    ],
    features: [
      { title: "Unique AI", description: "Chat with any PDF, with clickable page citations, and get key points and a TL;DR summary." },
      { title: "Organize", description: "Merge, split, reorder, rotate, delete and extract pages." },
      { title: "Convert", description: "Compress PDFs, turn images into PDFs and PDFs into images." },
      { title: "Edit & sign", description: "Add text, drawings, highlights, shapes and images; sign and watermark." },
      { title: "Security", description: "Protect with AES-256, unlock, redact for real and edit metadata." },
      { title: "Private by design", description: "Files never leave your device — no uploads, account, quota or watermark, and it works offline." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://pdf.uniquelabs.org" },
      { kind: "STORE_LISTING", url: "https://chromewebstore.google.com/detail/ogajiapfmheeiadeflajlkikpfkoobfl" },
    ],
    seo: {
      title: "Unique PDF: Free PDF Editor Chrome Extension",
      description: "Unique PDF puts 20 free PDF tools in Chrome: merge, split, compress, edit, sign and protect, plus AI chat with any PDF. Files never leave your browser.",
    },
    accentColor: "#7b61ff",
    featured: true,
  },
  {
    slug: "frameshot",
    name: "FrameShot",
    tagline: "Free screen recorder & full-page screenshot.",
    summary:
      "Record your screen with sound and camera, or capture a whole web page in one click — then annotate, blur and share. Free forever, no watermark, and your captures stay on your device.",
    description: `FrameShot is a local-first Chrome extension for capturing, recording, editing, organising and exporting what's on your screen. It pairs a quick-capture toolbar popup with **FrameShot Studio**, a full application that opens in its own tab.

Every feature is available to everyone: no paid plans, subscriptions, watermarks, time limits, accounts, ads or locked features. Screenshots and recordings stay on your device.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREE",
    website: "https://frameshot.uniquelabs.org",
    cta: { label: "Add to Chrome — free", url: "https://chromewebstore.google.com/detail/adcgjmghjagflmmndoajdidcopodacac" },
    logo: { src: "/images/products/frameshot/logo.png", alt: "FrameShot logo", width: 128, height: 128 },
    cover: { src: "/images/products/frameshot/cover.webp", alt: "FrameShot: free screen recorder and full-page screenshot", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/frameshot/screenshot-1.webp", alt: "FrameShot capture", width: 1280, height: 800 },
      { src: "/images/products/frameshot/screenshot-2.webp", alt: "FrameShot editor", width: 1280, height: 800 },
      { src: "/images/products/frameshot/screenshot-3.webp", alt: "FrameShot Studio", width: 1280, height: 800 },
    ],
    features: [
      { title: "Full-page capture", description: "Scroll-and-stitch the whole page, with sticky headers placed once and lazy-loaded content loaded first." },
      { title: "Area, element & panel", description: "Capture the visible area, a selection, any page element or the full content of a scrolling panel." },
      { title: "Screen recorder", description: "Record a tab, a window or the whole screen with tab audio, microphone and a camera bubble." },
      { title: "MP4, WebM & GIF", description: "Export recordings from 720p to 4K, or trim them into a GIF." },
      { title: "Annotate & blur", description: "Edit captures in FrameShot Studio before you share them." },
      { title: "Free & local", description: "No watermark, no sign-up, no limits — everything stays on your device." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://frameshot.uniquelabs.org" },
      { kind: "STORE_LISTING", url: "https://chromewebstore.google.com/detail/adcgjmghjagflmmndoajdidcopodacac" },
    ],
    seo: {
      title: "FrameShot: Free Screen Recorder for Chrome",
      description: "FrameShot is a free Chrome screen recorder and full-page screenshot tool. Record with sound and camera, annotate and blur. No watermark, stays on device.",
    },
    accentColor: "#6d4cf6",
    featured: true,
  },
  {
    slug: "twofold",
    name: "Twofold",
    tagline: "2FA codes, autofill & passkeys.",
    summary:
      "A free 2FA authenticator for Chrome: one-click codes, smart autofill that ignores fake sites, passkeys, QR scanning and end-to-end encrypted backup & sync. No ads, works offline.",
    description: `Twofold puts your two-factor codes one click away: TOTP, HOTP and Steam Guard codes, smart autofill that only matches a service's real domains, and a built-in passkey authenticator — all in one Chrome extension.

Backups are password-encrypted, and sync through Chrome Sync or Google Drive is end-to-end encrypted with your master password. Free forever, with no ads, no tracking and no runtime dependencies.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREE",
    website: "https://twofold.uniquelabs.org",
    cta: { label: "Add to Chrome — free", url: "https://chromewebstore.google.com/detail/kgjmfhcleplfocnbpfklmejgemkgmpfb" },
    logo: { src: "/images/products/twofold/logo.png", alt: "Twofold logo", width: 128, height: 128 },
    cover: { src: "/images/products/twofold/cover.webp", alt: "Twofold: 2FA codes, autofill and passkeys", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/twofold/screenshot-1.webp", alt: "Twofold codes dashboard", width: 1280, height: 800, caption: "All your codes, one click away" },
      { src: "/images/products/twofold/screenshot-2.webp", alt: "Twofold autofilling a 2FA field", width: 1280, height: 800, caption: "Smart autofill that ignores fake sites" },
      { src: "/images/products/twofold/screenshot-3.webp", alt: "Twofold passkeys", width: 1280, height: 800, caption: "Passkeys on any site" },
    ],
    features: [
      { title: "Codes", description: "TOTP, HOTP and Steam Guard, with live countdowns and one-click copy." },
      { title: "Smart autofill", description: "Detects 2FA fields and fills the right code." },
      { title: "Phishing-resistant", description: "Known services only match their real domains, so look-alike sites never get your codes." },
      { title: "Passkeys", description: "A built-in FIDO2/WebAuthn authenticator that works on any site." },
      { title: "Easy import", description: "Scan a QR code or import from Google Authenticator, Aegis, 2FAS, Bitwarden and more." },
      { title: "Encrypted backup & sync", description: "Password-encrypted backups, plus end-to-end encrypted Chrome Sync or Google Drive." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://twofold.uniquelabs.org" },
      { kind: "STORE_LISTING", url: "https://chromewebstore.google.com/detail/kgjmfhcleplfocnbpfklmejgemkgmpfb" },
    ],
    seo: {
      title: "Twofold: Free 2FA Authenticator for Chrome",
      description: "Twofold is a free 2FA authenticator for Chrome: one-click codes, phishing-aware autofill, passkeys, QR scanning and encrypted sync. No ads, works offline.",
    },
    accentColor: "#6e6afc",
    featured: true,
  },
  {
    slug: "rowlio",
    name: "Rowlio",
    tagline: "Turn any webpage into structured data.",
    summary:
      "A free web scraper and data extractor for Chrome. Extract tables, listings, links, images and contact details into clean rows, then export to CSV, Excel or JSON. Everything runs in your browser.",
    description: `Rowlio turns tables, product listings, search results, links, images, contact details and page metadata into clean rows you can review, tidy up and export to CSV, Excel, JSON, JSON Lines, TSV, Markdown or HTML.

Everything happens inside your browser: no account, no server, no usage limits and no premium tier.

### From page to file in three steps

1. Open a page and let Rowlio show what it contains — tables, lists, links and images.
2. Click one item and Rowlio finds the similar ones, with the fields inside them. Or use CSS selectors and XPath for full control.
3. Review and clean the rows, then export them in the format you need.

Pagination, infinite scroll and batch runs over a list of URLs are always started by you and bounded, with progress and a Stop button.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "AVAILABLE",
    pricing: "FREE",
    audience: "Anyone who needs data from web pages in a spreadsheet — no code required",
    website: "https://rowlio.uniquelabs.org",
    logo: { src: "/images/products/rowlio/logo.png", alt: "Rowlio logo", width: 128, height: 128 },
    cover: { src: "/images/products/rowlio/cover.webp", alt: "Rowlio: turn any webpage into structured data", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/rowlio/screenshot-1.webp", alt: "Rowlio home screen showing what a page contains", width: 1280, height: 800, caption: "See what a page contains the moment you open it" },
      { src: "/images/products/rowlio/screenshot-2.webp", alt: "Rowlio visual selector on a product listing", width: 1280, height: 800, caption: "Click one item — Rowlio finds the rest" },
      { src: "/images/products/rowlio/screenshot-3.webp", alt: "Rowlio export dialog", width: 1280, height: 800, caption: "Export to CSV, Excel, JSON and more" },
    ],
    features: [
      { title: "Tables, done properly", description: "Finds every table on a page and handles multi-row headers, merged cells and nested tables." },
      { title: "Visual selector", description: "Click one item and Rowlio finds the similar ones and their fields — title, price, image, link, rating and more." },
      { title: "CSS & XPath", description: "Advanced selectors with validation, match counts, previews and on-page highlighting." },
      { title: "Pagination & infinite scroll", description: "Follow next links, page numbers or your own selector — always user-started, bounded and stoppable." },
      { title: "Batch URLs", description: "Run one extraction over a list of pages you supply; every row records the page it came from." },
      { title: "Clean before you export", description: "Edit, sort, filter, remove duplicates, split and combine columns, with full undo and redo." },
      { title: "Links, images & contacts", description: "Extract links, images, email addresses, phone numbers, social profiles, metadata and structured data." },
      { title: "Export anywhere", description: "CSV, XLSX, JSON, JSON Lines, TSV, Markdown, HTML or the clipboard." },
      { title: "100% local", description: "No account, no server, no limits — your data never leaves your browser." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://rowlio.uniquelabs.org" },
      { kind: "PRIVACY_POLICY", url: "https://rowlio.uniquelabs.org/privacy" },
    ],
    seo: {
      title: "Rowlio: Free Web Scraper Chrome Extension",
      description: "Rowlio is a free web scraper for Chrome. Extract tables, listings, links, images and contacts into clean rows, then export to CSV, Excel or JSON locally.",
    },
    accentColor: "#0d9467",
    featured: true,
  },
  {
    slug: "scorex",
    name: "ScoreX",
    tagline: "Boost your influencer score on X (Twitter).",
    summary:
      "A Chrome extension that replies to the smart accounts you choose on X, in your own voice, from your own browser. You approve every reply, or let it run within strict limits. Invite only — early access.",
    description: `ScoreX helps you grow your influencer score on X (Twitter) by showing up in the right conversations, every day, in your own voice. Influencer and smart-follower scores rise when respected accounts notice and follow you — ScoreX makes that work steady and manageable.

### Four steps, then it runs every day

1. **Pick your targets.** Paste usernames or import a CSV.
2. **ScoreX watches for posts.** When a target posts, it drafts a short reply that adds something the author would want to answer.
3. **You approve.** Edit, skip or approve each draft — or switch to Full auto and it posts inside your daily limits.
4. **Track follow-backs.** See who followed back, after how many replies, and which tones work best.

### Careful by default

ScoreX runs in your own logged-in X tab and never asks for your password. Review mode is the default, with hard daily caps, human-like pacing and breaks. It stops on X warnings such as a captcha or rate limit.

### Good to know

ScoreX is invite only for now and needs a license key from Unique Labs. Replies are written with your own OpenAI API key. It cannot guarantee follow-backs or a higher score, and you are responsible for using it in line with X's rules. ScoreX is not affiliated with or endorsed by X Corp.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "BETA",
    audience: "People growing their influencer and smart-follower scores on X (Twitter)",
    website: "https://scorex.uniquelabs.org",
    cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/pckgdccdipdllagmieedopalgdoheklo" },
    logo: { src: "/images/products/scorex/logo.png", alt: "ScoreX logo", width: 128, height: 128 },
    cover: { src: "/images/products/scorex/cover.webp", alt: "ScoreX: get followed back by the accounts that move your score", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/scorex/screenshot-1.webp", alt: "ScoreX scores screen with score history", width: 1280, height: 800, caption: "Watch your score over time (sample data)" },
      { src: "/images/products/scorex/screenshot-2.webp", alt: "ScoreX safety settings with daily limits", width: 1280, height: 800, caption: "Hard limits, pacing and a risk estimate (sample data)" },
      { src: "/images/products/scorex/screenshot-3.webp", alt: "ScoreX follow-back history", width: 1280, height: 800, caption: "See who followed back (sample data)" },
    ],
    features: [
      { title: "Replies worth answering", description: "Each reply takes one clear approach — a sharp question, an honest doubt, a concrete example — and weak drafts are rewritten." },
      { title: "In your voice", description: "Replies follow your tone prompt and learn from your edits. No generic praise, no invented facts." },
      { title: "You approve", description: "Review mode by default: nothing posts until you approve it." },
      { title: "Spend replies where they pay off", description: "Follows an account before replying, stops once it follows back, and skips accounts that almost never do." },
      { title: "Score tracking", description: "Your TwitterScore, Sorsa, Ethos and Moni scores over time, and the scores of your targets." },
      { title: "Smart follower finder", description: "Scan big accounts for their smart followers and add the best ones as targets." },
      { title: "Learns what works", description: "Stats by tone, model and tier show which replies bring follow-backs." },
      { title: "Your data stays with you", description: "Targets, history and keys stay in your browser, with real cost tracking for your OpenAI usage." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://scorex.uniquelabs.org" },
      { kind: "PRIVACY_POLICY", url: "https://scorex.uniquelabs.org/privacy" },
    ],
    seo: {
      title: "ScoreX: Grow Your Influencer Score on X",
      description: "ScoreX is a Chrome extension that replies to the smart accounts you pick on X, in your own voice, to grow your influencer score. Invite-only early access.",
    },
    accentColor: "#a3d900",
    featured: true,
  },
  {
    slug: "xaicg",
    name: "XAICG",
    tagline: "X AI Comment/Reply Generator for Twitter — free, unlimited replies in your own voice.",
    summary:
      "A free Chrome extension that writes replies, questions, posts and threads for X (Twitter) in your own voice. Free forever, no daily limit, no sign-up and no API key — drafts are written privately on your own computer.",
    description: `XAICG is a free AI reply generator for X (Twitter). It adds an **AI Reply** button to every post, writes a comment that sounds like you, and types it into the reply box so you can read it, edit it and post it yourself. Free forever, with no daily limit, no sign-up and no API key.

### Free, unlimited and private

Most AI writing tools send your text to a server and pay for every request, so they limit you or charge you. XAICG's AI runs on your own computer instead. A draft costs nothing to make, so there are no plans, no credits, no trial and no ads. Because the writing happens on your device, the post you answer, your persona and your drafts never leave your computer.

### How it works

1. Add XAICG to Chrome.
2. Press **Set up** once. The AI model is downloaded to your computer, which takes a few minutes.
3. Open x.com. Every post now has an **AI Reply** button and a **Question** button.
4. Click one. A draft appears in X's reply box. Change anything you like and press Reply.

Nothing is ever posted for you.

### What you can do

- Reply to any post with one click; each click brings back several drafts, and "Try another" steps through them
- Ask one short, specific question about a post — generic questions like "Thoughts?" are filtered out
- Pick a tone — casual, witty, supportive, skeptical, analytical, blunt, technical or professional — or let Auto fit the post
- Copy a line for a quote post
- Write original posts in three lengths, turn one idea into a thread of three to eight posts, or rewrite a draft of your own while keeping your facts, names and links
- Write in English, Spanish, German, French or Japanese, or match the language of each post

### Sounds like you

XAICG avoids the usual signs of machine writing: no generic praise, no hype words, no hashtags or links you did not ask for, no summarizing the post back to its author. Describe your voice in your own words or start from a preset, and choose a default tone, reply length and emoji preference. It remembers your last 30 drafts on your computer so new ones do not repeat themselves.

### What your computer needs

Because the AI runs on your own computer, it needs a reasonably capable one: desktop Google Chrome on Windows 10 or 11, macOS 13 or later, Linux or a Chromebook Plus; about 22 GB of free disk space; and a graphics card with more than 4 GB of memory, or 16 GB of memory and 4 processor cores. The settings page tells you straight away whether your computer can run it. Phones and tablets are not supported.

### Good to know

XAICG reads only the post you click — never your messages, followers or password — and it cannot post, like or follow for you. To count how many people use it, it reports only that an install exists and how many drafts of each kind it wrote, never what they say. XAICG is an independent product and is not affiliated with or endorsed by X Corp.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "BETA",
    pricing: "FREE",
    website: "https://xaicg.uniquelabs.org",
    cta: { label: "Add to Chrome — free", url: "https://chromewebstore.google.com/detail/lpophlkocboadjhancbdikipnphffgil" },
    logo: { src: "/images/products/xaicg/logo-v3.png", alt: "XAICG logo", width: 128, height: 128 },
    cover: { src: "/images/products/xaicg/cover-v3.webp", alt: "XAICG: free AI replies for X, in your own voice", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/xaicg/screenshot-1-v3.webp", alt: "XAICG drafting a reply into the reply box on a sample timeline", width: 1280, height: 800, caption: "Reply on X in your own voice (sample timeline)" },
      { src: "/images/products/xaicg/screenshot-2-v3.webp", alt: "XAICG tone menu with casual, witty, supportive and more", width: 1280, height: 800, caption: "A tone for every moment (sample timeline)" },
      { src: "/images/products/xaicg/screenshot-3-v3.webp", alt: "XAICG compose window writing posts and a thread", width: 1280, height: 800, caption: "Posts and threads from a rough idea" },
      { src: "/images/products/xaicg/screenshot-4-v3.webp", alt: "XAICG voice settings: tone, reply length, language, emoji and persona", width: 1280, height: 800, caption: "Make it sound like you" },
      { src: "/images/products/xaicg/screenshot-5-v3.webp", alt: "XAICG settings showing it is ready, free and unlimited", width: 1280, height: 800, caption: "Free, unlimited, and on your computer" },
    ],
    features: [
      { title: "Free and unlimited", description: "Free forever, with every feature included. No plans, no credits, no trial, no ads and no daily limit." },
      { title: "Private by design", description: "Drafts are written on your own computer. The post, your persona and your drafts never leave it." },
      { title: "No sign-up, no API key", description: "Install it, press Set up once, and start replying." },
      { title: "One click on any post", description: "AI Reply and Question buttons sit on every post; the draft lands in X's own reply box." },
      { title: "A tone for the moment", description: "Auto fits each post, or pick casual, witty, supportive, skeptical, analytical, blunt, technical or professional." },
      { title: "Posts, threads and rewrites", description: "The toolbar popup turns a rough idea into posts or a thread, and tightens drafts you wrote." },
      { title: "Sounds like you", description: "No generic praise, hype words or invented hashtags; your voice, tone, length and emoji settings apply to everything." },
      { title: "You stay in control", description: "Nothing is ever posted for you. A copy-only mode never touches the page." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://xaicg.uniquelabs.org" },
      { kind: "PRIVACY_POLICY", url: "https://xaicg.uniquelabs.org/privacy" },
      { kind: "SUPPORT", url: "https://xaicg.uniquelabs.org/support" },
    ],
    seo: {
      title: "XAICG: Free AI Reply Generator for X (Twitter)",
      description: "XAICG is a free, unlimited AI reply generator for X (Twitter). Replies, questions, posts and threads in your voice, written privately on your own computer.",
    },
    accentColor: "#fcd535",
  },
  {
    slug: "uniquefarm",
    name: "UniqueFarm",
    tagline: "Grow on X without sounding like a bot.",
    summary:
      "Proprietary, private-use software: no external license is sold separately right now. A Chrome side-panel for X (Twitter) that reads the post, writes a reply in your voice and posts it with human timing, breaks and a review hold.",
    description: `**Proprietary and private.** UniqueFarm is proprietary software for private use. No external license is sold separately right now.

UniqueFarm is a Chrome side-panel for X (Twitter). It reads the real post — text, images, quoted tweets and linked articles — writes a reply in your voice with your own OpenAI key, and posts it with human timing, breaks and a review hold. You can stop everything in one click.

### Four tools, one voice

- **Automate.** Paste post links and press Start. It cleans and de-duplicates the list, opens each post in its own tab, likes, reads, writes and posts. One slider mixes short replies, deeper takes and genuine questions.
- **Reply Guy.** Answers everyone under your own post: likes each comment and replies as the author, skipping your own replies and anyone you already answered.
- **KOL Engage.** Give it profile links. It finds their recent original posts and likes, bookmarks, reposts or comments on them — never on their replies or threads.
- **Home Feed.** Works your For-you feed with one comment per top-level post, skipping ads, your own posts and anything already done.

Prefer to stay hands-on? Manual **REP · D · QS · RG** buttons on every post draft a reply, a deeper take, a question or an author reply. You read it, you press Post.

### Built to behave

- **Stop means stop.** Every tool halts within a second, the comment being written is cancelled before it posts, and a stopped run never resumes by itself.
- **Review hold.** The finished comment sits in the box for a few seconds so you can read or edit it first.
- **Never the wrong box.** Replies go through the post's own reply composer; if it does not open, the item is skipped.
- **Human timing.** Random read time, randomized delays and breaks after every batch.
- **Dedup memory.** It remembers every post it commented on, so nothing is answered twice.
- **Cost guard.** Hard caps on daily and monthly OpenAI spend.

### Good to know

UniqueFarm is proprietary software for private use. The extension is live on the Chrome Web Store, but it only unlocks with an access key, and license sales have not started yet — no external license is sold separately right now. It works with your own OpenAI API key, and replies are billed to that OpenAI account. Your key, settings, reply history and dedup memory stay on your device; the extension never asks for your X password. It needs Chrome 116 or newer.`,
    category: "browser-extensions",
    platforms: ["CHROME_EXTENSION"],
    stage: "PRIVATE",
    website: "https://farm.uniquelabs.org",
    cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/plfapamdnnjlgjahajdgeaiknjljijln" },
    logo: { src: "/images/products/uniquefarm/logo.png", alt: "UniqueFarm logo", width: 128, height: 128 },
    cover: { src: "/images/products/uniquefarm/cover.webp", alt: "UniqueFarm: grow on X without sounding like a bot", width: 1400, height: 560 },
    screenshots: [
      { src: "/images/products/uniquefarm/screenshot-1.webp", alt: "UniqueFarm's tools: Automate, Reply Guy, KOL Engage, Home Feed and more", width: 1280, height: 800, caption: "Four tools, one voice" },
      { src: "/images/products/uniquefarm/screenshot-2.webp", alt: "UniqueFarm safety controls: stop, pause, review hold, breaks and cost guard", width: 1280, height: 800, caption: "Built to behave: stop, pause, review hold and cost guard" },
      { src: "/images/products/uniquefarm/screenshot-3.webp", alt: "Table of OpenAI models supported by UniqueFarm", width: 1280, height: 800, caption: "Bring your own OpenAI key and pick a model" },
      { src: "/images/products/uniquefarm/screenshot-4.webp", alt: "UniqueFarm setup in four steps: install, unlock, add your OpenAI key, run", width: 1280, height: 800, caption: "Two minutes to the first comment" },
    ],
    features: [
      { title: "Automate", description: "Paste links, press Start. Mix short replies, deeper takes and genuine questions with one slider." },
      { title: "Reply Guy", description: "Answer everyone under your own post, skipping anyone you already answered." },
      { title: "KOL Engage", description: "Like, bookmark, repost or comment on the recent original posts of the creators you choose." },
      { title: "Home Feed", description: "Work your For-you feed, one comment per top-level post, skipping ads and your own posts." },
      { title: "Human timing", description: "Random read time, randomized delays, breaks after every batch and a review hold before posting." },
      { title: "Dedup memory", description: "Remembers every post it commented on and survives reinstalls. Export, import or sync it." },
      { title: "Stats and cost guard", description: "Live progress, per-tool stats, token usage and daily or monthly spend caps on your OpenAI key." },
      { title: "A real Stop button", description: "One click halts every tool within a second, and nothing more gets posted." },
    ],
    links: [
      { kind: "WEBSITE", url: "https://farm.uniquelabs.org" },
      { kind: "PRIVACY_POLICY", url: "https://farm.uniquelabs.org/privacy" },
    ],
    seo: {
      title: "UniqueFarm: X Engagement Side Panel (Private)",
      description: "UniqueFarm is a private Chrome side panel for X that drafts replies in your voice with human timing and a review hold. No external licences are sold yet.",
    },
    accentColor: "#ff2e88",
  },
];
