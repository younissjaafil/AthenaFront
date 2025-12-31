const DEFAULT_BASE = "http://localhost:3001/api";

const rawBase = process.env.NEXT_PUBLIC_ATHENA_CORE_URL || DEFAULT_BASE;

const withApi = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export const SERVER_API_BASE =
  rawBase && rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;


