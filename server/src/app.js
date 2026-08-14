import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBoardRouter } from './routes/boardRoutes.js';
import { createTaskRouter } from './routes/taskRoutes.js';
import { NotFoundError, ValidationError } from './services/errors.js';

export function createApp({ boardService, taskService }) {
  const app = express();

  app.use(express.json());
  app.use('/api/boards', createBoardRouter(boardService));
  app.use('/api/tasks', createTaskRouter(taskService));
  app.use('/api', (request, response, next) => {
    next(new NotFoundError('Route not found.'));
  });

  const clientDist = join(dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  app.use(express.static(clientDist));

  app.use((request, response, next) => {
    if (request.method === 'GET') {
      response.sendFile(join(clientDist, 'index.html'));
    } else {
      next();
    }
  });
  app.use((error, request, response, next) => {
    if (error instanceof ValidationError || error.type === 'entity.parse.failed') {
      return response.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof ValidationError ? error.message : 'Request body must be valid JSON.',
        },
      });
    }

    if (error instanceof NotFoundError) {
      return response.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    return response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
  });

  return app;
}
