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
 *   stage: "AVAILABLE",                      // AVAILABLE · BETA · COMING_SOON · DISCONTINUED
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
    stage: "COMING_SOON",
    pricing: "FREE",
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
    stage: "COMING_SOON",
    pricing: "FREE",
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
    stage: "COMING_SOON",
    pricing: "FREE",
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
    accentColor: "#6e6afc",
    featured: true,
  },
];
