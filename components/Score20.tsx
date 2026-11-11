/* Note sur 20 entourée à la main (ellipse olive). */
export default function Score20({ value, size = 'big' }: { value: string; size?: 'big' | 'small' }) {
  return <span className={`bv-score bv-score-${size}`}>
    <svg viewBox="0 0 220 120" aria-hidden="true"><path d="M112 8c58-2 102 20 100 52s-50 54-106 52S6 92 8 58 58 10 128 9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>
    <b>{value}</b><small>/20</small>
  </span>;
}
