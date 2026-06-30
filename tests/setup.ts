// Test setup — runs before all tests
import { vi } from 'vitest';

// Mock Prisma client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    scan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    envVar: {
      createMany: vi.fn(),
    },
    driftReport: {
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}));
