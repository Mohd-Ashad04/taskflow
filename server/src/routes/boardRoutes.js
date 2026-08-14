import { Router } from 'express';
import { ValidationError } from '../services/errors.js';

function parseId(value, resourceName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError(`${resourceName} ID must be a positive integer.`);
  }

  return id;
}

export function createBoardRouter(boardService) {
  const router = Router();

  router.get('/:boardId/tasks', (request, response) => {
    const boardId = parseId(request.params.boardId, 'Board');
    const tasks = boardService.getTasksByPriority(boardId, request.query.priority);

    response.json({ tasks });
  });

  router.post('/:boardId/tasks', (request, response) => {
    const boardId = parseId(request.params.boardId, 'Board');
    const task = boardService.createTask(boardId, request.body);

    response.status(201).json({ task });
  });

  router.get('/:boardId', (request, response) => {
    const boardId = parseId(request.params.boardId, 'Board');

    response.json({ board: boardService.getBoard(boardId) });
  });

  router.patch('/:boardId', (request, response) => {
    const boardId = parseId(request.params.boardId, 'Board');
    const board = boardService.updateBoard(boardId, request.body);

    response.json({ board });
  });

  return router;
}
