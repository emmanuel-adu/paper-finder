export type OwlPose = "searching" | "shrug" | "happy" | "mark";

interface OwlMascotProps {
  pose: OwlPose;
  className?: string;
}

export function OwlMascot({ pose, className = "" }: OwlMascotProps) {
  const wrapperClass = pose === "searching" ? "animate-bounce" : "";

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${wrapperClass}`}
      aria-hidden="true"
    >
      <ellipse
        cx="50"
        cy="58"
        rx="34"
        ry="30"
        fill="var(--cream)"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <path d="M 24 34 L 18 14 L 36 28 Z" fill="var(--ink)" />
      <path d="M 76 34 L 82 14 L 64 28 Z" fill="var(--ink)" />

      {pose === "happy" ? (
        <>
          <path
            d="M 32 54 Q 38 46 44 54"
            stroke="var(--ink)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 56 54 Q 62 46 68 54"
            stroke="var(--ink)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : pose === "shrug" ? (
        <>
          <circle
            cx="38"
            cy="54"
            r="9"
            fill="white"
            stroke="var(--ink)"
            strokeWidth="3"
          />
          <circle
            cx="62"
            cy="54"
            r="9"
            fill="white"
            stroke="var(--ink)"
            strokeWidth="3"
          />
          <circle cx="38" cy="56" r="3" fill="var(--ink)" />
          <circle cx="62" cy="56" r="3" fill="var(--ink)" />
        </>
      ) : (
        <>
          <circle
            cx="38"
            cy="54"
            r="10"
            fill="white"
            stroke="var(--ink)"
            strokeWidth="3"
          />
          <circle
            cx="62"
            cy="54"
            r="10"
            fill="white"
            stroke="var(--ink)"
            strokeWidth="3"
          />
          <circle cx="40" cy="54" r="4" fill="var(--ink)" />
          <circle cx="64" cy="54" r="4" fill="var(--ink)" />
        </>
      )}

      <path
        d="M 46 64 L 54 64 L 50 72 Z"
        fill="var(--coral)"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {pose === "shrug" || pose === "happy" ? (
        <>
          <path
            d="M 16 56 Q 6 44 14 30"
            stroke="var(--ink)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 84 56 Q 94 44 86 30"
            stroke="var(--ink)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse cx="20" cy="62" rx="8" ry="14" fill="var(--ink)" opacity="0.15" />
          <ellipse cx="80" cy="62" rx="8" ry="14" fill="var(--ink)" opacity="0.15" />
        </>
      )}

      <path
        d="M 40 88 L 40 94 M 60 88 L 60 94"
        stroke="var(--navy)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {pose === "searching" && (
        <g transform="translate(70, 70) rotate(20)">
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="var(--navy)"
            strokeWidth="4"
          />
          <line
            x1="7"
            y1="7"
            x2="18"
            y2="18"
            stroke="var(--navy)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
