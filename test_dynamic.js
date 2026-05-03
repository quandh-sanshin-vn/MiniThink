const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log("=== BẮT ĐẦU TEST DYNAMIC PLAN ===");

  const user = await prisma.user.findFirst();
  const goal = await prisma.goal.findFirst({ orderBy: { createdAt: 'desc' } });

  if (!user || !goal) {
    console.log("Lỗi: Không tìm thấy User hoặc Goal. Hãy tạo 1 Goal qua giao diện web trước.");
    return;
  }

  console.log("\n[1] Xóa dữ liệu rác cũ (learning_progress và các Review Task cũ)...");
  await prisma.learningProgress.deleteMany({});
  await prisma.dailyTask.deleteMany({ where: { isReview: true } });

  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  console.log("\n[2] Giả lập dữ liệu Spaced Repetition (SRS):");
  // 5 từ vựng nợ từ hôm qua (Cần ôn)
  for(let i=1; i<=5; i++) {
    await prisma.learningProgress.create({
      data: { userId: user.id, itemType: 'vocab', itemId: `v-old-${i}`, nextReviewDate: yesterday }
    });
  }
  // 2 ngữ pháp tới hạn hôm nay (Cần ôn)
  for(let i=1; i<=2; i++) {
    await prisma.learningProgress.create({
      data: { userId: user.id, itemType: 'grammar', itemId: `g-today-${i}`, nextReviewDate: today }
    });
  }
  // 10 từ vựng ngày mai mới tới hạn (KHÔNG cần ôn)
  for(let i=1; i<=10; i++) {
    await prisma.learningProgress.create({
      data: { userId: user.id, itemType: 'vocab', itemId: `v-tmr-${i}`, nextReviewDate: tomorrow }
    });
  }

  console.log("-> Đã tiêm: 5 vocab nợ (hôm qua), 2 grammar tới hạn (hôm nay), và 10 vocab chưa tới hạn (ngày mai).");

  console.log("\n[3] Mô phỏng gọi API Dynamic Sync (/api/sync/dynamic-plan)...");
  
  const dueItems = await prisma.learningProgress.findMany({
    where: { userId: user.id, nextReviewDate: { lte: today } }
  });

  const grouped = dueItems.reduce((acc, item) => {
    acc[item.itemType] = acc[item.itemType] || [];
    acc[item.itemType].push(item.itemId);
    return acc;
  }, {});

  const newTasks = [];
  let logChanges = {};

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

  const log = await prisma.planModificationLog.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      eventType: 'DYNAMIC_PLAN_GENERATED',
      reason: `Auto-generated ${newTasks.length} review task(s) because next_review_date <= TODAY`,
      changes: logChanges
    }
  });

  console.log("\n[4] KẾT QUẢ TẠO TASK ÔN TẬP TRONG DB:");
  newTasks.forEach(t => console.log(`  - Tên Task: ${t.title} | Loại: ${t.taskType} | Cần học: ${t.itemIds.length} items`));
  
  console.log("\n[5] KẾT QUẢ GHI LOG (BẢNG plan_modification_logs):");
  console.log(`  - EventType: ${log.eventType}`);
  console.log(`  - Lý do:     ${log.reason}`);
  console.log(`  - Chi tiết: `, log.changes);

  console.log("\n=== TEST HOÀN TẤT ===");
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
