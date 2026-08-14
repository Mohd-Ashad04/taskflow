import { z } from 'zod';
import { NotFoundError, ValidationError } from './errors.js';

const prioritySchema = z.enum(['low', 'medium', 'high']);
const createTaskSchema = z.object({
  columnId: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  priority: prioritySchema.optional(),
}).strict();
const updateBoardSchema = z.object({
  name: z.string().trim().min(1),
}).strict();

function parse(schema, value, message) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ValidationError(message);
  }

  return result.data;
}

export function createBoardService(boardRepository, taskRepository) {
  function requireBoard(boardId) {
    const board = boardRepository.getBoardById(boardId);

    if (!board) {
      throw new NotFoundError('Board not found.');
    }

    return board;
  }

  return {
    getBoard(boardId) {
      const board = requireBoard(boardId);
      const columns = boardRepository.getColumnsByBoardId(boardId);
      const tasksByColumnId = new Map(columns.map((column) => [column.id, []]));

      for (const task of boardRepository.getTasksByBoardId(boardId)) {
        tasksByColumnId.get(task.columnId).push(task);
      }

      return {
        ...board,
        columns: columns.map((column) => ({
          ...column,
          tasks: tasksByColumnId.get(column.id),
        })),
      };
    },

    getTasksByPriority(boardId, priority) {
      requireBoard(boardId);
      const parsedPriority = parse(prioritySchema, priority, 'Priority must be low, medium, or high.');

      return taskRepository.getTasksByBoardAndPriority(boardId, parsedPriority);
    },

    createTask(boardId, input) {
      requireBoard(boardId);
      const task = parse(createTaskSchema, input, 'Task data is invalid.');
      const column = boardRepository.getColumnById(task.columnId);

      if (!column || column.boardId !== boardId) {
        throw new ValidationError('Column must belong to the board.');
      }

      return taskRepository.createTask({
        ...task,
        priority: task.priority ?? 'medium',
        description: task.description ?? null,
      });
    },

    updateBoard(boardId, input) {
      requireBoard(boardId);
      const data = parse(updateBoardSchema, input, 'Board data is invalid.');
      return boardRepository.updateBoard(boardId, data.name);
    },
  };
}
