import type { CSSProperties } from "react";

const particles = Array.from({ length: 12 }, (_, index) => index);

export function Celebration() {
  return (
    <div className="celebration-confetti" aria-hidden="true">
      {particles.map((particle) => <i key={particle} style={{ "--particle": particle } as CSSProperties} />)}
    </div>
  );
}
