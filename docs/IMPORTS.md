# Imports: Claude history & X archive

Two importers help populate the site from data you already own. Both follow
the same pipeline:

**Import → Parse → Normalise → Deduplicate → Extract candidates → Review →
Approve → Publish**

Nothing is ever published automatically. Imports create *candidates*; you
decide.

## Privacy guarantees

- Archives are processed **on your own server**. No conversation, post or
  excerpt is sent to any third-party service or AI API.
- Uploaded files are stored in a private temporary directory and **deleted as
  soon as processing finishes** (success, failure or cancellation). Only file
  names and SHA-256 checksums are kept, for duplicate detection.
- Only short excerpts needed as evidence are stored, in private tables that
  are never rendered publicly. Public pages are built from separate DTOs that
  cannot include them.
- X archive JavaScript files are parsed as data — never executed. Direct
  messages, deleted tweets and account details (except your username, used to
  build post links) are never read.

## Claude conversation export

**Get the export:** Claude → *Settings → Privacy → Export data*. Download the
archive from the email link (it expires quickly). Large accounts may receive
several batch archives — upload all of them in one import.

**Upload:** Admin → Claude history import. Accepts the ZIP(s) as downloaded,
or the extracted `conversations.json`, `projects.json` and `memories.json`.

**Structure handled.** `conversations.json` is a top-level array of
conversations (`uuid`, `name`, `created_at`, `chat_messages[]` with `sender`
`human`/`assistant`, `text`, `content[]` blocks and optional `attachments[]`
with extracted text). Exports can be split into folders such as
`data-…-batch-0000/`. Projects (`name`, `description`, `docs[]`) and memory
files are read when present. Field names are read defensively, unknown
structures are skipped and reported as warnings, and Claude's “This block is
not supported on your current device yet” placeholder is removed. Uploaded
images/PDFs are often not included in exports, so screenshots may need to be
added manually.

> The parser was written against the documented export structure and tested
> with fixtures modelled on it. If a future export changes shape, the import
> report will show warnings; the parser lives in `src/lib/importers/claude/`.

**How products are detected**

1. *Is this conversation about a product?* Development vocabulary, code
   blocks, store links, manifests and owner statements.
2. *What is it called?* Strongest sources first: a Chrome extension
   `manifest.json` (`"name"`), Chrome Web Store / Firefox / Edge / App Store /
   Play listing URLs, a Claude Project name, the conversation title, phrases
   such as “an extension called …”. Generic names (“My Extension”, “Popup”,
   `__MSG_appName__`) are ignored.
3. *Grouping.* Conversations about the same product are merged — by Chrome
   Web Store id when available, otherwise by normalised name.
4. *Stage classification* (from the owner's own words only):

| Classification | Requires |
| --- | --- |
| **Published product** | A store listing URL you shared, an explicit release statement (“we launched it last week”, “it's now live on the Chrome Web Store”), a store approval, or real usage numbers / reviews |
| Beta release | Beta / early access / TestFlight mentioned (including “we launched a beta”) |
| Completed project | Described as finished, or submitted for store review (not yet live) |
| Development in progress | Hands-on development and debugging |
| Product planning | Roadmaps, feature lists, architecture |
| Product idea | Discussed as an idea |
| Cancelled project | You mentioned stopping it |
| Needs verification | Launch/publish words appear without a confirmed release |

Questions (“how do I publish…?”), plans (“I want to launch next month”),
conditionals (“once it's live…”), negations (“it's not live yet”) and the
assistant's words never count as publication. Words like *build*, *launch*,
*create* or *develop* alone never establish that something was published. A
store rejection after the last positive signal keeps a product unpublished.

Each candidate keeps: conversation id, title, a short excerpt, timestamp,
detected name(s), URLs, platforms, confidence and verification status, plus a
link to the original conversation (`claude.ai/chat/<id>`, visible only to you).

## X / Twitter archive

**Get the archive:** X → *Settings → Your account → Download an archive of
your data*.

**Upload:** Admin → Import X Archive. Accepts the archive ZIP (or several part
ZIPs), or individual files: `data/tweets.js` (older archives: `tweet.js`),
`tweets-part1.js`, `tweets-part2.js`, … , `note-tweet.js` (full text of long
posts), `account.js` (for correct post links), and JSON arrays of tweets.
The `window.YTD.tweets.part0 = [...]` wrapper is stripped and parsed as JSON.

**How collaborations are detected.** Each post is scored on explicit
statements: “in partnership with”, “partnered with”, “collaboration with”,
“teamed up with”, “co-created”, “sponsored by”, “integration with”, “brand
ambassador”, “campaign with”, “contributed to”, partnership hashtags (#collab,
#partnership, #sponsored, #ad, …) and partner @mentions.

Never treated as collaborations: **retweets** (excluded), **replies** to
other accounts (heavily penalised), **thank-you / congratulations posts**,
**questions**, **requests** (“anyone want to collab?”, “DM me for partnerships”)
and **plain mentions**. Posts about the same partner within 90 days are
grouped into one candidate. Each candidate shows partner(s), date, post text,
links, hashtags, category (brand partnership, product integration,
co-creation, sponsorship, campaign, community, contribution), confidence and
the original post URLs. On approval, the original post becomes the public
source link of the collaboration.

## Re-imports, duplicates and history

- Re-importing the same archive is safe and creates nothing new: evidence is
  unique per source (conversation or post id).
- A newer archive adds only new evidence; existing open candidates are
  refreshed.
- Rejected, archived, approved and merged candidates are never brought back;
  new evidence is attached to them and reported in the import results.
- Uploading files identical to a previous import is detected by checksum.
- Admin → Import history lists every job with its files, results, warnings and
  errors. Interrupted jobs (e.g. a server restart) are marked failed — simply
  upload again.

## Limits & safety

| Limit | Default |
| --- | --- |
| Upload size per file | `IMPORT_MAX_UPLOAD_MB` (2048 MB) |
| Files per import | 25 |
| Archive entries | 250,000 |
| Single data file inside an archive | 4 GB |
| Compression ratio (files > 64 MB) | 250 : 1 (decompression-bomb guard) |
| Single conversation / tweet record | 96 MB / 4 MB (larger items are skipped and reported) |

Archive entries are validated (no absolute paths, `..`, NUL bytes or drive
letters), encrypted entries are skipped, and nothing is ever extracted to disk.
Large files are streamed with constant memory.

## Adding another importer

Implement the `Importer` interface in `src/lib/importers/core/types.ts`
(`run(context) → { candidates, stats }`) using the shared archive, streaming
JSON and text utilities, and register it in `src/lib/importers/registry.ts`.
Persistence, idempotency, job tracking, the upload API and the review UI are
shared.
