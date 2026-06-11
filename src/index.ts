/**
 * @etymolt/sdk — official TypeScript SDK for Etymolt.
 *
 * The fact-check layer for LLM-generated names. Issues signed
 * EVP/1 verdicts across five canonical axes (trademark, domain,
 * cultural, sound_symbolism, pronunciation). The 'sound_symbolism'
 * axis is rendered as 'Sound' on user-facing surfaces.
 *
 * Quick start:
 *
 *   import { Etymolt } from "@etymolt/sdk";
 *
 *   const etymolt = new Etymolt();
 *   const verdict = await etymolt.verify("Stratagem");
 *   console.log(verdict.verdict, verdict.score);
 *
 * See https://github.com/etymolt/evp-spec for the protocol.
 */

export interface VerifyOptions {
  /**
   * The candidate name to verify.
   */
  name: string;

  /**
   * NICE classification numbers for the goods/services your name will
   * be filed against. Defaults to the SaaS/software classes (9, 42)
   * if omitted. See https://www.wipo.int/classifications/nice/en/
   */
  niceClasses?: number[];
}

export interface AxisStatus {
  status: "CLEAR" | "CAUTION" | "BLOCKED" | "INSUFFICIENT_SIGNAL" | "UNKNOWN";
  score: number | null;
  confidence?: number | null;
}

export interface VerdictAxes {
  trademark: AxisStatus;
  domain: AxisStatus;
  cultural: AxisStatus;
  sound_symbolism: AxisStatus;
  pronunciation: AxisStatus;
}

export interface Verdict {
  evp_version: string;
  name: string;
  verdict: "PROCEED" | "PROCEED_STRATEGIC" | "ABANDON";
  status: "complete" | "partial";
  reason?: string;
  score: number | null;
  axes: VerdictAxes;
  verdict_id: string;
  issued_at: string;
  valid_until?: string;
  axis_freshness?: Record<string, string | null>;
  disclaimer: string;
  signature: string;
  signature_key_id: string;
  signature_payload_digest: string;
  permalink?: string;
  [key: string]: unknown;
}

export interface EtymoltOptions {
  /**
   * Your Etymolt API key. Not required for the free tier (first 5
   * verdicts per IP).
   */
  apiKey?: string;

  /**
   * Override the default API base URL. Useful for testing against a
   * mock server (see https://github.com/etymolt/etymolt-mock).
   */
  baseUrl?: string;

  /**
   * Override the default fetch implementation. Useful for retry/
   * instrumentation wrappers.
   */
  fetch?: typeof fetch;
}

export class EtymoltError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = "EtymoltError";
  }
}

export class Etymolt {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: EtymoltOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://api.etymolt.com";
    this.apiKey = options.apiKey ?? process.env.ETYMOLT_API_KEY;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /**
   * Verify a candidate name. Returns a signed EVP/1 verdict.
   *
   * Free tier requires no API key.
   *
   * @example
   *   const verdict = await etymolt.verify("Stratagem");
   *   console.log(verdict.verdict);  // "PROCEED_STRATEGIC"
   *   console.log(verdict.score);    // 60
   *
   * @example
   *   const verdict = await etymolt.verify({
   *     name: "Stratagem",
   *     niceClasses: [9, 42],
   *   });
   */
  async verify(input: string | VerifyOptions): Promise<Verdict> {
    const opts: VerifyOptions =
      typeof input === "string" ? { name: input } : input;

    const body: Record<string, unknown> = { name: opts.name };
    if (opts.niceClasses?.length) body.nice_classes = opts.niceClasses;

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (this.apiKey) headers["x-etymolt-key"] = this.apiKey;

    const res = await this.fetchImpl(`${this.baseUrl}/v1/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let payload: unknown = null;
      try { payload = await res.json(); } catch { /* ignore */ }
      throw new EtymoltError(
        `Etymolt API returned ${res.status}: ${res.statusText}`,
        res.status,
        payload,
      );
    }

    return (await res.json()) as Verdict;
  }

  /**
   * Check whether a verdict is past its `valid_until` boundary.
   * Returns `true` if the verdict should be re-issued.
   */
  static isStale(verdict: Verdict, now: Date = new Date()): boolean {
    if (!verdict.valid_until) {
      // Default policy: stale after 24h if no explicit valid_until.
      const issued = new Date(verdict.issued_at).getTime();
      return now.getTime() - issued > 24 * 60 * 60 * 1000;
    }
    return now.getTime() > new Date(verdict.valid_until).getTime();
  }

  /**
   * Get the age of a verdict in milliseconds.
   */
  static age(verdict: Verdict, now: Date = new Date()): number {
    return now.getTime() - new Date(verdict.issued_at).getTime();
  }
}

export default Etymolt;
