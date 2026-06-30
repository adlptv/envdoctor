import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  repoPath: z.string().max(500).optional(),
  language: z.enum(['typescript', 'javascript', 'python', 'go', 'rust', 'java']).default('typescript'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const scanConfigSchema = z.object({
  languages: z.array(z.enum(['javascript', 'typescript', 'python', 'go', 'rust', 'java'])).default(['typescript', 'javascript']),
  detectSecrets: z.boolean().default(true),
  inferTypes: z.boolean().default(true),
  checkDrift: z.boolean().default(true),
  customSecretPatterns: z.array(z.string()).default([]),
});

export const scanFilesSchema = z.object({
  projectId: z.string().optional(),
  files: z.array(z.object({
    path: z.string().min(1),
    content: z.string(),
  })).min(1, 'At least one file is required'),
  envExample: z.string().optional(),
  config: scanConfigSchema.optional(),
});

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  defaultLanguage: z.enum(['typescript', 'javascript', 'python', 'go', 'rust', 'java']).default('typescript'),
  autoScan: z.boolean().default(false),
  secretPatterns: z.array(z.string()).default([]),
  excludePatterns: z.array(z.string()).default(['node_modules', '.git', 'dist', 'build']),
});

export const exportFormatSchema = z.enum(['markdown', 'json', 'env', 'typescript']);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ScanFilesInput = z.infer<typeof scanFilesSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;
