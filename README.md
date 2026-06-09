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

console.log(verdict.verdict);     // "ITERATE"
console.log(verdict.score);       // 60
console.log(verdict.disclaimer);  // Render this verbatim per EVP/1 §5.
```

The free tier requires no API key.

## Documentation

Full docs at [etymolt.com/docs](https://etymolt.com/docs). Protocol spec at [github.com/etymolt/evp-spec](https://github.com/etymolt/evp-spec).

## License

[Apache-2.0](./LICENSE)
