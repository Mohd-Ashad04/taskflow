import { useState, useRef, useEffect } from 'react';

const filters = [
  { value: 'all', label: 'All priorities' },
  { value: 'low', label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high', label: 'High priority' },
];

export function BoardHeader({ board, priority, onPriorityChange, onRename, onCreateTask, disabled }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(board.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditOpen = () => {
    setEditValue(board.name);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(board.name);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (editValue.trim() && editValue.trim() !== board.name) {
      const success = await onRename(editValue.trim());
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <header className="board-header">
      <div className="board-header__title">
        <p className="eyebrow">TaskFlow workspace</p>
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} className="board-name-form">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="board-name-input"
              aria-label="Board name"
            />
            <button type="submit" className="text-button" disabled={disabled || !editValue.trim()}>Save</button>
            <button type="button" className="text-button" onClick={handleEditCancel} disabled={disabled}>Cancel</button>
          </form>
        ) : (
          <div className="board-name-display">
            <h1>{board.name}</h1>
            <button type="button" className="text-button edit-board-btn" onClick={handleEditOpen} disabled={disabled} aria-label="Edit board name">
              Edit
            </button>
          </div>
        )}
      </div>
      <div className="board-actions">
        <label className="filter-control">
          <span>Show</span>
          <select value={priority} onChange={(event) => onPriorityChange(event.target.value)} disabled={disabled}>
            {filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
          </select>
        </label>
        <button type="button" className="primary-button" onClick={onCreateTask} disabled={disabled}>
          Create task
        </button>
      </div>
    </header>
  );
}
