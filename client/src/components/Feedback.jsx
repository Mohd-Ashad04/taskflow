export function Feedback({ error, notice, onDismiss }) {
  const feedback = error ? { type: 'error', message: error } : notice;

  if (!feedback) {
    return null;
  }

  return (
    <div className={`feedback feedback--${feedback.type}`} role="status">
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">Dismiss</button>
    </div>
  );
}
