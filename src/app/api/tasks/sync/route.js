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

    // 2. Fetch tất cả các project mà user tham gia để lưu vào danh sách
    const projectsRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/projects?apiKey=${BACKLOG_API_KEY}`);
    const apiProjects = await projectsRes.json();
    
    if (Array.isArray(apiProjects)) {
       for (const proj of apiProjects) {
          const projectData = {
             configId: config.id,
             projectKey: proj.projectKey,
             name: proj.name
          };
          
          await prisma.syncProject.upsert({
             where: {
                configId_projectKey: {
                   configId: config.id,
                   projectKey: proj.projectKey
                }
             },
             update: { name: proj.name },
             create: projectData
          });
       }
    }

    // 3. Fetch các issue được assign cho bản thân và chưa hoàn thành
    const issuesRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/issues?apiKey=${BACKLOG_API_KEY}&assigneeId[]=${userData.id}&statusId[]=1&statusId[]=2&statusId[]=3`);
    const issues = await issuesRes.json();

    if (!Array.isArray(issues)) {
       throw new Error('Invalid response from Backlog API');
    }

    // Lấy lại danh sách project từ DB ra một map để dễ lookup
    const allProjects = await prisma.syncProject.findMany({
       where: { configId: config.id }
    });
    const projectMap = {};
    allProjects.forEach(p => projectMap[p.projectKey] = p.id);

    // 4. Chuẩn hóa format và lưu vào DB
    for (const issue of issues) {
      let localPriority = 'P2';
      if (issue.priority.id === 2) localPriority = 'P1';
      else if (issue.priority.id === 4) localPriority = 'P3';
      
      let localStatus = 'TODO';
      if (issue.status.id === 2) localStatus = 'IN_PROGRESS';
      if (issue.status.id === 3 || issue.status.id === 4) localStatus = 'DONE';

      const projectKey = issue.issueKey.split('-')[0];
      const projectId = projectMap[projectKey];

      const taskData = {
        configId: config.id,
        projectId: projectId || null,
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
