import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getOrCreateDummyUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'dummy@test.com',
        displayName: 'Guest User'
      }
    });
  }
  return user;
}

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        planModificationLogs: {
          orderBy: { createdAt: 'desc' }
        },
        dailyTasks: true
      },
      orderBy: { createdAt: 'desc' }
    });
    const progressList = await prisma.learningProgress.findMany();
    const enrichedGoals = goals.map(g => {
      const goalItemIds = new Set();
      if (g.dailyTasks) {
        g.dailyTasks.forEach(task => {
          if (Array.isArray(task.itemIds)) {
            task.itemIds.forEach(id => goalItemIds.add(id));
          }
        });
      }

      let qPerfect = 0;
      let qMemorized = 0;
      let qBad = 0;
      let qAlarming = 0;

      progressList.forEach(p => {
        if (goalItemIds.has(p.itemId)) {
          if (p.consecutiveCorrect >= 3 || (p.consecutiveCorrect >= 1 && p.easeFactor >= 2.5)) {
            qPerfect++;
          } else if (p.consecutiveCorrect >= 1) {
            qMemorized++;
          } else if (p.consecutiveCorrect === 0) {
            if (p.easeFactor < 2.0) qAlarming++;
            else qBad++;
          } else {
            qBad++;
          }
        }
      });

      let vCurrent = 0;
      let gCurrent = 0;
      let sCurrent = 0;
      let cCurrent = 0;

      if (g.dailyTasks) {
        g.dailyTasks.forEach(task => {
          if (task.status === 'COMPLETED' && !task.isReview && task.taskType !== 'consolidate') {
            const count = Array.isArray(task.itemIds) ? task.itemIds.length : 0;
            if (task.taskType === 'vocab') vCurrent += count;
            else if (task.taskType === 'grammar') gCurrent += count;
            else if (task.taskType === 'map' || task.taskType === 'sentences') sCurrent += count;
            else if (task.taskType === 'conversation') cCurrent += count;
          }
        });
      }

      return {
        ...g,
        vocabCurrent: vCurrent,
        grammarCurrent: gCurrent,
        sentencesCurrent: sCurrent,
        conversationsCurrent: cCurrent,
        qualityPerfect: qPerfect,
        qualityMemorized: qMemorized,
        qualityBad: qBad,
        qualityAlarming: qAlarming
      };
    });
    
    return NextResponse.json(enrichedGoals);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const user = await getOrCreateDummyUser();

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const validDates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (data.skipWeekends) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          validDates.push(new Date(d));
        }
      } else {
        validDates.push(new Date(d));
      }
    }
    if (validDates.length === 0) validDates.push(new Date(start));

    const workingDays = validDates.length;
    let vRemaining = data.vocabTarget || 0;
    let gRemaining = data.grammarTarget || 0;
    let sRemaining = data.sentencesTarget || 0;
    let cRemaining = data.conversationsTarget || 0;

    // Calculate how many 4-day cycles we have
    const totalCycles = Math.ceil(workingDays / 4) || 1;
    
    // Determine average load per cycle
    const vPerCycle = Math.ceil(vRemaining / totalCycles);
    const gPerCycle = Math.ceil(gRemaining / totalCycles);
    const sPerCycle = Math.ceil(sRemaining / totalCycles);
    const cPerCycle = Math.ceil(cRemaining / totalCycles);

    const dailyTasksArray = [];
    
    validDates.forEach((date, index) => {
      const dayInCycle = (index % 4) + 1; // 1, 2, 3, or 4
      
      let vQuota = 0, gQuota = 0, sQuota = 0, cQuota = 0;
      
      if (dayInCycle === 1) {
        vQuota = Math.ceil(vPerCycle * 0.6); // 60% of cycle's vocab/grammar on Day 1
        gQuota = Math.ceil(gPerCycle * 0.6);
        sQuota = Math.ceil(sPerCycle * 0.2); // Light reflex test
        cQuota = Math.ceil(cPerCycle * 0.2);
      } else if (dayInCycle === 2) {
        vQuota = Math.ceil(vPerCycle * 0.4); // 40% on Day 2
        gQuota = Math.ceil(gPerCycle * 0.4);
        sQuota = Math.ceil(sPerCycle * 0.3); 
        cQuota = Math.ceil(cPerCycle * 0.3);
      } else if (dayInCycle === 3) {
        vQuota = 0; // Pause new vocab/grammar
        gQuota = 0;
        sQuota = Math.ceil(sPerCycle * 0.5); // Heavy reflex test
        cQuota = Math.ceil(cPerCycle * 0.5);
      } else if (dayInCycle === 4) {
        // Day 4 is pure review / catch-up
        vQuota = 0;
        gQuota = 0;
        sQuota = 0;
        cQuota = 0;
      }
      
      // Ensure we don't exceed the global remaining totals
      vQuota = Math.min(vQuota, vRemaining);
      gQuota = Math.min(gQuota, gRemaining);
      sQuota = Math.min(sQuota, sRemaining);
      cQuota = Math.min(cQuota, cRemaining);
      
      vRemaining -= vQuota;
      gRemaining -= gQuota;
      sRemaining -= sQuota;
      cRemaining -= cQuota;
      
      // If it's the last day of the plan, dump all remaining tasks
      if (index === validDates.length - 1) {
         vQuota += vRemaining;
         gQuota += gRemaining;
         sQuota += sRemaining;
         cQuota += cRemaining;
      }

      if (vQuota > 0) dailyTasksArray.push({ userId: user.id, scheduledDate: new Date(date), taskType: 'vocab', title: `[NEW] Fetch ${vQuota} Vocabulary`, status: 'pending', isReview: false });
      if (gQuota > 0) dailyTasksArray.push({ userId: user.id, scheduledDate: new Date(date), taskType: 'grammar', title: `[NEW] Parse ${gQuota} Grammar Rules`, status: 'pending', isReview: false });
      if (sQuota > 0) dailyTasksArray.push({ userId: user.id, scheduledDate: new Date(date), taskType: 'map', title: `[REFLEX] 10s Test: ${sQuota} Sentences`, status: 'pending', isReview: false });
      if (cQuota > 0) dailyTasksArray.push({ userId: user.id, scheduledDate: new Date(date), taskType: 'conversation', title: `[SIM] ${cQuota} Conversations`, status: 'pending', isReview: false });
      
      if (dayInCycle === 4) {
         dailyTasksArray.push({ userId: user.id, scheduledDate: new Date(date), taskType: 'consolidate', title: `[CONSOLIDATE] Deep Review & Catch-up`, status: 'pending', isReview: true });
      }
    });

    const goal = await prisma.$transaction(async (tx) => {
      const createdGoal = await tx.goal.create({
        data: {
          userId: user.id,
          name: data.name,
          description: data.desc,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          skipWeekends: data.skipWeekends,
          status: data.status || 'ON_TRACK',
          vocabTarget: data.vocabTarget || 0,
          grammarTarget: data.grammarTarget || 0,
          sentencesTarget: data.sentencesTarget || 0,
          conversationsTarget: data.conversationsTarget || 0,
          
          planModificationLogs: {
            create: {
              userId: user.id,
              eventType: 'INIT_GOAL',
              reason: data.desc || 'Initial goal creation',
              changes: { action: `Created goal and generated ${dailyTasksArray.length} daily tasks.` }
            }
          },
          
          dailyTasks: {
            createMany: {
              data: dailyTasksArray
            }
          }
        },
        include: {
          planModificationLogs: {
            orderBy: { createdAt: 'desc' }
          },
          dailyTasks: true
        }
      });
      return createdGoal;
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("POST goal error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
