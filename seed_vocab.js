const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.exampleSentence.deleteMany({});
  await prisma.vocabulary.deleteMany({});

  const vocabs = [
    {
      kanji: '食べる',
      hiragana: 'たべる',
      meaning: 'Ăn',
      type: 'Verb',
      level: 'N5',
      examples: [
        { ja: 'りんごを食べる。', vi: 'Tôi ăn táo.' },
        { ja: '昨日、美味しいお寿司を食べました。', vi: 'Hôm qua, tôi đã ăn sushi rất ngon.' }
      ]
    },
    {
      kanji: '行く',
      hiragana: 'いく',
      meaning: 'Đi',
      type: 'Verb',
      level: 'N5',
      examples: [
        { ja: '学校へ行く。', vi: 'Tôi đi học.' },
        { ja: '明日、友達と東京に行きます。', vi: 'Ngày mai tôi đi Tokyo cùng bạn.' }
      ]
    },
    {
      kanji: '本',
      hiragana: 'ほん',
      meaning: 'Sách',
      type: 'Noun',
      level: 'N5',
      examples: [
        { ja: 'この本は面白い。', vi: 'Cuốn sách này thú vị.' },
        { ja: '図書館で本を借りました。', vi: 'Tôi đã mượn sách ở thư viện.' }
      ]
    },
    {
      kanji: '新しい',
      hiragana: 'あたらしい',
      meaning: 'Mới',
      type: 'Adjective',
      level: 'N5',
      examples: [
        { ja: '新しい車を買う。', vi: 'Tôi mua xe mới.' },
        { ja: 'このパソコンは新しいです。', vi: 'Cái máy tính này mới.' }
      ]
    },
    {
      kanji: '仕事',
      hiragana: 'しごと',
      meaning: 'Công việc',
      type: 'Noun',
      level: 'N5',
      examples: [
        { ja: '仕事が忙しい。', vi: 'Công việc bận rộn.' },
        { ja: '何の仕事をしていますか？', vi: 'Bạn làm công việc gì?' }
      ]
    }
  ];

  for (const v of vocabs) {
    await prisma.vocabulary.create({
      data: {
        kanji: v.kanji,
        hiragana: v.hiragana,
        meaning: v.meaning,
        type: v.type,
        level: v.level,
        examples: {
          create: v.examples
        }
      }
    });
  }

  console.log(`Seeded ${vocabs.length} vocabulary words with examples.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
