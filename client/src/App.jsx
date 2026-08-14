import { useState } from 'react';
import { BoardHeader } from './components/BoardHeader.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { Feedback } from './components/Feedback.jsx';
import { LoadingBoard } from './components/LoadingBoard.jsx';
import { TaskColumn } from './components/TaskColumn.jsx';
import { TaskFormDialog } from './components/TaskFormDialog.jsx';
import { useBoard } from './hooks/useBoard.js';
import './styles/taskflow.css';

function App() {
  const {
    board,
    priority,
    setPriority,
    loading,
    loadError,
    mutationError,
    notice,
    isMutating,
    retry,
    dismissFeedback,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    updateBoardName,
  } = useBoard();
  const [taskDialog, setTaskDialog] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  if (loading && !board) {
    return <LoadingBoard />;
  }

  if (loadError && !board) {
    return (
      <main className="error-state">
        <p className="eyebrow">Board unavailable</p>
        <h1>Unable to load TaskFlow</h1>
        <p>{loadError}</p>
        <button type="button" className="primary-button" onClick={retry}>Retry</button>
      </main>
    );
  }

  async function handleDelete() {
    const deleted = await deleteTask(taskToDelete.id);

    if (deleted) {
      setTaskToDelete(null);
    }
  }

  return (
    <main className="app-shell app-shell--ready">
      <BoardHeader
        board={board}
        priority={priority}
        onPriorityChange={setPriority}
        onRename={updateBoardName}
        onCreateTask={() => setTaskDialog({ mode: 'create' })}
        disabled={loading || isMutating}
      />
      <section className="board-grid" aria-label={`${board.name} task board`}>
        {board.columns.map((column, index) => (
          <TaskColumn
            key={column.id}
            column={column}
            columns={board.columns}
            onEdit={(task) => setTaskDialog({ mode: 'edit', task })}
            onDelete={setTaskToDelete}
            onMove={moveTask}
            disabled={isMutating}
            index={index}
          />
        ))}
      </section>
      {taskDialog && (
        <TaskFormDialog
          key={taskDialog.task?.id ?? taskDialog.mode}
          mode={taskDialog.mode}
          task={taskDialog.task}
          columns={board.columns}
          pending={isMutating}
          onClose={() => setTaskDialog(null)}
          onSubmit={(task) => (
            taskDialog.mode === 'edit'
              ? updateTask(taskDialog.task.id, task)
              : createTask(task)
          )}
        />
      )}
      {taskToDelete && (
        <ConfirmDialog
          task={taskToDelete}
          pending={isMutating}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
      <Feedback error={mutationError} notice={notice} onDismiss={dismissFeedback} />
    </main>
  );
}

export default App;