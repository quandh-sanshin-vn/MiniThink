import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { parentIssueKey, parentIssueExternalId, projectKey, domain, featureName, shortDesc, assigneeId } = body;

    if (!parentIssueExternalId || !projectKey || !domain || !featureName || !shortDesc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get Integration Config
    const config = await prisma.integrationConfig.findFirst({
      where: { domain: domain, platform: 'BACKLOG', isActive: true }
    });

    if (!config) {
      return NextResponse.json({ error: 'Backlog integration not configured' }, { status: 404 });
    }

    const API_KEY = config.apiKey;

    // 2. Fetch Project ID (Integer)
    const projectRes = await fetch(`https://${domain}/api/v2/projects/${projectKey}?apiKey=${API_KEY}`);
    const projectData = await projectRes.json();
    if (!projectData.id) {
      return NextResponse.json({ error: 'Failed to fetch project info from Backlog' }, { status: 500 });
    }
    const projectId = projectData.id;

    // 3. Fetch Issue Types to find "確認・質問" or default
    const issueTypesRes = await fetch(`https://${domain}/api/v2/projects/${projectKey}/issueTypes?apiKey=${API_KEY}`);
    const issueTypes = await issueTypesRes.json();
    let targetIssueTypeId = issueTypes[0]?.id; // fallback
    const qaType = issueTypes.find(t => t.name.includes('確認') || t.name.includes('質問') || t.name === 'QA' || t.name.includes('Q&A'));
    if (qaType) {
      targetIssueTypeId = qaType.id;
    }

    // 4. Build Title: "Q&A - [Feature] - [Short Desc]"
    const issueSummary = `Q&A - ${featureName} - ${shortDesc}`;

    // 5. Create Issue
    const formParams = new URLSearchParams();
    formParams.append('projectId', projectId);
    formParams.append('summary', issueSummary);
    formParams.append('issueTypeId', targetIssueTypeId);
    formParams.append('priorityId', 2); // 2 = High priority in Backlog
    formParams.append('parentIssueId', parentIssueExternalId); // Link to parent
    if (assigneeId) {
      formParams.append('assigneeId', assigneeId);
    }

    const createRes = await fetch(`https://${domain}/api/v2/issues?apiKey=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString()
    });

    const newIssue = await createRes.json();

    if (!createRes.ok) {
      console.error('Backlog Create Issue Error:', newIssue);
      return NextResponse.json({ error: newIssue.errors?.[0]?.message || 'Failed to create task in Backlog' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      issueKey: newIssue.issueKey,
      url: `https://${domain}/view/${newIssue.issueKey}#edit`
    });

  } catch (error) {
    console.error('Error creating QA task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
