import { describe, it, expect } from 'vitest';
import { TypeInferenceEngine } from '@/lib/type-inference';

describe('TypeInferenceEngine', () => {
  const engine = new TypeInferenceEngine();

  describe('inferType', () => {
    it('infers number from default value', () => {
      expect(engine.inferType('PORT', '3000')).toBe('number');
      expect(engine.inferType('TIMEOUT', '5000')).toBe('number');
    });

    it('infers boolean from default value', () => {
      expect(engine.inferType('DEBUG', 'true')).toBe('boolean');
      expect(engine.inferType('DEBUG', 'false')).toBe('boolean');
      expect(engine.inferType('ENABLED', '1')).toBe('boolean');
    });

    it('infers url from default value', () => {
      expect(engine.inferType('DATABASE_URL', 'https://example.com')).toBe('url');
      expect(engine.inferType('WS_URL', 'wss://example.com/ws')).toBe('url');
    });

    it('infers json from default value', () => {
      expect(engine.inferType('CONFIG', '{"key":"value"}')).toBe('json');
      expect(engine.inferType('OPTIONS', '[1,2,3]')).toBe('json');
    });

    it('infers from name patterns', () => {
      expect(engine.inferType('PORT')).toBe('number');
      expect(engine.inferType('MAX_CONNECTIONS')).toBe('number');
      expect(engine.inferType('DEBUG')).toBe('boolean');
      expect(engine.inferType('ENABLE_FEATURE')).toBe('boolean');
      expect(engine.inferType('DATABASE_URL')).toBe('url');
      expect(engine.inferType('API_ENDPOINT')).toBe('url');
    });

    it('infers from usage patterns', () => {
      expect(engine.inferType('PORT', undefined, ['Number(process.env.PORT)'])).toBe('number');
      expect(engine.inferType('DEBUG', undefined, ['process.env.DEBUG === "true"'])).toBe('boolean');
      expect(engine.inferType('API_URL', undefined, ['new URL(process.env.API_URL)'])).toBe('url');
      expect(engine.inferType('CONFIG', undefined, ['JSON.parse(process.env.CONFIG)'])).toBe('json');
    });

    it('defaults to string when no hints', () => {
      expect(engine.inferType('RANDOM_VAR')).toBe('string');
    });
  });

  describe('inferRequired', () => {
    it('returns false when default value exists', () => {
      expect(engine.inferRequired([], true)).toBe(false);
    });

    it('returns true when throw pattern detected', () => {
      expect(engine.inferRequired(['throw new Error("missing")'], false)).toBe(true);
    });

    it('returns true for direct access without fallback', () => {
      expect(engine.inferRequired(['process.env.API_KEY'], false)).toBe(true);
    });

    it('returns false for access with fallback', () => {
      expect(engine.inferRequired(['process.env.PORT || 3000'], false)).toBe(false);
    });
  });

  describe('extractDescription', () => {
    it('extracts from line above comment', () => {
      const content = `
        // The database URL
        const url = process.env.DATABASE_URL;
      `;
      expect(engine.extractDescription('DATABASE_URL', content)).toBe('The database URL');
    });

    it('extracts from inline comment', () => {
      const content = `const port = process.env.PORT; // Server port number`;
      expect(engine.extractDescription('PORT', content)).toBe('Server port number');
    });

    it('returns undefined when no comment found', () => {
      const content = `const port = process.env.PORT;`;
      expect(engine.extractDescription('PORT', content)).toBeUndefined();
    });
  });
});
