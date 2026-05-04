import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await prisma.syncTask.findMany({
      include: {
        config: true,
        project: true
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    // Map tasks for the UI format
    const formattedTasks = tasks.map(t => ({
      id: t.issueKey,
      internalId: t.id,
      title: t.title,
      priority: t.priority,
      module: t.project?.projectKey || 'UNKNOWN',
      status: t.status,
      source: 'BACKLOG',
      url: t.url,
      projectName: t.project?.name,
      domain: t.config?.domain,
      parentIssueId: t.parentIssueId,
      externalId: t.externalId,
      assigneeName: t.assigneeName
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // TODO: Tương lai xử lý tạo task Backlog trực tiếp
  return NextResponse.json({ message: 'Tính năng tạo task đang được phát triển' });
}
