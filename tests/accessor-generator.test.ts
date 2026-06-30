import { describe, it, expect } from 'vitest';
import { AccessorGenerator } from '@/lib/accessor-generator';
import { DetectedEnvVar } from '@/types';

describe('AccessorGenerator', () => {
  const generator = new AccessorGenerator();

  const sampleVars: DetectedEnvVar[] = [
    {
      name: 'DATABASE_URL',
      type: 'url',
      required: true,
      isSecret: true,
      usageCount: 1,
      files: [],
      usagePatterns: [],
      description: 'Database connection URL',
    },
    {
      name: 'PORT',
      type: 'number',
      required: false,
      defaultValue: '3000',
      isSecret: false,
      usageCount: 1,
      files: [],
      usagePatterns: [],
      description: 'Server port',
    },
    {
      name: 'DEBUG',
      type: 'boolean',
      required: false,
      defaultValue: 'false',
      isSecret: false,
      usageCount: 1,
      files: [],
      usagePatterns: [],
    },
    {
      name: 'APP_NAME',
      type: 'string',
      required: false,
      isSecret: false,
      usageCount: 1,
      files: [],
      usagePatterns: [],
    },
  ];

  it('generates valid TypeScript with Zod schema', () => {
    const code = generator.generate(sampleVars, 'TestApp');

    expect(code).toContain("import { z } from 'zod'");
    expect(code).toContain('const envSchema = z.object({');
    expect(code).toContain('databaseUrl: z.string().url()');
    expect(code).toContain('port: z.coerce.number().default(3000)');
    expect(code).toContain('debug: z.coerce.boolean().default(false)');
    expect(code).toContain('appName: z.string().optional()');
  });

  it('exports typed env object', () => {
    const code = generator.generate(sampleVars);

    expect(code).toContain('export type Env = z.infer<typeof envSchema>');
    expect(code).toContain('export const env = parsed.data');
  });

  it('includes individual accessors', () => {
    const code = generator.generate(sampleVars);

    expect(code).toContain('export const databaseUrl = env.databaseUrl');
    expect(code).toContain('export const port = env.port');
    expect(code).toContain('export const debug = env.debug');
    expect(code).toContain('export const appName = env.appName');
  });

  it('includes helper functions', () => {
    const code = generator.generate(sampleVars);

    expect(code).toContain('export function hasEnvVar');
    expect(code).toContain('export function getRawEnvVar');
  });

  it('marks secrets with lock emoji', () => {
    const code = generator.generate(sampleVars);

    expect(code).toContain('🔒');
  });

  it('includes error handling', () => {
    const code = generator.generate(sampleVars);

    expect(code).toContain('safeParse');
    expect(code).toContain('throw new Error');
  });
});
