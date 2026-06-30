# @etymolt/sdk

> Official TypeScript / Node SDK for [Etymolt](https://etymolt.com) — the fact-check layer for LLM-generated names.

[![npm version](https://img.shields.io/npm/v/@etymolt/sdk.svg)](https://www.npmjs.com/package/@etymolt/sdk)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![CI](https://github.com/etymolt/etymolt-node/actions/workflows/ci.yml/badge.svg)](https://github.com/etymolt/etymolt-node/actions/workflows/ci.yml)

## Install

```bash
npm install @etymolt/sdk
```

## Quick start

```typescript
import { Etymolt } from "@etymolt/sdk";

const etymolt = new Etymolt();
const verdict = await etymolt.verify("Stratagem");
console.log(verdict.verdict, verdict.signature_key_id);
// -> PROCEED_STRATEGIC etymolt-1779085662
```

`Inkstack` and `Stratagem` are deterministic example names — they return the same verdict and signature_key_id on every call, so the snippet above is reproducible.

The free tier requires no API key. Outputs vary by name; names mutate over time as the underlying records of record change.

## What you can verify

Every call returns a signed [EVP/1 envelope](https://github.com/etymolt/evp-spec). The fields the SDK surfaces (typed in `Verdict`):

| Field | What it is |
|---|---|
| `verdict` | One of `PROCEED`, `PROCEED_STRATEGIC`, `ABANDON` — the 3-value canonical enum. |
| `status` | `complete` or `partial` (engine-uncertain; verdict is best estimate). |
| `reason` | One of `clean`, `famous_mark`, `high_collision`, `no_distinctiveness`, `descriptive`, `insufficient_corpus`. |
| `score` | 0-100 composite. Not a substitute for the verdict. |
| `axes` | Per-axis status: `trademark`, `domain`, `cultural`, `sound_symbolism`, `pronunciation`. |
| `issued_at` / `valid_until` | RFC 3339 timestamps. Drop the result after `valid_until`. |
| `signature` | Ed25519 over the canonical payload. |
| `signature_key_id` | Look up in `https://www.etymolt.com/.well-known/verdict-keys.json` to verify. |
| `signature_payload_digest` | Hex sha256 of canonical payload — confirm before invoking Ed25519. |
| `disclaimer` | Render verbatim per [EVP/1 §5](https://github.com/etymolt/evp-spec). |

**Browser-side verification:** paste any verdict (or its `signature` + canonical payload) into [`etymolt.com/verify`](https://www.etymolt.com/verify) to see the signature green-check live, no SDK required.

> Note: the `goods` block (Nice classes + intended markets) lands in EVP/1.1 (Sprint 1, §1.1 class-scoping). The SDK already accepts `niceClasses: [9, 42]` in `verify()` — it's wired through; the server starts emitting the signed goods block in EVP/1.1.

## Temporal validity

```typescript
import { Etymolt } from "@etymolt/sdk";

if (Etymolt.isStale(verdict)) {
  // verdict is past its valid_until — re-verify before relying on it
  verdict = await etymolt.verify(verdict.name);
}
```

## Develop offline

```bash
npx etymolt-mock                              # -> http://localhost:4242
ETYMOLT_BASE_URL=http://localhost:4242 node app.js
```

The SDK honors `ETYMOLT_BASE_URL` and the constructor's `baseUrl` option. See [etymolt/etymolt-mock](https://github.com/etymolt/etymolt-mock).

## Pricing

Free tier: anon calls rate-limited per IP. Authenticated standard: **$0.25 per verdict**. Volume tiers: $0.15 (1K-5K/mo), $0.10 (5K-20K/mo), $0.05 (20K+/mo). See [`etymolt.com/pricing`](https://www.etymolt.com/pricing).

## Documentation

Full docs at [etymolt.com/docs](https://etymolt.com/docs). Protocol spec at [github.com/etymolt/evp-spec](https://github.com/etymolt/evp-spec).

---

*Naming, attested.*

## License

[Apache-2.0](./LICENSE)
