import { fileURLToPath } from 'node:url';
import { createDatabase, defaultDatabasePath } from './database.js';

const seedBoard = {
  name: 'TaskFlow Board',
  columns: [
    {
      name: 'To Do',
      tasks: [
        {
          title: 'Prepare launch checklist',
          description: 'List release tasks, owners, and target dates before launch week.',
          priority: 'high',
          createdAt: '2026-08-01T09:00:00.000Z',
        },
        {
          title: 'Write FAQ content',
          description: 'Answer common questions about pricing, support, and account setup.',
          priority: 'medium',
          createdAt: '2026-08-02T10:15:00.000Z',
        },
        {
          title: 'Collect customer testimonials',
          description: 'Request approval for three short quotes from pilot customers.',
          priority: 'low',
          createdAt: '2026-08-03T14:30:00.000Z',
        },
      ],
    },
    {
      name: 'In Progress',
      tasks: [
        {
          title: 'Finalize landing page copy',
          description: 'Review the headline, value proposition, and call to action.',
          priority: 'high',
          createdAt: '2026-08-04T08:45:00.000Z',
        },
        {
          title: 'Set up analytics dashboard',
          description: 'Track sign-ups, activation, and the main acquisition channels.',
          priority: 'medium',
          createdAt: '2026-08-05T11:20:00.000Z',
        },
        {
          title: 'Review onboarding emails',
          description: 'Check links, tone, and send timing across the welcome sequence.',
          priority: 'low',
          createdAt: '2026-08-06T15:00:00.000Z',
        },
      ],
    },
    {
      name: 'Done',
      tasks: [
        {
          title: 'Create launch timeline',
          description: 'Publish milestones from final QA through the post-launch review.',
          priority: 'high',
          createdAt: '2026-07-29T13:10:00.000Z',
        },
        {
          title: 'Confirm support coverage',
          description: 'Coordinate launch-day support shifts with the customer team.',
          priority: 'medium',
          createdAt: '2026-07-30T16:40:00.000Z',
        },
      ],
    },
  ],
};

function ensureEmptyDatabase(database) {
  for (const table of ['boards', 'columns', 'tasks']) {
    const rowCount = database.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get();

    if (rowCount !== 0) {
      throw new Error(`Cannot seed database: ${table} already contains data.`);
    }
  }
}

export function seedDatabase(database) {
  ensureEmptyDatabase(database);

  const insertBoard = database.prepare('INSERT INTO boards (name) VALUES (?)');
  const insertColumn = database.prepare('INSERT INTO columns (board_id, name) VALUES (?, ?)');
  const insertTask = database.prepare(
    `INSERT INTO tasks (column_id, title, description, priority, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  );

  database.transaction(() => {
    const boardId = insertBoard.run(seedBoard.name).lastInsertRowid;

    for (const column of seedBoard.columns) {
      const columnId = insertColumn.run(boardId, column.name).lastInsertRowid;

      for (const task of column.tasks) {
        insertTask.run(columnId, task.title, task.description, task.priority, task.createdAt);
      }
    }
  })();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const database = createDatabase(defaultDatabasePath);

  try {
    seedDatabase(database);

    const boards = database.prepare('SELECT COUNT(*) AS count FROM boards').get().count;
    const columns = database.prepare('SELECT COUNT(*) AS count FROM columns').get().count;
    const tasks = database.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

    console.log(`Seeded successfully: ${boards} board(s), ${columns} column(s), ${tasks} task(s).`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    database.close();
  }
}