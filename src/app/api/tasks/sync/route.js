import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const config = await prisma.integrationConfig.findFirst({
      where: { platform: 'BACKLOG', isActive: true }
    });

    if (!config || !config.apiKey || !config.domain) {
      return NextResponse.json({ error: 'System not configured' }, { status: 400 });
    }

    const BACKLOG_DOMAIN = config.domain;
    const BACKLOG_API_KEY = config.apiKey;

    // 1. Lấy thông tin user hiện tại (Myself) để lấy User ID
    const userRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/users/myself?apiKey=${BACKLOG_API_KEY}`);
    const userData = await userRes.json();
    
    if (!userData.id) throw new Error('Cannot fetch user ID from Backlog');

    // 2. Fetch các issue được assign cho bản thân và chưa hoàn thành
    const issuesRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/issues?apiKey=${BACKLOG_API_KEY}&assigneeId[]=${userData.id}&statusId[]=1&statusId[]=2&statusId[]=3`);
    const issues = await issuesRes.json();

    if (!Array.isArray(issues)) {
       throw new Error('Invalid response from Backlog API');
    }

    // 3. Chuẩn hóa format và lưu vào DB
    for (const issue of issues) {
      let localPriority = 'P2';
      if (issue.priority.id === 2) localPriority = 'P1';
      else if (issue.priority.id === 4) localPriority = 'P3';
      
      let localStatus = 'TODO';
      if (issue.status.id === 2) localStatus = 'IN_PROGRESS';
      if (issue.status.id === 3 || issue.status.id === 4) localStatus = 'DONE';

      const projectKey = issue.issueKey.split('-')[0];
      
      // Đảm bảo project tồn tại trong DB
      let project = await prisma.syncProject.findFirst({
         where: { configId: config.id, projectKey }
      });
      if (!project) {
         // Thử lấy thêm thông tin project từ api để lưu name (chưa tối ưu lắm do gọi loop, nhưng OK cho scope nhỏ)
         const projRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/projects/${projectKey}?apiKey=${BACKLOG_API_KEY}`);
         const projData = await projRes.json();
         project = await prisma.syncProject.create({
            data: { configId: config.id, projectKey, name: projData.name || projectKey }
         });
      }

      const taskData = {
        configId: config.id,
        projectId: project.id,
        externalId: issue.id.toString(),
        issueKey: issue.issueKey,
        title: issue.summary,
        description: issue.description || '',
        priority: localPriority,
        status: localStatus,
        url: `https://${BACKLOG_DOMAIN}/view/${issue.issueKey}`,
        issueType: issue.issueType ? issue.issueType.name : null,
        assigneeName: issue.assignee ? issue.assignee.name : null,
        lastSyncedAt: new Date()
      };

      await prisma.syncTask.upsert({
        where: {
          configId_issueKey: {
            configId: config.id,
            issueKey: issue.issueKey
          }
        },
        update: taskData,
        create: taskData
      });
    }

    return NextResponse.json({ success: true, count: issues.length });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
