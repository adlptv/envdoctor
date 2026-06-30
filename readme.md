# EnvDoctor — Environment Variable Auditor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

Scans your codebase for environment variable usage across six languages. Infers types from usage patterns, generates typed accessors with Zod validation, compares your .env.example against what actually exists, and flags variables that look like secrets.

## Screenshots

| Landing Page (Inventory) | Alerts (Drift + Secrets) |
|:---:|:---:|
| ![Alerts: drift detection and secret exposure warnings with specific variable details](screenshots/dashboard.png) |

## Features

- Scans six languages: JavaScript, TypeScript, Python, Go, Rust, Java
- Type inference from usage patterns: parseInt → number, === "true" → boolean, URL constructor → URL
- Generates .env.example with all discovered variables, types, and defaults
- Generates typed accessor: env.ts with TypeScript types plus runtime Zod validation
- Drift detection: compares .env.example against what code actually references
- Secret detection: flags variables matching Token, Key, Secret, Password, API, and Private patterns
- No secret values stored or logged

## Quick Start

```bash
git clone https://github.com/adlptv/envdoctor.git
cd envdoctor
pnpm install
pnpm dev
```

Or:
```bash
docker-compose up
```

## Architecture

```
apps/envdoctor/
├── src/app/          # Pages: landing, dashboard, projects, scan, history, settings
│   └── api/          # projects, scan, scans/[id]/drift, scans/[id]/docs, scans/[id]/accessor, health
├── src/components/   # EnvVarTable, DriftAlerts, SecretWarnings, ScanWizard, CodeBlock, UI primitives
├── src/lib/          # Scanner (6 languages), type-inference, secret-detector, drift-detector, doc-generator, accessor-generator, validators (Zod)
├── prisma/           # SQLite: Project, Scan, EnvVar, DriftReport
└── tests/            # Vitest + Playwright
```

## Example Output

After scanning, EnvDoctor generates a typed accessor:

```typescript
import { z } from "zod";
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
});
export const env = envSchema.parse(process.env);
```

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | /api/projects | List or create projects |
| GET/PUT/DELETE | /api/projects/[id] | Manage a project |
| POST | /api/scan | Upload files and run environment variable scan |
| GET | /api/scans/[id] | Get scan results |
| GET | /api/scans/[id]/drift | Compare scan against .env.example |
| GET | /api/scans/[id]/docs | Generate Markdown documentation |
| GET | /api/scans/[id]/accessor | Generate typed accessor code |
| GET | /api/health | Health check |

## Security

- Zod validation on all routes
- Rate limiting
- Helmet.js headers
- No secret values logged or stored
- Encryption for stored configuration values

## License

MIT