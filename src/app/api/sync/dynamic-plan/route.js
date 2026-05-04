import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    const goal = await prisma.goal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!goal) throw new Error("Active goal not found");

    const now = new Date();
    // Chuyển sang định dạng YYYY-MM-DD an toàn, nhưng phải bao phủ TỚI CUỐI NGÀY HÔM NAY (23:59:59.999Z)
    // Nếu chỉ set T00:00:00, hệ thống sẽ bỏ sót toàn bộ các từ vựng có giờ hẹn ôn tập nằm rải rác trong ngày hôm nay!
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

    // 1. Quét toàn bộ kiến thức cũ đã đến hạn ôn tập (nextReviewDate <= endOfToday)
    const dueItems = await prisma.learningProgress.findMany({
      where: {
        userId: user.id,
        nextReviewDate: { lte: endOfToday }
      }
    });

    if (dueItems.length === 0) {
      return NextResponse.json({ success: true, message: "No items due for review today." });
    }

    // Nhóm theo loại kiến thức (vocab, grammar, map)
    const grouped = dueItems.reduce((acc, item) => {
      acc[item.itemType] = acc[item.itemType] || [];
      acc[item.itemType].push(item.itemId);
      return acc;
    }, {});

    const newTasks = [];
    let logChanges = {};

    // 2. Tạo DailyTask mang nhãn isReview = true
    for (const [type, ids] of Object.entries(grouped)) {
      if (ids.length > 0) {
        const task = await prisma.dailyTask.create({
          data: {
            userId: user.id,
            goalId: goal.id,
            scheduledDate: today,
            taskType: type,
            isReview: true,
            itemIds: ids,
            title: `[REVIEW] SRS Dọn nợ: ${ids.length} ${type}`,
            status: 'pending'
          }
        });
        newTasks.push(task);
        logChanges[type] = `Generated review task for ${ids.length} items`;
      }
    }

    // 3. Ghi log giải thích lý do
    const log = await prisma.planModificationLog.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        eventType: 'DYNAMIC_PLAN_GENERATED',
        reason: `Auto-generated ${newTasks.length} review task(s) because next_review_date <= TODAY`,
        changes: logChanges
      }
    });

    return NextResponse.json({ success: true, newTasks, log });
  } catch (error) {
    console.error("Dynamic Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
