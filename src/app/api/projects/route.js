import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const projects = await prisma.syncProject.findMany({
      include: {
        config: true
      }
    });

    // Group projects by workspace domain
    const workspaces = {};
    projects.forEach(p => {
      const domain = p.config.domain;
      if (!workspaces[domain]) {
        workspaces[domain] = [];
      }
      workspaces[domain].push({
        id: p.id,
        key: p.projectKey,
        name: p.name,
        statuses: p.statuses || []
      });
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
