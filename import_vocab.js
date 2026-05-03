const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting import process...");

  // 1. Delete existing data
  console.log("Deleting existing example sentences...");
  await prisma.exampleSentence.deleteMany({});
  
  console.log("Deleting existing vocabularies...");
  await prisma.vocabulary.deleteMany({});

  // 2. Read JSON file
  const jsonPath = path.join(__dirname, 'public', 'data', 'japanese', 'vocabulary.json');
  console.log(`Reading data from ${jsonPath}...`);
  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const vocabularies = JSON.parse(fileData);

  console.log(`Found ${vocabularies.length} vocabularies in JSON. Preparing to insert...`);

  // 3. Insert in batches to avoid overwhelming the database
  const batchSize = 100;
  let successCount = 0;

  for (let i = 0; i < vocabularies.length; i += batchSize) {
    const batch = vocabularies.slice(i, i + batchSize);
    
    // We can't use createMany with nested relations (examples) in Prisma for PostgreSQL/MySQL easily 
    // unless we separate them. So we use a transaction with individual creates or separate arrays.
    
    // Approach: Separate Vocabularies and Examples for batch insert
    const vocabData = [];
    const exampleData = [];

    for (const v of batch) {
      // Use provided ID or generate a fallback
      const vocabId = v.id || require('crypto').randomUUID();
      
      vocabData.push({
        id: vocabId,
        kanji: v.kanji || '',
        hiragana: v.hiragana || '',
        meaning: v.meaning || '',
        type: v.type || '',
        level: v.level || '',
        sourcePage: v.source_page || null,
      });

      if (v.examples && Array.isArray(v.examples)) {
        for (const ex of v.examples) {
          exampleData.push({
            vocabularyId: vocabId,
            ja: ex.ja || '',
            vi: ex.vi || ''
          });
        }
      }
    }

    // Insert Vocabularies
    await prisma.vocabulary.createMany({
      data: vocabData,
      skipDuplicates: true
    });

    // Insert Examples
    if (exampleData.length > 0) {
      await prisma.exampleSentence.createMany({
        data: exampleData,
        skipDuplicates: true
      });
    }

    successCount += batch.length;
    console.log(`Progress: ${successCount} / ${vocabularies.length} imported.`);
  }

  console.log("Import completed successfully!");
}

main()
  .catch(e => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
