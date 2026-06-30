import { DetectedEnvVar, ScannedFile, ScanResult, ScanStats, ScanConfig, SupportedLanguage } from '@/types';
import { ENV_VAR_PATTERNS, FILE_EXTENSIONS } from './constants';
import { typeInferenceEngine } from './type-inference';
import { secretDetector } from './secret-detector';

/**
 * File Scanner
 * Scans source files for environment variable usage.
 */
export class FileScanner {
  /**
   * Detect language from file extension.
   */
  detectLanguage(filePath: string): SupportedLanguage | null {
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    for (const [lang, exts] of Object.entries(FILE_EXTENSIONS)) {
      if (exts.includes(ext)) return lang as SupportedLanguage;
    }
    return null;
  }

  /**
   * Scan a single file for env var usage.
   */
  scanFile(
    path: string,
    content: string,
    config: ScanConfig,
  ): { variables: Map<string, DetectedEnvVar>; file: ScannedFile | null } {
    const lang = this.detectLanguage(path);
    if (!lang || !config.languages.includes(lang)) {
      return { variables: new Map(), file: null };
    }

    const patterns = ENV_VAR_PATTERNS[lang] || [];
    const variables = new Map<string, DetectedEnvVar>();

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        if (!variables.has(name)) {
          // Extract context around the match
          const lineStart = content.lastIndexOf('\n', match.index) + 1;
          const lineEnd = content.indexOf('\n', match.index);
          const line = content.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);

          // Get surrounding lines for context
          const lines = content.split('\n');
          const lineNum = content.substring(0, match.index).split('\n').length - 1;
          const context: string[] = [];
          for (let i = Math.max(0, lineNum - 2); i <= Math.min(lines.length - 1, lineNum + 2); i++) {
            context.push(lines[i]);
          }

          const description = typeInferenceEngine.extractDescription(name, content);
          const isSecret = config.detectSecrets && secretDetector.detectByName(name);

          variables.set(name, {
            name,
            type: 'unknown',
            required: false,
            description,
            isSecret,
            usageCount: 1,
            files: [path],
            usagePatterns: [line.trim()],
          });
        } else {
          const existing = variables.get(name)!;
          existing.usageCount++;
          if (!existing.files.includes(path)) {
            existing.files.push(path);
          }
          // Add usage pattern
          const lineStart = content.lastIndexOf('\n', match.index) + 1;
          const lineEnd = content.indexOf('\n', match.index);
          const line = content.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
          if (!existing.usagePatterns.includes(line.trim())) {
            existing.usagePatterns.push(line.trim());
          }
        }
      }
    }

    // Infer types if enabled
    if (config.inferTypes) {
      for (const v of variables.values()) {
        v.type = typeInferenceEngine.inferType(v.name, v.defaultValue, v.usagePatterns);
        v.required = typeInferenceEngine.inferRequired(v.usagePatterns, v.defaultValue !== undefined);
      }
    }

    const file: ScannedFile = {
      path,
      language: lang,
      envVarCount: variables.size,
    };

    return { variables, file };
  }

  /**
   * Scan multiple files.
   */
  scanFiles(
    files: Array<{ path: string; content: string }>,
    config: ScanConfig,
  ): ScanResult {
    const allVariables = new Map<string, DetectedEnvVar>();
    const scannedFiles: ScannedFile[] = [];
    const byLanguage: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const { path, content } of files) {
      const { variables, file } = this.scanFile(path, content, config);
      if (file) {
        scannedFiles.push(file);
        byLanguage[file.language] = (byLanguage[file.language] || 0) + 1;
      }

      for (const [name, v] of variables) {
        if (allVariables.has(name)) {
          const existing = allVariables.get(name)!;
          existing.usageCount += v.usageCount;
          for (const f of v.files) {
            if (!existing.files.includes(f)) existing.files.push(f);
          }
          for (const p of v.usagePatterns) {
            if (!existing.usagePatterns.includes(p)) existing.usagePatterns.push(p);
          }
        } else {
          allVariables.set(name, { ...v });
        }
      }
    }

    // Re-run secret detection on aggregated variables
    if (config.detectSecrets) {
      for (const v of allVariables.values()) {
        const result = secretDetector.detect(v.name);
        v.isSecret = result.isSecret;
      }
    }

    // Re-run type inference
    if (config.inferTypes) {
      for (const v of allVariables.values()) {
        v.type = typeInferenceEngine.inferType(v.name, v.defaultValue, v.usagePatterns);
      }
    }

    // Build stats
    const variableList = Array.from(allVariables.values());
    for (const v of variableList) {
      byType[v.type] = (byType[v.type] || 0) + 1;
    }

    const stats: ScanStats = {
      totalFiles: scannedFiles.length,
      totalVariables: variableList.length,
      secretsDetected: variableList.filter((v) => v.isSecret).length,
      missingFromEnvExample: 0,
      byLanguage,
      byType,
    };

    return {
      files: scannedFiles,
      variables: variableList.sort((a, b) => a.name.localeCompare(b.name)),
      stats,
    };
  }
}

export const fileScanner = new FileScanner();
