export type EnvVarType = 'string' | 'number' | 'boolean' | 'url' | 'json' | 'unknown';

export interface DetectedEnvVar {
  name: string;
  type: EnvVarType;
  required: boolean;
  defaultValue?: string;
  description?: string;
  isSecret: boolean;
  usageCount: number;
  files: string[];
  usagePatterns: string[];
}

export interface ScanResult {
  id?: string;
  projectId?: string;
  files: ScannedFile[];
  variables: DetectedEnvVar[];
  stats: ScanStats;
  createdAt?: string;
}

export interface ScannedFile {
  path: string;
  language: SupportedLanguage;
  envVarCount: number;
}

export interface ScanStats {
  totalFiles: number;
  totalVariables: number;
  secretsDetected: number;
  missingFromEnvExample: number;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
}

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java';

export interface DriftResult {
  missingVars: string[];
  extraVars: string[];
  matchedVars: string[];
}

export interface ScanConfig {
  languages: SupportedLanguage[];
  detectSecrets: boolean;
  inferTypes: boolean;
  checkDrift: boolean;
  customSecretPatterns: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  repoPath?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  totalVariables: number;
  secretsDetected: number;
  driftDetected: boolean;
}
