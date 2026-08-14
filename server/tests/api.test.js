import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import { createBoardRepository } from '../src/repositories/boardRepository.js';
import { createTaskRepository } from '../src/repositories/taskRepository.js';
import { createBoardService } from '../src/services/boardService.js';
import { createTaskService } from '../src/services/taskService.js';

function createTestApp() {
  const database = createDatabase();
  seedDatabase(database);
  const boardRepository = createBoardRepository(database);
  const taskRepository = createTaskRepository(database);
  const boardService = createBoardService(boardRepository, taskRepository);
  const taskService = createTaskService(boardRepository, taskRepository);

  return {
    database,
    taskRepository,
    app: createApp({ boardService, taskService }),
  };
}

test('rejects task creation without a title', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .post('/api/boards/1/tasks')
    .send({ columnId: 1, priority: 'high' });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: { code: 'VALIDATION_ERROR', message: 'Task data is invalid.' },
  });
});

test('rejects task creation with a whitespace-only title', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .post('/api/boards/1/tasks')
    .send({ columnId: 1, title: '   ' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('moves a task to another column on its board', async (t) => {
  const { app, database, taskRepository } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .patch('/api/tasks/1/move')
    .send({ columnId: 2 });

  assert.equal(response.status, 200);
  assert.equal(response.body.task.columnId, 2);
  assert.equal(taskRepository.getTaskById(1).columnId, 2);
});

test('rejects moving a task to a column on another board', async (t) => {
  const { app, database, taskRepository } = createTestApp();
  t.after(() => database.close());
  const otherBoardId = database.prepare('INSERT INTO boards (name) VALUES (?)').run('Other board').lastInsertRowid;
  const otherColumnId = database.prepare('INSERT INTO columns (board_id, name) VALUES (?, ?)').run(otherBoardId, 'To Do').lastInsertRowid;

  const response = await request(app)
    .patch('/api/tasks/1/move')
    .send({ columnId: Number(otherColumnId) });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(taskRepository.getTaskById(1).columnId, 1);
});

test('returns 404 for a nonexistent task', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .patch('/api/tasks/999')
    .send({ title: 'Updated title' });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    error: { code: 'NOT_FOUND', message: 'Task not found.' },
  });
});

test('filters board tasks by priority through the database query', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app).get('/api/boards/1/tasks?priority=high');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.tasks.map((task) => task.title), [
    'Finalize landing page copy',
    'Prepare launch checklist',
    'Create launch timeline',
  ]);
  assert.ok(response.body.tasks.every((task) => task.priority === 'high'));
});

test('creates, edits, and deletes a task', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const created = await request(app)
    .post('/api/boards/1/tasks')
    .send({
      columnId: 1,
      title: 'Schedule accessibility review',
      description: 'Book a review before launch.',
      priority: 'medium',
    });
  assert.equal(created.status, 201);

  const updated = await request(app)
    .patch(`/api/tasks/${created.body.task.id}`)
    .send({ title: 'Schedule final accessibility review', priority: 'high' });
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body.task, {
    ...created.body.task,
    title: 'Schedule final accessibility review',
    priority: 'high',
  });

  const deleted = await request(app).delete(`/api/tasks/${created.body.task.id}`);
  assert.equal(deleted.status, 204);

  const board = await request(app).get('/api/boards/1');
  assert.equal(board.status, 200);
  assert.equal(board.body.board.columns.flatMap((column) => column.tasks).some((task) => task.id === created.body.task.id), false);
});

test('renames a board and returns the updated board', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .patch('/api/boards/1')
    .send({ name: '   New Workspace   ' });

  assert.equal(response.status, 200);
  assert.equal(response.body.board.name, 'New Workspace');

  const fetchResponse = await request(app).get('/api/boards/1');
  assert.equal(fetchResponse.body.board.name, 'New Workspace');
});

test('rejects board rename without a name', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app).patch('/api/boards/1').send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('rejects board rename with a whitespace-only name', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .patch('/api/boards/1')
    .send({ name: '   ' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('returns 404 when renaming a nonexistent board', async (t) => {
  const { app, database } = createTestApp();
  t.after(() => database.close());

  const response = await request(app)
    .patch('/api/boards/999')
    .send({ name: 'New Name' });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    error: { code: 'NOT_FOUND', message: 'Board not found.' },
  });
});
