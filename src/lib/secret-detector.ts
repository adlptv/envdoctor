import { SECRET_PATTERNS, SECRET_NAME_PATTERNS } from './constants';

export interface SecretDetectionResult {
  isSecret: boolean;
  reasons: string[];
  confidence: number;
}

/**
 * Secret Detection Engine
 * Flags variables that likely contain sensitive values.
 */
export class SecretDetector {
  /**
   * Check if a variable name suggests it's a secret.
   */
  detectByName(name: string): boolean {
    return SECRET_NAME_PATTERNS.some((pattern) => pattern.test(name));
  }

  /**
   * Check if a value matches known secret patterns.
   */
  detectByValue(value: string): boolean {
    if (!value || value.length < 3) return false;
    // Skip placeholder values
    if (/^(your-|change-|replace-|xxx|<|example|placeholder|dummy|test|sample)/i.test(value)) {
      return false;
    }
    return SECRET_PATTERNS.some((pattern) => {
      const regex = new RegExp(pattern.source, pattern.flags);
      return regex.test(value);
    });
  }

  /**
   * Full detection with reasons and confidence score.
   */
  detect(
    name: string,
    value?: string,
    defaultValue?: string,
  ): SecretDetectionResult {
    const reasons: string[] = [];
    let score = 0;

    // Name-based detection
    if (this.detectByName(name)) {
      reasons.push(`Variable name "${name}" matches secret naming patterns`);
      score += 50;
    }

    // Value-based detection
    const valToCheck = value || defaultValue;
    if (valToCheck && this.detectByValue(valToCheck)) {
      reasons.push('Value matches known secret format (API key, token, etc.)');
      score += 40;
    }

    // Check for high-entropy values
    if (valToCheck && this.isHighEntropy(valToCheck)) {
      reasons.push('Value has high entropy, suggesting a generated secret');
      score += 20;
    }

    // Check for connection strings with credentials
    if (valToCheck && /:\/\/[^:]+:[^@]+@/.test(valToCheck)) {
      reasons.push('Value contains embedded credentials in URL');
      score += 30;
    }

    return {
      isSecret: score >= 50,
      reasons,
      confidence: Math.min(score, 100),
    };
  }

  /**
   * Check if a string has high entropy (likely a secret).
   */
  private isHighEntropy(str: string): boolean {
    if (str.length < 20) return false;

    const chars = new Map<string, number>();
    for (const char of str) {
      chars.set(char, (chars.get(char) || 0) + 1);
    }

    let entropy = 0;
    const len = str.length;
    for (const count of chars.values()) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    // Entropy > 3.5 with length > 20 is suspicious
    return entropy > 3.5;
  }

  /**
   * Batch detect secrets for multiple variables.
   */
  batchDetect(
    variables: Array<{ name: string; value?: string; defaultValue?: string }>,
  ): Array<{ name: string } & SecretDetectionResult> {
    return variables.map((v) => ({
      name: v.name,
      ...this.detect(v.name, v.value, v.defaultValue),
    }));
  }

  /**
   * Get a list of custom patterns to add.
   */
  addCustomPattern(pattern: string): RegExp {
    return new RegExp(pattern, 'gi');
  }
}

export const secretDetector = new SecretDetector();
