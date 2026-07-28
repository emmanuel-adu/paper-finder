"use client";

import { useEffect, useRef, useState } from "react";

export type OwlPose = "searching" | "shrug" | "happy" | "mark";

interface OwlMascotProps {
  pose: OwlPose;
  className?: string;
  /** Eyes subtly track the cursor. Only sensible for poses with round pupils. */
  interactive?: boolean;
}

const MAX_PUPIL_OFFSET = 2.5;

export function OwlMascot({
  pose,
  className = "",
  interactive = false,
}: OwlMascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    let rafId: number | null = null;
    let latestEvent: MouseEvent | null = null;

    function applyLatestPosition() {
      rafId = null;
      const svg = svgRef.current;
      if (!latestEvent || !svg) return;

      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = latestEvent.clientX - centerX;
      const dy = latestEvent.clientY - centerY;
      const distance = Math.hypot(dx, dy) || 1;

      setPupilOffset({
        x: (dx / distance) * MAX_PUPIL_OFFSET,
        y: (dy / distance) * MAX_PUPIL_OFFSET,
      });
    }

    function handleMouseMove(e: MouseEvent) {
      latestEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(applyLatestPosition);
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [interactive]);

  const wrapperClass = pose === "searching" ? "animate-bounce" : "";
  const dx = interactive ? pupilOffset.x : 0;
  const dy = interactive ? pupilOffset.y : 0;

  return (
    <svg
      ref={svgRef}
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
          <circle cx={38 + dx} cy={56 + dy} r="3" fill="var(--ink)" />
          <circle cx={62 + dx} cy={56 + dy} r="3" fill="var(--ink)" />
        </>
      ) : (
        <>
          <g
            className={interactive ? "owl-blink" : ""}
            style={interactive ? { transformOrigin: "38px 54px" } : undefined}
          >
            <circle
              cx="38"
              cy="54"
              r="10"
              fill="white"
              stroke="var(--ink)"
              strokeWidth="3"
            />
            <circle cx={40 + dx} cy={54 + dy} r="4" fill="var(--ink)" />
          </g>
          <g
            className={interactive ? "owl-blink" : ""}
            style={interactive ? { transformOrigin: "62px 54px" } : undefined}
          >
            <circle
              cx="62"
              cy="54"
              r="10"
              fill="white"
              stroke="var(--ink)"
              strokeWidth="3"
            />
            <circle cx={64 + dx} cy={54 + dy} r="4" fill="var(--ink)" />
          </g>
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
