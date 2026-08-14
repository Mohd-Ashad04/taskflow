import { createApp } from './app.js';
import { createDatabase, defaultDatabasePath } from './db/database.js';
import { createBoardRepository } from './repositories/boardRepository.js';
import { createTaskRepository } from './repositories/taskRepository.js';
import { createBoardService } from './services/boardService.js';
import { createTaskService } from './services/taskService.js';

const database = createDatabase(defaultDatabasePath);
const boardRepository = createBoardRepository(database);
const taskRepository = createTaskRepository(database);
const boardService = createBoardService(boardRepository, taskRepository);
const taskService = createTaskService(boardRepository, taskRepository);
const app = createApp({ boardService, taskService });
const port = Number(process.env.PORT) || 3000;

app.listen(port);