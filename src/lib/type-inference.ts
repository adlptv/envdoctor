import { EnvVarType, SupportedLanguage } from '@/types';
import { TYPE_HINTS } from './constants';

/**
 * Type Inference Engine
 * Analyzes variable names, default values, and usage patterns to infer types.
 */
export class TypeInferenceEngine {
  /**
   * Infer the type of an environment variable from its name and context.
   */
  inferType(
    name: string,
    defaultValue?: string,
    usagePatterns: string[] = [],
  ): EnvVarType {
    // Check default value first — most reliable signal
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
      const inferred = this.inferFromValue(defaultValue);
      if (inferred !== 'unknown') return inferred;
    }

    // Check usage patterns for type casts
    for (const pattern of usagePatterns) {
      const inferred = this.inferFromUsage(pattern);
      if (inferred !== 'unknown') return inferred;
    }

    // Check name against type hints
    const inferred = this.inferFromName(name);
    if (inferred !== 'unknown') return inferred;

    return 'string';
  }

  /**
   * Infer type from the default value.
   */
  private inferFromValue(value: string): EnvVarType {
    const trimmed = value.trim();

    // Boolean
    if (/^(true|false|yes|no|1|0|on|off)$/i.test(trimmed)) {
      return 'boolean';
    }

    // Number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return 'number';
    }

    // URL
    if (/^https?:\/\/.+/.test(trimmed) || /^wss?:\/\/.+/.test(trimmed)) {
      return 'url';
    }

    // JSON
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }

    return 'unknown';
  }

  /**
   * Infer type from usage patterns in code.
   */
  private inferFromUsage(pattern: string): EnvVarType {
    // Number casts
    if (/Number\(|parseInt\(|parseFloat\(|\*\s*1|\+\s*\+|Number\.parse/.test(pattern)) {
      return 'number';
    }

    // Boolean casts
    if (/Boolean\(|===\s*['"]true['"]|===\s*['"]1['"]|!!|toBoolean/.test(pattern)) {
      return 'boolean';
    }

    // URL usage
    if (/new\s+URL\(|fetch\(|axios\.|\.origin|\.href|\.protocol/.test(pattern)) {
      return 'url';
    }

    // JSON parse
    if (/JSON\.parse\(/.test(pattern)) {
      return 'json';
    }

    return 'unknown';
  }

  /**
   * Infer type from the variable name using heuristics.
   */
  private inferFromName(name: string): EnvVarType {
    const upper = name.toUpperCase();

    for (const hint of TYPE_HINTS.number) {
      if (upper.includes(hint)) return 'number';
    }

    for (const hint of TYPE_HINTS.boolean) {
      if (upper.includes(hint)) return 'boolean';
    }

    for (const hint of TYPE_HINTS.url) {
      if (upper.includes(hint)) return 'url';
    }

    for (const hint of TYPE_HINTS.json) {
      if (upper.includes(hint)) return 'json';
    }

    return 'unknown';
  }

  /**
   * Determine if a variable is required based on usage patterns.
   */
  inferRequired(usagePatterns: string[], hasDefault: boolean): boolean {
    // If there's a default value, it's likely optional
    if (hasDefault) return false;

    // Check for patterns that suggest required (throw on missing)
    for (const pattern of usagePatterns) {
      if (/throw|Error|required|missing/i.test(pattern)) {
        return true;
      }
    }

    // Check for direct access without fallback (process.env.VAR without ||)
    for (const pattern of usagePatterns) {
      if (!/\|\||\?|getenv\(/i.test(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract description from comments or surrounding context.
   */
  extractDescription(
    name: string,
    fileContent: string,
  ): string | undefined {
    const lines = fileContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`env.${name}`) || lines[i].includes(`env['${name}']`) || lines[i].includes(`env["${name}"]`)) {
        // Check line above for comment
        if (i > 0) {
          const above = lines[i - 1].trim();
          if (above.startsWith('//') || above.startsWith('#')) {
            return above.replace(/^(\/\/|#)\s*/, '');
          }
          if (above.startsWith('*') || above.startsWith('/**')) {
            return above.replace(/^(\/\*\*?|\*)\s*/, '').replace(/\*\/$/, '').trim();
          }
        }
        // Check inline comment
        const line = lines[i];
        const commentMatch = line.match(/(?:\/\/|#)\s*(.+)$/);
        if (commentMatch) {
          return commentMatch[1].trim();
        }
      }
    }
    return undefined;
  }

  /**
   * Batch infer types for multiple variables.
   */
  batchInfer(
    variables: Array<{ name: string; defaultValue?: string; usagePatterns: string[] }>,
  ): Array<{ name: string; type: EnvVarType; required: boolean }> {
    return variables.map((v) => ({
      name: v.name,
      type: this.inferType(v.name, v.defaultValue, v.usagePatterns),
      required: this.inferRequired(v.usagePatterns, v.defaultValue !== undefined),
    }));
  }
}

export const typeInferenceEngine = new TypeInferenceEngine();
