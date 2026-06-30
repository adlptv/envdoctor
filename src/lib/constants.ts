export const APP_NAME = 'EnvDoctor';
export const APP_DESCRIPTION = 'Environment Variable Auditor & Documentation Generator';
export const APP_VERSION = '1.0.0';

export const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[\w\-]{16,}['"]?/gi,
  /(?:secret|token|auth)\s*[:=]\s*['"]?[\w\-]{16,}['"]?/gi,
  /(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/gi,
  /(?:private[_-]?key)\s*[:=]\s*['"]?[^\s'"]{16,}['"]?/gi,
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
  /sk_[\w]{20,}/g,
  /pk_[\w]{20,}/g,
  /ghp_[\w]{36}/g,
  /AKIA[\w]{16}/g,
  /eyJ[\w\-]+\.[\w\-]+\.[\w\-]+/g,
];

export const SECRET_NAME_PATTERNS = [
  /secret/i,
  /token/i,
  /key/i,
  /password/i,
  /passwd/i,
  /private/i,
  /credential/i,
  /auth/i,
  /api[_-]?key/i,
];

export const ENV_VAR_PATTERNS: Record<string, RegExp[]> = {
  javascript: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
  ],
  typescript: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
  ],
  python: [
    /os\.environ\.get\(['"]([A-Z_][A-Z0-9_]*)['"]/g,
    /os\.environ\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /os\.getenv\(['"]([A-Z_][A-Z0-9_]*)['"]/g,
  ],
  go: [
    /os\.Getenv\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
    /os\.LookupEnv\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
  ],
  rust: [
    /env::var\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
    /std::env::var\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
  ],
  java: [
    /System\.getenv\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
    /System\.getProperty\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
  ],
};

export const FILE_EXTENSIONS: Record<string, string[]> = {
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx', '.mts', '.cts'],
  python: ['.py'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java'],
};

export const TYPE_HINTS = {
  number: ['PORT', 'TIMEOUT', 'MAX_', 'MIN_', 'SIZE', 'LIMIT', 'COUNT', 'RETRIES', 'WORKERS', 'CONCURRENCY'],
  boolean: ['ENABLE', 'DISABLE', 'DEBUG', 'VERBOSE', 'FORCE', 'SKIP', 'USE_', 'IS_'],
  url: ['URL', 'URI', 'ENDPOINT', 'HOST', 'ORIGIN'],
  json: ['CONFIG', 'OPTIONS', 'PAYLOAD', 'DATA'],
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];
