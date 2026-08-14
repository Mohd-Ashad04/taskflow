import { useState } from 'react';

const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function TaskCard({ task, columns, onEdit, onDelete, onMove, disabled }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event) => {
    setIsDragging(true);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id, sourceColumnId: task.columnId }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <article
      className={`task-card ${isDragging ? 'is-dragging' : ''}`.trim()}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-card__meta">
        <span className={`priority-badge priority-badge--${task.priority}`}>{priorityLabel[task.priority]}</span>
        <time dateTime={task.createdAt}>Created {formatCreatedAt(task.createdAt)}</time>
      </div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="task-card__actions">
        <label className="move-control">
          <span className="sr-only">Move {task.title}</span>
          <select
            defaultValue=""
            onChange={(event) => {
              const columnId = Number(event.target.value);

              if (columnId) {
                onMove(task.id, columnId);
                event.target.value = '';
              }
            }}
            disabled={disabled}
          >
            <option value="">Move to…</option>
            {columns.filter((column) => column.id !== task.columnId).map((column) => (
              <option key={column.id} value={column.id}>{column.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="text-button" onClick={() => onEdit(task)} disabled={disabled}>Edit</button>
        <button type="button" className="text-button text-button--danger" onClick={() => onDelete(task)} disabled={disabled}>Delete</button>
      </div>
    </article>
  );
}
