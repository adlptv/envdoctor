import { describe, it, expect } from 'vitest';
import { DocGenerator } from '@/lib/doc-generator';
import { DetectedEnvVar, ScanResult } from '@/types';

describe('DocGenerator', () => {
  const generator = new DocGenerator();

  const sampleVars: DetectedEnvVar[] = [
    {
      name: 'DATABASE_URL',
      type: 'url',
      required: true,
      isSecret: true,
      usageCount: 3,
      files: ['src/db.ts', 'src/config.ts'],
      usagePatterns: ['process.env.DATABASE_URL'],
      description: 'PostgreSQL connection string',
    },
    {
      name: 'PORT',
      type: 'number',
      required: false,
      defaultValue: '3000',
      isSecret: false,
      usageCount: 2,
      files: ['src/server.ts'],
      usagePatterns: ['Number(process.env.PORT)'],
      description: 'Server port number',
    },
  ];

  describe('generateMarkdown', () => {
    it('generates valid markdown with summary table', () => {
      const scan: ScanResult = {
        files: [{ path: 'src/db.ts', language: 'typescript', envVarCount: 1 }],
        variables: sampleVars,
        stats: {
          totalFiles: 1,
          totalVariables: 2,
          secretsDetected: 1,
          missingFromEnvExample: 0,
          byLanguage: { typescript: 1 },
          byType: { url: 1, number: 1 },
        },
      };

      const md = generator.generateMarkdown(scan);
      expect(md).toContain('# Environment Variables');
      expect(md).toContain('| Variable | Type | Required | Default | Secret | Description |');
      expect(md).toContain('DATABASE_URL');
      expect(md).toContain('PORT');
      expect(md).toContain('🔒 Yes');
      expect(md).toContain('## Details');
      expect(md).toContain('### 🔐 Secrets');
      expect(md).toContain('### ⚙️ Optional Variables');
    });
  });

  describe('generateJSON', () => {
    it('generates valid JSON', () => {
      const scan: ScanResult = {
        files: [],
        variables: sampleVars,
        stats: {
          totalFiles: 0,
          totalVariables: 2,
          secretsDetected: 1,
          missingFromEnvExample: 0,
          byLanguage: {},
          byType: {},
        },
      };

      const json = generator.generateJSON(scan);
      const parsed = JSON.parse(json);
      expect(parsed.variables).toHaveLength(2);
      expect(parsed.variables[0].name).toBe('DATABASE_URL');
    });
  });

  describe('generateEnvExample', () => {
    it('generates .env.example with required and optional sections', () => {
      const content = generator.generateEnvExample(sampleVars);
      expect(content).toContain('# Required');
      expect(content).toContain('# Optional');
      expect(content).toContain('DATABASE_URL=');
      expect(content).toContain('PORT=3000');
      expect(content).toContain('⚠️ This is a secret');
    });
  });
});
