import { useState } from 'react';

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskFormDialog({ mode, task, columns, onClose, onSubmit, pending }) {
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'medium');
  const [columnId, setColumnId] = useState(String(task?.columnId ?? columns[0]?.id ?? ''));
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError('A task title is required.');
      return;
    }

    const payload = { title: title.trim(), description: description || null, priority };
    const saved = await onSubmit(isEdit ? payload : { ...payload, columnId: Number(columnId) });

    if (saved) {
      onClose();
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <header className="dialog__header">
          <div>
            <p className="eyebrow">{isEdit ? 'Update task' : 'New task'}</p>
            <h2 id="task-dialog-title">{isEdit ? 'Edit task' : 'Create task'}</h2>
          </div>
        </header>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={pending} autoFocus />
          </label>
          <label>
            Description <span className="optional">Optional</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} disabled={pending} rows="4" />
          </label>
          <div className="form-row">
            <label>
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value)} disabled={pending}>
                {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            {!isEdit && (
              <label>
                Column
                <select value={columnId} onChange={(event) => setColumnId(event.target.value)} disabled={pending}>
                  {columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
                </select>
              </label>
            )}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="dialog__actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={pending}>Cancel</button>
            <button type="submit" className="primary-button" disabled={pending}>{pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}