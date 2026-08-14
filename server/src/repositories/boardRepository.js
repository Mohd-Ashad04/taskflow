export function createBoardRepository(database) {
  const findBoardById = database.prepare('SELECT id, name FROM boards WHERE id = ?');
  const findColumnsByBoardId = database.prepare(
    'SELECT id, board_id AS boardId, name FROM columns WHERE board_id = ? ORDER BY id',
  );
  const findColumnById = database.prepare(
    'SELECT id, board_id AS boardId, name FROM columns WHERE id = ?',
  );
  const findTasksByBoardId = database.prepare(`
    SELECT
      tasks.id,
      tasks.column_id AS columnId,
      tasks.title,
      tasks.description,
      tasks.priority,
      tasks.created_at AS createdAt
    FROM tasks
    INNER JOIN columns ON columns.id = tasks.column_id
    WHERE columns.board_id = ?
    ORDER BY tasks.created_at DESC, tasks.id DESC
  `);
  const updateBoardById = database.prepare('UPDATE boards SET name = ? WHERE id = ?');

  return {
    getBoardById(boardId) {
      return findBoardById.get(boardId);
    },

    getColumnsByBoardId(boardId) {
      return findColumnsByBoardId.all(boardId);
    },

    getColumnById(columnId) {
      return findColumnById.get(columnId);
    },

    getTasksByBoardId(boardId) {
      return findTasksByBoardId.all(boardId);
    },

    updateBoard(boardId, name) {
      updateBoardById.run(name, boardId);
      return findBoardById.get(boardId);
    },
  };
}
