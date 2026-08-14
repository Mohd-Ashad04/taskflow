import { Router } from 'express';
import { ValidationError } from '../services/errors.js';

function parseTaskId(value) {
  const taskId = Number(value);

  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    throw new ValidationError('Task ID must be a positive integer.');
  }

  return taskId;
}

export function createTaskRouter(taskService) {
  const router = Router();

  router.patch('/:taskId/move', (request, response) => {
    const task = taskService.moveTask(parseTaskId(request.params.taskId), request.body);

    response.json({ task });
  });

  router.patch('/:taskId', (request, response) => {
    const task = taskService.updateTask(parseTaskId(request.params.taskId), request.body);

    response.json({ task });
  });

  router.delete('/:taskId', (request, response) => {
    taskService.deleteTask(parseTaskId(request.params.taskId));

    response.status(204).end();
  });

  return router;
}
