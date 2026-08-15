import { Droplet, Flame, Mountain, Wind } from "lucide-react";
import type { ElementId } from "@/lib/elements";

const ICONS = {
  fire: Flame,
  water: Droplet,
  earth: Mountain,
  air: Wind,
} as const;

export function ElementIcon({ element, size }: { element: ElementId; size: number }) {
  const Icon = ICONS[element];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

export function ElementOrb({ element }: { element: ElementId }) {
  const Icon = ICONS[element];
  return (
    <div className={`orb orb--${element}`}>
      {element === "water" ? (
        <>
          <span className="ripple" />
          <span className="ripple2" />
        </>
      ) : null}
      <Icon strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}

export function OrbField() {
  return (
    <div className="orb-field" aria-hidden="true">
      <ElementOrb element="fire" />
      <ElementOrb element="water" />
      <ElementOrb element="earth" />
      <ElementOrb element="air" />
    </div>
  );
}
