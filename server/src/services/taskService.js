import { z } from 'zod';
import { NotFoundError, ValidationError } from './errors.js';

const prioritySchema = z.enum(['low', 'medium', 'high']);
const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: prioritySchema.optional(),
}).strict().refine((input) => Object.keys(input).length > 0);
const moveTaskSchema = z.object({
  columnId: z.number().int().positive(),
}).strict();

function parse(schema, value, message) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ValidationError(message);
  }

  return result.data;
}

export function createTaskService(boardRepository, taskRepository) {
  function requireTask(taskId) {
    const task = taskRepository.getTaskById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    return task;
  }

  return {
    updateTask(taskId, input) {
      const task = requireTask(taskId);
      const update = parse(updateTaskSchema, input, 'Task update data is invalid.');

      return taskRepository.updateTask(taskId, {
        title: update.title ?? task.title,
        description: update.description === undefined ? task.description : update.description,
        priority: update.priority ?? task.priority,
      });
    },

    moveTask(taskId, input) {
      const task = requireTask(taskId);
      const move = parse(moveTaskSchema, input, 'Move data is invalid.');
      const sourceColumn = boardRepository.getColumnById(task.columnId);
      const destinationColumn = boardRepository.getColumnById(move.columnId);

      if (!destinationColumn) {
        throw new NotFoundError('Column not found.');
      }

      if (sourceColumn.boardId !== destinationColumn.boardId) {
        throw new ValidationError('Destination column must belong to the same board as the task.');
      }

      return taskRepository.moveTask(taskId, move.columnId);
    },

    deleteTask(taskId) {
      requireTask(taskId);
      taskRepository.deleteTask(taskId);
    },
  };
}
