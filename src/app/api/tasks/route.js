import { NextResponse } from 'next/server';

// Domain Backlog của bạn
const BACKLOG_DOMAIN = process.env.BACKLOG_DOMAIN || 'sanshinbts.backlog.com';
const BACKLOG_API_KEY = process.env.BACKLOG_API_KEY;

export async function GET() {
  if (!BACKLOG_API_KEY) {
    return NextResponse.json({ error: 'Missing BACKLOG_API_KEY' }, { status: 400 });
  }

  try {
    // 1. Lấy thông tin user hiện tại (Myself) để lấy User ID
    const userRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/users/myself?apiKey=${BACKLOG_API_KEY}`);
    const userData = await userRes.json();
    
    if (!userData.id) throw new Error('Cannot fetch user ID');

    // 2. Fetch các issue được assign cho bản thân và chưa hoàn thành (Status != 4 - Closed)
    const issuesRes = await fetch(`https://${BACKLOG_DOMAIN}/api/v2/issues?apiKey=${BACKLOG_API_KEY}&assigneeId[]=${userData.id}&statusId[]=1&statusId[]=2&statusId[]=3`);
    const issues = await issuesRes.json();

    // 3. Chuẩn hóa format về chuẩn của MiniThink
    const formattedTasks = issues.map(issue => {
      // Map Priority (Nulab: 2=High, 3=Normal, 4=Low)
      let localPriority = 'P2';
      if (issue.priority.id === 2) localPriority = 'P1';
      else if (issue.priority.id === 4) localPriority = 'P3';
      
      // Map Status (Nulab: 1=Open, 2=In Progress, 3=Resolved)
      let localStatus = 'TODO';
      if (issue.status.id === 2) localStatus = 'IN_PROGRESS';
      if (issue.status.id === 3 || issue.status.id === 4) localStatus = 'DONE';

      return {
        id: issue.issueKey, // VD: XAI_SHINKO-47
        title: issue.summary,
        priority: localPriority,
        module: issue.project.projectKey, // Dùng Project Key làm Module
        status: localStatus,
        createdAt: issue.created,
        source: 'BACKLOG',
        url: `https://${BACKLOG_DOMAIN}/view/${issue.issueKey}`
      };
    });

    return NextResponse.json({ tasks: formattedTasks });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Giữ sẵn luồng POST để sau này thêm tính năng "Tạo Task" bắn lên Backlog
export async function POST(request) {
  // TODO: Logic đẩy task lên Backlog
  return NextResponse.json({ message: 'Tính năng tạo task đang được phát triển' });
}
