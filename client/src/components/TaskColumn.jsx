import { useState } from 'react';
import { TaskCard } from './TaskCard.jsx';

export function TaskColumn({ column, columns, onEdit, onDelete, onMove, disabled, index }) {
  const [dragCounter, setDragCounter] = useState(0);
  const isDragOver = dragCounter > 0;

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragCounter((prev) => prev + 1);
    }
  };

  const handleDragLeave = () => {
    if (!disabled) {
      setDragCounter((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDragOver = (e) => {
    if (!disabled) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragCounter(0);
    if (disabled) return;

    try {
      const payload = e.dataTransfer.getData('application/json');
      if (payload) {
        const data = JSON.parse(payload);
        if (data && data.taskId && data.sourceColumnId !== column.id) {
          onMove(data.taskId, column.id);
        }
      }
    } catch {
      // Ignore parsing errors for unexpected drops
    }
  };

  return (
    <section
      className={`task-column ${isDragOver ? 'is-drag-over' : ''}`.trim()}
      style={{ '--column-index': index }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="task-column__header">
        <h2>{column.name}</h2>
        <span aria-label={`${column.tasks.length} tasks`}>{column.tasks.length}</span>
      </header>
      <div className="task-list">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
            disabled={disabled}
          />
        ))}
        {column.tasks.length === 0 && <p className="empty-column">No tasks here.</p>}
      </div>
    </section>
  );
}
