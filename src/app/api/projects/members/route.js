import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const projectKey = searchParams.get('projectKey');

    if (!domain || !projectKey) {
      return NextResponse.json({ error: 'Missing domain or projectKey' }, { status: 400 });
    }

    const config = await prisma.integrationConfig.findFirst({
      where: { domain: domain, platform: 'BACKLOG', isActive: true }
    });

    if (!config) {
      return NextResponse.json({ error: 'Backlog config not found' }, { status: 404 });
    }

    // Lấy thông tin user hiện tại (để làm mặc định)
    const userRes = await fetch(`https://${domain}/api/v2/users/myself?apiKey=${config.apiKey}`);
    let currentUser = null;
    if (userRes.ok) {
      currentUser = await userRes.json();
    }

    // Lấy danh sách thành viên dự án
    const membersRes = await fetch(`https://${domain}/api/v2/projects/${projectKey}/users?apiKey=${config.apiKey}`);
    if (!membersRes.ok) {
       return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
    const members = await membersRes.json();

    return NextResponse.json({ members, currentUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
