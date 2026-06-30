import { describe, it, expect } from 'vitest';
import { SecretDetector } from '@/lib/secret-detector';

describe('SecretDetector', () => {
  const detector = new SecretDetector();

  describe('detectByName', () => {
    it('detects API key names', () => {
      expect(detector.detectByName('API_KEY')).toBe(true);
      expect(detector.detectByName('STRIPE_API_KEY')).toBe(true);
    });

    it('detects secret names', () => {
      expect(detector.detectByName('JWT_SECRET')).toBe(true);
      expect(detector.detectByName('SESSION_SECRET')).toBe(true);
    });

    it('detects token names', () => {
      expect(detector.detectByName('AUTH_TOKEN')).toBe(true);
      expect(detector.detectByName('ACCESS_TOKEN')).toBe(true);
    });

    it('detects password names', () => {
      expect(detector.detectByName('DB_PASSWORD')).toBe(true);
    });

    it('does not flag non-secret names', () => {
      expect(detector.detectByName('PORT')).toBe(false);
      expect(detector.detectByName('DEBUG')).toBe(false);
      expect(detector.detectByName('APP_NAME')).toBe(false);
    });
  });

  describe('detectByValue', () => {
    it('detects Stripe-like keys', () => {
      expect(detector.detectByValue('stripe_sk_fake_test_key_12345_abcde')).toBe(true);
      expect(detector.detectByValue('pk_live_1234567890abcdefghijklmnop')).toBe(true);
    });

    it('detects GitHub tokens', () => {
      expect(detector.detectByValue('ghp_1234567890abcdefghijklmnopqrstuvwxyz1234')).toBe(true);
    });

    it('detects AWS keys', () => {
      expect(detector.detectByValue('AKIAIOSFODNN7EXAMPLE')).toBe(true);
    });

    it('detects JWT tokens', () => {
      expect(detector.detectByValue('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456')).toBe(true);
    });

    it('detects private key blocks', () => {
      expect(detector.detectByValue('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
    });

    it('does not flag placeholder values', () => {
      expect(detector.detectByValue('your-api-key-here')).toBe(false);
      expect(detector.detectByValue('change-me')).toBe(false);
      expect(detector.detectByValue('xxx')).toBe(false);
    });

    it('does not flag short values', () => {
      expect(detector.detectByValue('ab')).toBe(false);
    });
  });

  describe('detect (full)', () => {
    it('returns high confidence for secret name + value', () => {
      const result = detector.detect('API_KEY', 'stripe_sk_fake_test_key_12345_abcde');
      expect(result.isSecret).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('detects credentials in URL', () => {
      const result = detector.detect('DATABASE_URL', 'postgresql://user:secretpass@localhost:5432/db');
      expect(result.isSecret).toBe(true);
    });

    it('returns low confidence for non-secret', () => {
      const result = detector.detect('PORT', '3000');
      expect(result.isSecret).toBe(false);
    });
  });
});
