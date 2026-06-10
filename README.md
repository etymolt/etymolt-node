# @etymolt/sdk

> Official TypeScript / Node SDK for [Etymolt](https://etymolt.com) — the fact-check layer for LLM-generated names.

[![npm version](https://img.shields.io/npm/v/@etymolt/sdk.svg)](https://www.npmjs.com/package/@etymolt/sdk)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## Install

```bash
npm install @etymolt/sdk
```

## Quick start

```typescript
import { Etymolt } from "@etymolt/sdk";

const etymolt = new Etymolt();
const verdict = await etymolt.verify("Stratagem");

// verdict.verdict   → "PROCEED" | "PROCEED_STRATEGIC" | "ABANDON"
// verdict.score     → number | null (null when partial)
// verdict.status    → "complete" | "partial"
// verdict.reason    → string (e.g. "hard_blocker", "coexistence_required", "no_workaround")
// verdict.axes      → { trademark, domain, cultural, sound_symbolism, pronunciation }
// verdict.disclaimer → Render this verbatim per EVP/1 §5.

console.log(verdict.verdict, verdict.score);
console.log(verdict.disclaimer);
```

The free tier requires no API key. Outputs vary by name — names mutate over time as the underlying records of record change.

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
npx etymolt-mock                              # → http://localhost:4242
ETYMOLT_BASE_URL=http://localhost:4242 node app.js
```

The SDK honors `ETYMOLT_BASE_URL` and the constructor's `baseUrl` option. See [etymolt/etymolt-mock](https://github.com/etymolt/etymolt-mock).

## Documentation

Full docs at [etymolt.com/docs](https://etymolt.com/docs). Protocol spec at [github.com/etymolt/evp-spec](https://github.com/etymolt/evp-spec).

---

*Naming, attested.*

## License

[Apache-2.0](./LICENSE)
