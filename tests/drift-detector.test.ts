import { describe, it, expect } from 'vitest';
import { DriftDetector } from '@/lib/drift-detector';

describe('DriftDetector', () => {
  const detector = new DriftDetector();

  describe('parseEnvExample', () => {
    it('parses simple .env.example', () => {
      const content = `DATABASE_URL=postgresql://localhost:5432/db
PORT=3000
DEBUG=true`;
      const vars = detector.parseEnvExample(content);
      expect(vars).toEqual(['DATABASE_URL', 'PORT', 'DEBUG']);
    });

    it('ignores comments and empty lines', () => {
      const content = `# This is a comment
DATABASE_URL=postgresql://localhost:5432/db

# Another comment
PORT=3000`;
      const vars = detector.parseEnvExample(content);
      expect(vars).toEqual(['DATABASE_URL', 'PORT']);
    });

    it('handles colon syntax', () => {
      const content = `DATABASE_URL: postgresql://localhost:5432/db
PORT: 3000`;
      const vars = detector.parseEnvExample(content);
      expect(vars).toEqual(['DATABASE_URL', 'PORT']);
    });

    it('returns empty array for empty content', () => {
      expect(detector.parseEnvExample('')).toEqual([]);
      expect(detector.parseEnvExample('# only comments')).toEqual([]);
    });
  });

  describe('detect', () => {
    it('finds missing variables', () => {
      const result = detector.detect(
        ['DATABASE_URL', 'PORT', 'DEBUG'],
        ['DATABASE_URL', 'PORT', 'API_KEY'],
      );
      expect(result.missingVars).toEqual(['API_KEY']);
      expect(result.extraVars).toEqual(['DEBUG']);
      expect(result.matchedVars).toEqual(['DATABASE_URL', 'PORT']);
    });

    it('returns empty arrays when perfectly synced', () => {
      const result = detector.detect(['PORT', 'DEBUG'], ['PORT', 'DEBUG']);
      expect(result.missingVars).toEqual([]);
      expect(result.extraVars).toEqual([]);
      expect(result.matchedVars).toEqual(['PORT', 'DEBUG']);
    });

    it('is case-insensitive', () => {
      const result = detector.detect(['port', 'debug'], ['PORT', 'DEBUG']);
      expect(result.missingVars).toEqual([]);
      expect(result.extraVars).toEqual([]);
    });
  });

  describe('generateSummary', () => {
    it('returns healthy when no drift', () => {
      const summary = detector.generateSummary({
        missingVars: [],
        extraVars: [],
        matchedVars: ['PORT'],
      });
      expect(summary.status).toBe('healthy');
    });

    it('returns warning for missing vars', () => {
      const summary = detector.generateSummary({
        missingVars: ['API_KEY'],
        extraVars: [],
        matchedVars: [],
      });
      expect(summary.status).toBe('warning');
    });

    it('returns critical for many missing vars', () => {
      const summary = detector.generateSummary({
        missingVars: ['A', 'B', 'C', 'D', 'E', 'F'],
        extraVars: [],
        matchedVars: [],
      });
      expect(summary.status).toBe('critical');
    });
  });

  describe('generateEnvExample', () => {
    it('generates .env.example from variables', () => {
      const content = detector.generateEnvExample([
        { name: 'DATABASE_URL', required: true, description: 'DB connection', defaultValue: undefined },
        { name: 'PORT', required: false, defaultValue: '3000', description: 'Server port' },
      ]);
      expect(content).toContain('DATABASE_URL=');
      expect(content).toContain('PORT=3000');
      expect(content).toContain('# DB connection');
      expect(content).toContain('# Server port');
    });
  });
});
