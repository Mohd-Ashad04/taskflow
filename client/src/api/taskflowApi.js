const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.error?.message ?? 'Unable to complete the request.', response.status);
  }

  return body;
}

export function getBoard(boardId) {
  return request(`/boards/${boardId}`);
}

export function updateBoard(boardId, data) {
  return request(`/boards/${boardId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getTasksByPriority(boardId, priority) {
  return request(`/boards/${boardId}/tasks?priority=${encodeURIComponent(priority)}`);
}

export function createTask(boardId, task) {
  return request(`/boards/${boardId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateTask(taskId, task) {
  return request(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(task),
  });
}

export function moveTask(taskId, columnId) {
  return request(`/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ columnId }),
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, { method: 'DELETE' });
}
