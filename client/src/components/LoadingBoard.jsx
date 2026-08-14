export function LoadingBoard() {
  return (
    <main className="loading-board" aria-label="Loading board">
      <div className="skeleton skeleton--title" />
      <div className="skeleton-grid">
        {[0, 1, 2].map((index) => (
          <section className="skeleton-column" key={index}>
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </section>
        ))}
      </div>
    </main>
  );
}
