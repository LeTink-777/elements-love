"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown, RotateCw } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";

/**
 * Segment arcs are deliberately unequal: the "full" plan occupies 160 of the
 * 360 degrees, so a uniformly random stop lands on it noticeably more often.
 */
const SEGMENTS: { plan: PlanId; start: number; sweep: number; color: string }[] = [
  { plan: "basic", start: 0, sweep: 100, color: "var(--accent-water)" },
  { plan: "full", start: 100, sweep: 160, color: "var(--accent-fire)" },
  { plan: "premium", start: 260, sweep: 100, color: "var(--accent-air)" },
];

const CX = 100;
const CY = 100;
const R = 92;

function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}

function segmentPath(start: number, sweep: number) {
  const from = polar(start, R);
  const to = polar(start + sweep, R);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)} Z`;
}

function segmentAt(angle: number): PlanId {
  const normalized = ((angle % 360) + 360) % 360;
  for (const segment of SEGMENTS) {
    if (normalized >= segment.start && normalized < segment.start + segment.sweep) {
      return segment.plan;
    }
  }
  return "full";
}

export function ElementWheel({ onLanded }: { onLanded: (plan: PlanId) => void }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    // Uniform stop angle -> probability proportional to each segment's arc.
    const stop = Math.random() * 360;
    const landed = segmentAt(stop);
    // A point at wheel-local angle t sits under the pointer when rotation === -t.
    const delta = (((-stop - rotation) % 360) + 360) % 360;
    const next = rotation + 360 * 5 + delta;

    setRotation(next);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSpinning(false);
      setSpun(true);
      onLanded(landed);
    }, 4700);
  }, [onLanded, rotation, spinning]);

  return (
    <div>
      <div className="wheel-wrap">
        <ChevronDown size={32} className="wheel-pointer" aria-hidden="true" />
        <svg
          className="wheel"
          viewBox="0 0 200 200"
          style={{ transform: `rotate(${rotation}deg)` }}
          role="img"
          aria-label="Колесо стихий с тремя тарифами"
        >
          {SEGMENTS.map((segment) => {
            const plan = PLANS[segment.plan];
            const mid = segment.start + segment.sweep / 2;
            const label = polar(mid, 58);
            return (
              <g key={segment.plan}>
                <path
                  d={segmentPath(segment.start, segment.sweep)}
                  fill={segment.color}
                  fillOpacity={0.9}
                  stroke="var(--bg-primary)"
                  strokeWidth={2}
                />
                <text
                  x={label.x}
                  y={label.y - 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-head)"
                  transform={`rotate(${mid} ${label.x} ${label.y})`}
                >
                  {plan.title}
                </text>
                <text
                  x={label.x}
                  y={label.y + 10}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="var(--font-head)"
                  transform={`rotate(${mid} ${label.x} ${label.y})`}
                >
                  {plan.price} &#8381;
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={20} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={6} fill="var(--text-primary)" />
        </svg>
      </div>

      <button
        type="button"
        className="btn"
        style={{ marginTop: 22, maxWidth: 320, marginInline: "auto" }}
        onClick={spin}
        disabled={spinning}
      >
        <RotateCw size={18} aria-hidden="true" />
        {spinning ? "Колесо вращается..." : spun ? "Крутить ещё раз" : "Крутить колесо стихий"}
      </button>
    </div>
  );
}
