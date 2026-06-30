import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createProjectSchema } from '@/lib/validation';
import { ApiResponse, Project } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { scans: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await req.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({ data });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input: ' + error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 },
    );
  }
}
