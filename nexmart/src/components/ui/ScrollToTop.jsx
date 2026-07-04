// Enhanced Back-to-Top button with SVG scroll-progress ring
export default function ScrollToTop({ progress = 0 }) {
  const visible = progress > 8;
  const r = 22;
  const circ = 2 * Math.PI * r; // ≈ 138.2
  const offset = circ - (progress / 100) * circ;

  return (
    <button
      className={`back-to-top-btn ${visible ? 'btt-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <svg className="btt-svg" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} />
        <circle cx="26" cy="26" r={r} className="btt-prog"
          style={{ strokeDashoffset: offset }} />
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
      </svg>
    </button>
  );
}
