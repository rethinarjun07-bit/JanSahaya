/**
 * JanSahaya Safe Logging Utility
 * Redacts API keys, tokens, passwords, database credentials, and personal data from server logs.
 */

const SENSITIVE_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Google / Gemini API Keys (AIza...)
  { regex: /AIza[0-9A-Za-z-_]{35}/g, replacement: "[REDACTED_GEMINI_KEY]" },
  // Bearer tokens
  { regex: /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, replacement: "Bearer [REDACTED_JWT]" },
  // JWT tokens (eyJh...)
  { regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: "[REDACTED_JWT]" },
  // Database passwords in connection strings: postgres://user:password@host
  { regex: /(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi, replacement: "$1[REDACTED_DB_PWD]$3" },
  // Password in JSON or query params: "password":"...", password=...
  { regex: /("password"\s*:\s*")[^"]+(")/gi, replacement: '$1[REDACTED_PASSWORD]$2' },
  { regex: /(password=)[^&]+/gi, replacement: "$1[REDACTED_PASSWORD]" },
];

export function sanitizeLogMessage(message: unknown): string {
  if (message === null || message === undefined) return "";
  let str: string;

  if (typeof message === "string") {
    str = message;
  } else if (message instanceof Error) {
    str = `${message.name}: ${message.message}`;
    // Include stack trace only in non-production
    if (process.env.NODE_ENV !== "production" && message.stack) {
      str += `\n${message.stack}`;
    }
  } else {
    try {
      str = JSON.stringify(message);
    } catch {
      str = String(message);
    }
  }

  for (const { regex, replacement } of SENSITIVE_PATTERNS) {
    str = str.replace(regex, replacement);
  }

  return str;
}

export const safeLog = {
  info: (...args: unknown[]) => {
    console.log(...args.map(sanitizeLogMessage));
  },
  warn: (...args: unknown[]) => {
    console.warn(...args.map(sanitizeLogMessage));
  },
  error: (...args: unknown[]) => {
    console.error(...args.map(sanitizeLogMessage));
  },
};
