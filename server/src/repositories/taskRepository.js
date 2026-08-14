export function createTaskRepository(database) {
  const findTaskById = database.prepare(`
    SELECT
      id,
      column_id AS columnId,
      title,
      description,
      priority,
      created_at AS createdAt
    FROM tasks
    WHERE id = ?
  `);
  const countTasksByColumn = database.prepare(`
    SELECT
      columns.id AS columnId,
      columns.name AS columnName,
      COUNT(tasks.id) AS taskCount
    FROM columns
    LEFT JOIN tasks ON tasks.column_id = columns.id
    WHERE columns.board_id = ?
    GROUP BY columns.id, columns.name
    ORDER BY columns.id
  `);
  const tasksByBoardAndPriority = database.prepare(`
    SELECT
      tasks.id,
      tasks.column_id AS columnId,
      tasks.title,
      tasks.description,
      tasks.priority,
      tasks.created_at AS createdAt
    FROM tasks
    INNER JOIN columns ON columns.id = tasks.column_id
    WHERE columns.board_id = ? AND tasks.priority = ?
    ORDER BY tasks.created_at DESC, tasks.id DESC
  `);
  const insertTask = database.prepare(
    'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)',
  );
  const updateTaskById = database.prepare(
    'UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?',
  );
  const moveTaskById = database.prepare('UPDATE tasks SET column_id = ? WHERE id = ?');
  const deleteTaskById = database.prepare('DELETE FROM tasks WHERE id = ?');

  return {
    getTaskById(taskId) {
      return findTaskById.get(taskId);
    },

    getTaskCountsByColumn(boardId) {
      return countTasksByColumn.all(boardId);
    },

    getTasksByBoardAndPriority(boardId, priority) {
      return tasksByBoardAndPriority.all(boardId, priority);
    },

    createTask({ columnId, title, description, priority }) {
      const { lastInsertRowid } = insertTask.run(columnId, title, description, priority);

      return findTaskById.get(lastInsertRowid);
    },

    updateTask(taskId, { title, description, priority }) {
      updateTaskById.run(title, description, priority, taskId);

      return findTaskById.get(taskId);
    },

    moveTask(taskId, columnId) {
      moveTaskById.run(columnId, taskId);

      return findTaskById.get(taskId);
    },

    deleteTask(taskId) {
      deleteTaskById.run(taskId);
    },
  };
}