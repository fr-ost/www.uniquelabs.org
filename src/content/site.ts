import type { SiteInput } from "./schema";

/**
 * Search engine settings and legal pages.
 * The legal texts describe what this website actually does (a static site:
 * no forms, no cookies, no analytics). Review them — ideally with qualified
 * counsel — and update the dates when you change them.
 */
export const site: SiteInput = {
  seo: {
    title: "Unique Labs — KOC, consultancy, digital marketing & blockchain development",
    titleTemplate: "%s — Unique Labs",
    description:
      "Unique Labs offers KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow. We also build our own software and AI products.",
    keywords: ["Unique Labs", "KOC marketing", "consultancy", "digital marketing", "Web3 marketing", "blockchain development", "Web3 development", "AI", "Chrome extensions"],
    // twitterHandle: "@uniquelabs",
    // googleSiteVerification: "…",
    // bingSiteVerification: "…",
  },

  legal: {
    privacyUpdated: "2026-11-08",
    privacyPolicy: `This Privacy Policy explains how {{company}} ("we", "us") handles personal information when you visit {{site}} (the "Website").

Individual products may process data differently. Where a product has its own privacy policy, it is linked from that product's page, and that policy applies to the product.

## Information we collect

**When you contact us.** If you email us, we receive your email address and whatever you choose to include in your message. We use it only to read and respond to you and to handle any follow-up.

**Technical information.** Like most websites, our hosting provider processes standard technical data — such as IP address, browser type and the pages requested — to deliver the Website and keep it secure.

## Cookies

The Website does not set cookies, does not use advertising or analytics tools, and does not embed third-party tracking scripts. Fonts and images are served from the Website itself.

## How we use information

We use personal information to respond to inquiries, to operate and secure the Website, and to comply with legal obligations. We do not sell personal information.

## Sharing

We share information only with service providers that host and operate the Website on our behalf, when required by law, or to protect the rights, safety and security of our users and of {{company}}.

## Retention

We keep correspondence for as long as needed to respond and handle follow-up. You can ask us to delete it at any time.

## Your choices

You can ask us to access, correct or delete personal information you have sent us. To make a request, contact us at {{contact}}.

## Third-party services

Our products may be distributed through third-party platforms such as browser extension stores. Those platforms have their own privacy practices, which we do not control.

## Changes to this policy

We may update this policy from time to time. The date at the top of this page shows when it last changed.

## Contact

Questions about this policy can be sent to {{contact}}.`,

    termsUpdated: "2026-11-09",
    termsOfUse: `These Terms of Use govern your use of {{site}} (the "Website"), operated by {{company}}. By using the Website, you agree to these terms.

## Using the Website

You may use the Website for lawful purposes only. Please don't attempt to disrupt it, gain unauthorized access to any part of it, or use it to send spam or harmful content.

## Our services

Information about our services on the Website is general and is not an offer. Any engagement for KOC, consultancy, digital marketing, blockchain development or other services is governed by a separate agreement between you and Unique Labs.

## Our products

Information about products on the Website is provided for general information. Products may be offered through third-party platforms — such as browser extension stores — and may come with their own terms and privacy policies, which apply to your use of those products.

## Intellectual property

The Unique Labs name, logo, and the content and design of the Website are owned by {{company}} unless stated otherwise. You may not copy or reuse them in a way that suggests endorsement or affiliation without our permission. Third-party names and marks belong to their respective owners.

## Messages you send us

When you write to us, you confirm that the information is accurate and that you have the right to share it. Please don't send confidential information unless we have agreed to receive it.

## External links

The Website may link to external websites. We are not responsible for their content or practices.

## Disclaimer

The Website is provided "as is" and "as available". To the fullest extent permitted by law, we make no warranties that it will be uninterrupted, error-free or suitable for any particular purpose.

## Limitation of liability

To the fullest extent permitted by law, {{company}} will not be liable for any indirect, incidental or consequential damages arising from your use of the Website.

## Changes

We may update these terms from time to time. The date at the top of this page shows when they last changed. Continued use of the Website after changes means you accept the updated terms.`,
  },
};
