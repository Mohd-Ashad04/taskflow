import assert from 'node:assert/strict';
import test from 'node:test';
import { createDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import { createTaskRepository } from '../src/repositories/taskRepository.js';

function createSeededRepository() {
  const database = createDatabase();
  seedDatabase(database);

  return { database, repository: createTaskRepository(database) };
}

test('gets task counts grouped by column for a board', (t) => {
  const { database, repository } = createSeededRepository();
  t.after(() => database.close());

  assert.deepEqual(repository.getTaskCountsByColumn(1), [
    { columnId: 1, columnName: 'To Do', taskCount: 3 },
    { columnId: 2, columnName: 'In Progress', taskCount: 3 },
    { columnId: 3, columnName: 'Done', taskCount: 2 },
  ]);
  assert.deepEqual(repository.getTaskCountsByColumn(999), []);
});

test('gets board tasks at a priority newest first', (t) => {
  const { database, repository } = createSeededRepository();
  t.after(() => database.close());

  assert.deepEqual(repository.getTasksByBoardAndPriority(1, 'high'), [
    {
      id: 4,
      columnId: 2,
      title: 'Finalize landing page copy',
      description: 'Review the headline, value proposition, and call to action.',
      priority: 'high',
      createdAt: '2026-08-04T08:45:00.000Z',
    },
    {
      id: 1,
      columnId: 1,
      title: 'Prepare launch checklist',
      description: 'List release tasks, owners, and target dates before launch week.',
      priority: 'high',
      createdAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 7,
      columnId: 3,
      title: 'Create launch timeline',
      description: 'Publish milestones from final QA through the post-launch review.',
      priority: 'high',
      createdAt: '2026-07-29T13:10:00.000Z',
    },
  ]);
  assert.deepEqual(repository.getTasksByBoardAndPriority(999, 'high'), []);
});