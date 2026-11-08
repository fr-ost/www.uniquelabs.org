# Market Intelligence

`/intelligence` is a live crypto market view: prices, market caps, volume,
supply, global metrics, sentiment, airdrops and token unlocks. Every coin in the
tracked list also has its own page (`/intelligence/<coinmarketcap-slug>`).

## Data sources

| Section | Source | CoinMarketCap endpoint | Plan |
| --- | --- | --- | --- |
| Prices, changes (1h → 90d), market cap, FDV, volume, supply | CoinMarketCap | `GET /v3/cryptocurrency/listings/latest` (top 200, 1 credit) | Keyless / any |
| Total market cap, volume, BTC/ETH dominance, DeFi, stablecoins, derivatives | CoinMarketCap | `GET /v1/global-metrics/quotes/latest` | Keyless / any |
| Fear & Greed (+ 90-day history) | CoinMarketCap | `GET /v3/fear-and-greed/latest`, `/historical` | Keyless / any |
| Altcoin Season index | CoinMarketCap | `GET /v1/altcoin-season-index/latest` | Keyless / any |
| CMC100 index and weights | CoinMarketCap | `GET /v3/index/cmc100-latest` | Keyless / any |
| Coin description and links (coin pages) | CoinMarketCap | `GET /v2/cryptocurrency/info` (cached 24 h) | Keyless / any |
| Airdrops (live feed) | CoinMarketCap | `GET /v1/cryptocurrency/airdrops` | **Paid key** (Hobbyist+) |
| Airdrops (curated) | You, in the admin | — | — |
| Token unlocks | You, in the admin | — (CoinMarketCap's API has no unlock calendar) | — |

Top movers are computed from the listings (assets with at least $1M daily
volume, stablecoins excluded), so they cost nothing extra.

## API key

Without `CMC_API_KEY` the site uses CoinMarketCap's **keyless public API**
(`https://pro-api.coinmarketcap.com/public-api`). It needs no signup, but its
rate limits are shared by everyone on the same IP address, so on busy hosts data
can pause (the site then keeps showing the last good data, marked “Delayed”).

For production, create a free key at <https://coinmarketcap.com/api/> and set
`CMC_API_KEY` in the hosting environment. The key is only ever used by the
server: browsers call this site's `/api/market/snapshot`, never CoinMarketCap.
A paid plan (Hobbyist or above) additionally enables the live airdrop feed.
Check CoinMarketCap's terms for your plan's licensing and attribution rules —
the pages credit “Market data provided by CoinMarketCap”.

## Refresh, caching and credits

- Each dataset is cached **in the server process** and refreshed only when a
  visitor needs it, so a quiet site uses almost no credits.
- Admin → Intelligence → *Refresh interval* (default 5 minutes) sets how long
  prices stay cached. Global metrics refresh at most every 5 minutes, sentiment
  indices every 15 minutes, history every 6 hours, airdrops hourly.
- Stale-while-revalidate: visitors get cached data instantly while one
  background request refreshes it. Concurrent visitors never trigger duplicate
  requests.
- On errors the last good copy keeps being served (up to 2 hours for prices,
  24 hours for indices). Rate limits back off for 2 minutes; “not in your
  plan” errors back off for an hour.
- The admin page shows each dataset's status, the API plan usage (with a key)
  and a worst-case monthly credit estimate. *Refresh data* clears the cache.
- Pages poll the cached snapshot every 30–120 seconds while the tab is visible;
  changed prices flash green or red.
- With several app instances, each keeps its own cache (multiply credits by
  the instance count).

## Curating airdrops and token unlocks

Admin → Intelligence → **Airdrops** / **Token unlocks**.

- Every entry starts as a draft. Publishing requires ticking **Verified by
  owner**; the database itself refuses to publish an unverified entry.
- Airdrops need the project's **official link** (visitors are sent there).
  Token unlocks need a **public source** (vesting schedule, tokenomics docs or
  an official post).
- Add the **CoinMarketCap slug** (from `coinmarketcap.com/currencies/<slug>/`)
  to show the coin's logo and value an unlock at the live price.
- Unlock times are entered and stored in **UTC**.
- Airdrop phase (live / upcoming / ended) is derived from the dates.

## Privacy and safety

- Visitors' browsers never contact CoinMarketCap: data and coin logos are
  served from this site (`/api/market/snapshot`, `/api/market/logo/<id>`).
- The logo proxy only fetches numeric ids from CoinMarketCap's fixed image
  host, checks the PNG signature and size, caches results and limits upstream
  requests.
- All third-party text and links are validated (http/https only) and rendered
  as plain text; external links use `rel="noopener noreferrer nofollow"`.
- Coin pages exist only for coins in the tracked list — arbitrary URLs never
  trigger API calls. If the provider is down, the page returns an error (not a
  404, which would tell search engines the page is gone).
- Every page carries a “not financial advice” notice; the default Terms of Use
  include a market-information section.

## Local development and tests

```bash
# Offline mock serving recorded CoinMarketCap responses
node tests/support/cmc-mock-server.mjs tests/fixtures/cmc 4010
CMC_API_BASE_URL=http://127.0.0.1:4010 npm run dev
```

The end-to-end suite starts the mock automatically. Unit tests cover the
normalisers (against recorded live responses), formatting and the cache.
