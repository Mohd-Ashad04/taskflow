import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  getBoard,
  getTasksByPriority,
  moveTask as moveTaskRequest,
  updateTask as updateTaskRequest,
  updateBoard as updateBoardRequest,
} from '../api/taskflowApi.js';

const boardId = 1;

function messageFrom(error) {
  return error instanceof Error ? error.message : 'Unable to complete the request.';
}

export function useBoard() {
  const [board, setBoard] = useState(null);
  const [priority, setPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [notice, setNotice] = useState(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const boardRef = useRef(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const fetchBoard = useCallback(async (selectedPriority) => {
    const { board: currentBoard } = await getBoard(boardId);

    if (selectedPriority === 'all') {
      return currentBoard;
    }

    const { tasks } = await getTasksByPriority(boardId, selectedPriority);
    const visibleTaskIds = new Set(tasks.map((task) => task.id));

    return {
      ...currentBoard,
      columns: currentBoard.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => visibleTaskIds.has(task.id)),
      })),
    };
  }, []);

  const refresh = useCallback(async (selectedPriority) => {
    const nextBoard = await fetchBoard(selectedPriority);
    setBoard(nextBoard);
    setLoadError('');
  }, [fetchBoard]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextBoard = await fetchBoard(priority);

        if (!cancelled) {
          setBoard(nextBoard);
          setLoadError('');
        }
      } catch (error) {
        if (!cancelled) {
          const message = messageFrom(error);

          if (!boardRef.current) {
            setLoadError(message);
          } else {
            setMutationError(`Unable to load the latest board: ${message}`);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchBoard, priority, reloadKey]);

  const changePriority = useCallback((nextPriority) => {
    setPriority(nextPriority);
    setLoading(true);
    setLoadError('');
  }, []);

  const performMutation = useCallback(async (operation, successMessage) => {
    setMutationError('');
    setNotice(null);
    setIsMutating(true);

    try {
      await operation();
    } catch (error) {
      setMutationError(messageFrom(error));
      setIsMutating(false);
      return false;
    }

    try {
      await refresh(priority);
      setNotice({ type: 'success', message: successMessage });
      setIsMutating(false);
      return true;
    } catch (error) {
      setMutationError(`The change was saved, but the board could not be refreshed: ${messageFrom(error)}`);
      setIsMutating(false);
      return false;
    }
  }, [priority, refresh]);

  return {
    board,
    priority,
    setPriority: changePriority,
    loading,
    loadError,
    mutationError,
    notice,
    isMutating,
    retry: () => {
      setLoading(true);
      setLoadError('');
      setReloadKey((value) => value + 1);
    },
    dismissFeedback: () => {
      setMutationError('');
      setNotice(null);
    },
    createTask: (task) => performMutation(() => createTaskRequest(boardId, task), 'Task created.'),
    updateTask: (taskId, task) => performMutation(() => updateTaskRequest(taskId, task), 'Task updated.'),
    moveTask: (taskId, columnId) => performMutation(() => moveTaskRequest(taskId, columnId), 'Task moved.'),
    deleteTask: (taskId) => performMutation(() => deleteTaskRequest(taskId), 'Task deleted.'),
    updateBoardName: (name) => performMutation(() => updateBoardRequest(boardId, { name }), 'Board renamed.'),
  };
}