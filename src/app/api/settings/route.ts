import { NextRequest, NextResponse } from 'next/server';
import { settingsSchema } from '@/lib/validation';

// In-memory store (would use DB in production)
let currentSettings = {
  theme: 'system' as const,
  defaultLanguage: 'typescript' as const,
  autoScan: false,
  secretPatterns: [] as string[],
  excludePatterns: ['node_modules', '.git', 'dist', 'build'],
};

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ success: true, data: currentSettings });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);
    currentSettings = data;
    return NextResponse.json({ success: true, data: currentSettings });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings: ' + error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 },
    );
  }
}
