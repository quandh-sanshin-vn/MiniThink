const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../public/data/japanese/vocabulary.json');
  console.log(`Reading vocabulary from ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error("File vocabulary.json not found!");
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const vocabularies = JSON.parse(rawData);

  console.log(`Found ${vocabularies.length} vocabularies. Starting migration...`);

  const vocabData = [];
  const examplesData = [];

  for (const item of vocabularies) {
    const vocabId = item.id;
    vocabData.push({
      id: vocabId,
      kanji: item.kanji || '',
      hiragana: item.hiragana || '',
      meaning: item.meaning || '',
      type: item.type || 'unknown',
      level: item.level || 'N3',
      sourcePage: item.source_page ? parseInt(item.source_page) : null,
    });

    if (item.examples && Array.isArray(item.examples)) {
      for (const ex of item.examples) {
        examplesData.push({
          vocabularyId: vocabId,
          ja: ex.ja,
          vi: ex.vi
        });
      }
    }
  }

  console.log('Inserting vocabularies...');
  const chunkSize = 2000;
  
  for (let i = 0; i < vocabData.length; i += chunkSize) {
    const chunk = vocabData.slice(i, i + chunkSize);
    await prisma.vocabulary.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted vocabularies ${i} to ${i + chunk.length}`);
  }

  console.log(`Inserting ${examplesData.length} examples...`);
  for (let i = 0; i < examplesData.length; i += chunkSize) {
    const chunk = examplesData.slice(i, i + chunkSize);
    await prisma.exampleSentence.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted examples ${i} to ${i + chunk.length}`);
  }

  console.log("Migration completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
