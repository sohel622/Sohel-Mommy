/**
 * Facebook-style curved share arrow. Uses `currentColor` so it adapts to
 * light/dark mode and the always-white Reels overlay automatically.
 */
export function ShareArrowIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 18c0-6.075 4.925-11 11-11h1" />
      <path d="M13.5 2.5 20 7l-6.5 4.5" />
    </svg>
  );
}
