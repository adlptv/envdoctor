import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateProjectSchema } from '@/lib/validation';
import { ApiResponse, Project } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          include: { envVars: true, driftReports: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 },
    );
  }
}
