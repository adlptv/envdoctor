import { describe, it, expect } from 'vitest';
import { FileScanner } from '@/lib/scanner';

describe('FileScanner', () => {
  const scanner = new FileScanner();

  describe('detectLanguage', () => {
    it('detects TypeScript files', () => {
      expect(scanner.detectLanguage('src/config.ts')).toBe('typescript');
      expect(scanner.detectLanguage('app/page.tsx')).toBe('typescript');
    });

    it('detects JavaScript files', () => {
      expect(scanner.detectLanguage('index.js')).toBe('javascript');
      expect(scanner.detectLanguage('component.jsx')).toBe('javascript');
    });

    it('detects Python files', () => {
      expect(scanner.detectLanguage('main.py')).toBe('python');
    });

    it('detects Go files', () => {
      expect(scanner.detectLanguage('main.go')).toBe('go');
    });

    it('detects Rust files', () => {
      expect(scanner.detectLanguage('main.rs')).toBe('rust');
    });

    it('returns null for unknown extensions', () => {
      expect(scanner.detectLanguage('readme.md')).toBeNull();
      expect(scanner.detectLanguage('style.css')).toBeNull();
    });
  });

  describe('scanFile', () => {
    it('detects process.env variables in TypeScript', () => {
      const content = `
        const dbUrl = process.env.DATABASE_URL;
        const port = process.env.PORT || 3000;
      `;
      const { variables, file } = scanner.scanFile('config.ts', content, {
        languages: ['typescript'],
        detectSecrets: true,
        inferTypes: true,
        checkDrift: true,
        customSecretPatterns: [],
      });

      expect(file).not.toBeNull();
      expect(variables.has('DATABASE_URL')).toBe(true);
      expect(variables.has('PORT')).toBe(true);
    });

    it('detects bracket notation access', () => {
      const content = `const key = process.env['API_KEY'];`;
      const { variables } = scanner.scanFile('config.ts', content, {
        languages: ['typescript'],
        detectSecrets: false,
        inferTypes: false,
        checkDrift: false,
        customSecretPatterns: [],
      });

      expect(variables.has('API_KEY')).toBe(true);
    });

    it('detects Python env vars', () => {
      const content = `
        import os
        db_url = os.environ.get('DATABASE_URL')
        port = os.getenv('PORT', '3000')
      `;
      const { variables } = scanner.scanFile('config.py', content, {
        languages: ['python'],
        detectSecrets: false,
        inferTypes: false,
        checkDrift: false,
        customSecretPatterns: [],
      });

      expect(variables.has('DATABASE_URL')).toBe(true);
      expect(variables.has('PORT')).toBe(true);
    });

    it('counts multiple usages of same variable', () => {
      const content = `
        const a = process.env.PORT;
        const b = process.env.PORT;
        const c = process.env.PORT;
      `;
      const { variables } = scanner.scanFile('config.ts', content, {
        languages: ['typescript'],
        detectSecrets: false,
        inferTypes: false,
        checkDrift: false,
        customSecretPatterns: [],
      });

      expect(variables.get('PORT')?.usageCount).toBe(3);
    });

    it('skips files not in configured languages', () => {
      const { file } = scanner.scanFile('config.py', 'os.getenv("PORT")', {
        languages: ['typescript'],
        detectSecrets: false,
        inferTypes: false,
        checkDrift: false,
        customSecretPatterns: [],
      });

      expect(file).toBeNull();
    });
  });

  describe('scanFiles', () => {
    it('aggregates variables across multiple files', () => {
      const result = scanner.scanFiles(
        [
          { path: 'a.ts', content: 'process.env.PORT; process.env.API_KEY;' },
          { path: 'b.ts', content: 'process.env.PORT; process.env.DATABASE_URL;' },
        ],
        {
          languages: ['typescript'],
          detectSecrets: true,
          inferTypes: true,
          checkDrift: true,
          customSecretPatterns: [],
        },
      );

      expect(result.stats.totalFiles).toBe(2);
      expect(result.stats.totalVariables).toBe(3);
      const port = result.variables.find((v) => v.name === 'PORT');
      expect(port?.usageCount).toBe(2);
      expect(port?.files).toContain('a.ts');
      expect(port?.files).toContain('b.ts');
    });
  });
});
