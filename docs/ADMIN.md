# Admin guide

The admin dashboard lives at **`/admin`**. There is no public registration:
accounts are created by an owner, from the server CLI, or once via the setup
token.

## 1. Create the first owner account

Pick one method (both enforce a strong password: 12+ characters, not a common
password, not containing your name or email):

**A. Setup token (no shell access needed)**

1. Set `ADMIN_SETUP_TOKEN` to a random value of 24+ characters and deploy.
2. Visit `/admin/setup`, enter the token, your name, email and password.
3. Remove `ADMIN_SETUP_TOKEN` from the environment. The setup page stops
   working as soon as any admin exists.

**B. Command line**

```bash
npm run admin:create
# or: npm run admin:create -- --email you@example.com --name "Your Name"
```

The first account is always an **Owner**. Later accounts default to
**Editor** (content only); owners can also create accounts in
Admin → Admin users.

Forgot a password? On the server: `npm run admin:reset-password -- --email you@example.com`
(this also signs out every session and clears any lockout).

## 2. Security behaviour

- Sessions are HttpOnly, Secure, SameSite=Strict cookies verified against the
  database on every request; they expire after 12 hours or 2 hours of
  inactivity (configurable).
- Repeated failed sign-ins are rate-limited per IP and per account; accounts
  lock progressively (15 minutes, doubling up to 24 hours).
- Changing your password (Admin → Account & security) signs out all other
  sessions. You can also sign out individual sessions there.
- Every sign-in, edit, publication change, import and review decision is
  recorded in Admin → Audit logs.

## 3. Publishing rules (important)

- Every record starts as a **Draft**. Only **Published** records appear on
  the website.
- Products, collaborations and milestones additionally require **“Verified
  by owner”**. The database itself refuses to publish them otherwise — so an
  imported record can never go live by accident.
- **Preview** any draft with the Preview button: it opens the public page with
  a “Preview mode” bar, visible only to you while signed in.
- **Archive** hides a record without deleting it. **Delete** asks for
  confirmation first.
- Order lists with the ↑/↓ buttons; the public site follows that order.

## 4. Day-to-day tasks

**Company information** — identity, homepage hero, introduction, About page
chapters (Markdown), What We Do intro and the closing statement. The founding
date only appears if you mark it verified. Philosophy principles have their own
page (Company information → Philosophy principles).

**Add a product** — Products → New product: name, short description, category,
platforms, status (Live / Beta / Coming soon / Archived), logo, hero image,
screenshots, long description, features, audience, links, website and
install link, release date (shown only when verified). Tick “Verified by
owner”, set status to Published, save.

**Add a collaboration** — Collaborations → New: title, summary, category,
date, partners (manage logos under Partners), the original source link
(e.g. the announcement post), cover image, description. Verify, publish.

**Add a team member** — Team members → Add member: photo (EXIF/GPS metadata is
removed automatically), name, position, bios, responsibilities, expertise,
social links, verified join date, group, leadership flag, profile page on/off,
visibility. Only add real people with their consent.

**Add a milestone** — Company timeline → Add milestone: date (with day / month
/ year precision), title, description, image, related product or
collaboration, external source. Verify, publish.

**What We Do** — eight focus areas from your brief are created as drafts.
Review and edit them, then publish individually or with “Publish all drafts”.

**Contact information** — emails for general, business, partnership and press
inquiries; country; business address (hidden unless “Show the business
address” is ticked — no map is ever generated); social profiles; contact-form
switch. Messages arrive in Admin → Messages (suspected spam is filed
separately, never silently discarded).

**Media library** — upload images (JPEG, PNG, WebP, AVIF, GIF, SVG). Raster
images are re-encoded to WebP and stripped of metadata; SVGs with scripts or
external references are rejected. Edit alt text here; deleting warns you if an
image is in use.

**SEO & legal** — default title/template/description, keywords, X handle,
default share image (branded images are generated automatically when empty),
search-engine indexing switch (useful before launch), Search Console / Bing
verification codes, and the privacy policy and terms (Markdown with
`{{company}}`, `{{site}}`, `{{contact}}` tokens). The legal templates describe
what this site actually does; have them reviewed before launch.

## 5. Imports and review

- **Claude history import** finds products you've actually launched in your
  Claude export; **Import X Archive** finds collaborations in your X archive.
- Imports never publish anything. They create **candidates** in the review
  queues (Product candidates / Collaboration candidates), each with a
  classification, a confidence score, the reasons behind it and private source
  evidence.
- **Approve** creates a draft (tick the verification box if you've confirmed
  it) or links the evidence to an existing record. **Reject** (with an optional
  private note) keeps it rejected forever — re-imports never bring it back.
  **Archive** parks it. **Merge** combines duplicates.
- Use “Preview only (dry run)” to see what an import would find without saving.

Details: [IMPORTS.md](IMPORTS.md).

## 6. Sample content (development only)

`npm run db:seed:demo` creates records labelled “Sample” for local design work.
They never appear on a production deployment and the dashboard warns while any
exist. Remove them with `npm run db:seed:demo -- --clear`.
