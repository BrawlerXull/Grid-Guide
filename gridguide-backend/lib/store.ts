import { Redis } from "@upstash/redis";

/**
 * Storage for GridGuide demo data.
 * Production uses Upstash Redis (provisioned through the Vercel Marketplace).
 * When the Upstash env vars are absent (local dev before `vercel env pull`), an
 * in-process map is used so the API can still be exercised locally.
 * Environment variables are documented in .env.example.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

interface KV {
  get<T = Json>(key: string): Promise<T | null>;
  set(key: string, value: Json, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(hash: string, field: string, by?: number): Promise<void>;
  hgetall(hash: string): Promise<Record<string, number>>;
  pushEvent(value: Json, max: number): Promise<void>;
  events(limit: number): Promise<Json[]>;
  keys(pattern: string): Promise<string[]>;
  /** Increment a counter that expires after `windowSeconds`; returns the new count. */
  hit(key: string, windowSeconds: number): Promise<number>;
}

let _kv: KV | null = null;

export function kv(): KV {
  if (_kv) return _kv;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  _kv = url && token ? redisKV(new Redis({ url, token })) : memoryKV();
  return _kv;
}

const EVENTS = "gg:events";

/**
 * Preview deployments and local runs use the same Upstash database as production, so their keys get a
 * prefix ("preview:", "development:" or "local:"). Production keys have no prefix. Test traffic therefore
 * never shows up on the live dispatcher console, and each environment's /api/reset clears only its own data.
 */
export const NAMESPACE = process.env.VERCEL_ENV === "production" ? "" : `${process.env.VERCEL_ENV || "local"}:`;

function redisKV(r: Redis): KV {
  const k = (key: string) => NAMESPACE + key;
  return {
    async get(key) {
      return (await r.get(k(key))) as never;
    },
    async set(key, value, ttl) {
      if (ttl) await r.set(k(key), value, { ex: ttl });
      else await r.set(k(key), value);
    },
    async del(key) {
      await r.del(k(key));
    },
    async incr(hash, field, by = 1) {
      await r.hincrby(k(hash), field, by);
    },
    async hgetall(hash) {
      const v = (await r.hgetall<Record<string, number>>(k(hash))) || {};
      return Object.fromEntries(Object.entries(v).map(([f, n]) => [f, Number(n)]));
    },
    async pushEvent(value, max) {
      await r.lpush(k(EVENTS), JSON.stringify(value));
      await r.ltrim(k(EVENTS), 0, max - 1);
    },
    async events(limit) {
      const raw = await r.lrange(k(EVENTS), 0, limit - 1);
      return raw.map((x) => (typeof x === "string" ? JSON.parse(x) : x)) as Json[];
    },
    async keys(pattern) {
      // Returned without the prefix, so they can be passed straight back to get/del.
      return (await r.keys(k(pattern))).map((x) => x.slice(NAMESPACE.length));
    },
    async hit(key, windowSeconds) {
      const n = await r.incr(k(key));
      if (n === 1) await r.expire(k(key), windowSeconds);
      return n;
    },
  };
}

function memoryKV(): KV {
  const m = new Map<string, Json>();
  const h = new Map<string, Record<string, number>>();
  const ev: Json[] = [];
  return {
    async get(key) {
      return (m.get(key) as never) ?? null;
    },
    async set(key, value) {
      m.set(key, value);
    },
    async del(key) {
      m.delete(key);
      h.delete(key);
      if (key === EVENTS) ev.length = 0;
    },
    async incr(hash, field, by = 1) {
      const o = h.get(hash) || {};
      o[field] = (o[field] || 0) + by;
      h.set(hash, o);
    },
    async hgetall(hash) {
      return { ...(h.get(hash) || {}) };
    },
    async pushEvent(value, max) {
      ev.unshift(value);
      ev.length = Math.min(ev.length, max);
    },
    async events(limit) {
      return ev.slice(0, limit);
    },
    async keys(pattern) {
      const re = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      return [...m.keys()].filter((k) => re.test(k));
    },
    async hit(key) {
      const n = Number(m.get(key) ?? 0) + 1;
      m.set(key, n);
      return n;
    },
  };
}

export const STATS = "gg:stats";
export { EVENTS };
