import { z } from 'zod';

export const scanRequestSchema = z.object({
  projectId: z.string().optional(),
  projectName: z.string().min(1).max(200).optional(),
  repoPath: z.string().max(500).optional(),
  files: z.array(
    z.object({
      path: z.string().min(1).max(500),
      content: z.string().max(5_000_000),
      language: z.enum(['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'auto']).default('auto'),
    })
  ).min(1).max(500),
  envExample: z.string().optional(),
  config: z.object({
    languages: z.array(z.enum(['javascript', 'typescript', 'python', 'go', 'rust', 'java'])).optional(),
    detectSecrets: z.boolean().default(true),
    inferTypes: z.boolean().default(true),
    checkDrift: z.boolean().default(true),
    customSecretPatterns: z.array(z.string()).default([]),
  }).optional(),
});

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  repoPath: z.string().max(500).optional(),
  language: z.enum(['javascript', 'typescript', 'python', 'go', 'rust', 'java']).default('typescript'),
});

export const driftRequestSchema = z.object({
  envExample: z.string().min(1),
});

export const scanIdSchema = z.object({
  id: z.string().min(1),
});

export const projectIdSchema = z.object({
  id: z.string().min(1),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;
export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type DriftRequest = z.infer<typeof driftRequestSchema>;
