export function ConfirmDialog({ task, onCancel, onConfirm, pending }) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog dialog--compact" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <p className="eyebrow">Delete task</p>
        <h2 id="delete-dialog-title">Delete “{task.title}”?</h2>
        <p>This action cannot be undone.</p>
        <footer className="dialog__actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={pending}>Cancel</button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={pending}>{pending ? 'Deleting…' : 'Delete task'}</button>
        </footer>
      </section>
    </div>
  );
}
