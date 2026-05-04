import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const configs = await prisma.integrationConfig.findMany({
      where: { platform: 'BACKLOG', isActive: true }
    });

    if (configs.length === 0) {
      return NextResponse.json({ error: 'System not configured' }, { status: 400 });
    }

    let totalIssues = 0;

    for (const config of configs) {
      const BACKLOG_DOMAIN = config.domain;
      const BACKLOG_API_KEY = config.apiKey;

      try {
        // 1. Lấy thông tin user hiện tại
        const userRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/users/myself?apiKey=${BACKLOG_API_KEY}`);
        const userData = await userRes.json();
        
        if (!userData.id) continue;

        // 2. Fetch tất cả project
        const projectsRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/projects?apiKey=${BACKLOG_API_KEY}`);
        const apiProjects = await projectsRes.json();
        
        if (Array.isArray(apiProjects)) {
           for (const proj of apiProjects) {
              await prisma.syncProject.upsert({
                 where: {
                    configId_projectKey: { configId: config.id, projectKey: proj.projectKey }
                 },
                 update: { name: proj.name },
                 create: { configId: config.id, projectKey: proj.projectKey, name: proj.name }
              });
           }
        }

        // 3. Fetch issue
        const issuesRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/issues?apiKey=${BACKLOG_API_KEY}&assigneeId[]=${userData.id}&statusId[]=1&statusId[]=2&statusId[]=3`);
        const issues = await issuesRes.json();

        if (!Array.isArray(issues)) continue;

        totalIssues += issues.length;

        // Map project
        const allProjects = await prisma.syncProject.findMany({ where: { configId: config.id } });
        const projectMap = {};
        allProjects.forEach(p => projectMap[p.projectKey] = p.id);

        // 4. Lưu DB
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
            where: { configId_issueKey: { configId: config.id, issueKey: issue.issueKey } },
            update: taskData,
            create: taskData
          });
        }
      } catch (err) {
         console.error(`Failed to sync workspace ${BACKLOG_DOMAIN}`, err);
         // Tiếp tục với workspace khác nếu lỗi
      }
    }

    return NextResponse.json({ success: true, count: totalIssues });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
