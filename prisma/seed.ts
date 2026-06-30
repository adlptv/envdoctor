import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'A sample project for EnvDoctor demonstration',
      repoPath: './demo-project',
      language: 'typescript',
    },
  });

  const scan = await prisma.scan.create({
    data: {
      projectId: project.id,
      files: JSON.stringify([
        'src/config.ts',
        'src/database.ts',
        'src/server.ts',
      ]),
      variables: JSON.stringify(['DATABASE_URL', 'PORT', 'API_KEY', 'DEBUG']),
      stats: JSON.stringify({
        totalFiles: 3,
        totalVariables: 4,
        secretsDetected: 1,
        missingFromEnvExample: 1,
      }),
    },
  });

  await prisma.envVar.createMany({
    data: [
      {
        scanId: scan.id,
        name: 'DATABASE_URL',
        type: 'url',
        required: true,
        description: 'PostgreSQL connection string',
        isSecret: true,
        usageCount: 3,
        files: JSON.stringify(['src/database.ts', 'src/config.ts']),
      },
      {
        scanId: scan.id,
        name: 'PORT',
        type: 'number',
        required: false,
        defaultValue: '3000',
        description: 'Server port number',
        isSecret: false,
        usageCount: 2,
        files: JSON.stringify(['src/server.ts', 'src/config.ts']),
      },
      {
        scanId: scan.id,
        name: 'API_KEY',
        type: 'string',
        required: true,
        description: 'External API authentication key',
        isSecret: true,
        usageCount: 1,
        files: JSON.stringify(['src/config.ts']),
      },
      {
        scanId: scan.id,
        name: 'DEBUG',
        type: 'boolean',
        required: false,
        defaultValue: 'false',
        description: 'Enable debug logging',
        isSecret: false,
        usageCount: 1,
        files: JSON.stringify(['src/server.ts']),
      },
    ],
  });

  await prisma.driftReport.create({
    data: {
      scanId: scan.id,
      missingVars: JSON.stringify(['NODE_ENV']),
      extraVars: JSON.stringify([]),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
