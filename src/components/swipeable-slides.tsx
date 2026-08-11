import { useState, useRef, type ReactNode } from "react";

import { cn } from "#/lib/utils";

const THRESHOLD = 80;

type SwipeableSlidesProps = {
  index: number;
  onIndexChange: (index: number) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode[];
};

export function SwipeableSlides({
  index,
  onIndexChange,
  disabled,
  className,
  children,
}: SwipeableSlidesProps) {
  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const dragging = useRef(false);
  const dragged = useRef(false);
  const startX = useRef(0);
  const width = useRef(0);
  const lastMove = useRef({ t: 0, x: 0 });

  const count = children.length;

  if (disabled) {
    return <div className={className}>{children[index] ?? null}</div>;
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    dragging.current = true;
    dragged.current = false;
    startX.current = e.clientX;
    width.current = e.currentTarget.getBoundingClientRect().width;
    setSnapping(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const raw = e.clientX - startX.current;
    if (Math.abs(raw) > 5) dragged.current = true;
    lastMove.current = { t: performance.now(), x: e.clientX };
    const min = -(count - 1 - index) * width.current;
    const max = index * width.current;
    setDx(Math.max(min, Math.min(max, raw)));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    const dt = performance.now() - lastMove.current.t;
    const speed = dt > 0 ? (e.clientX - lastMove.current.x) / dt : 0;
    let target = index;
    if (dx < -THRESHOLD || (dt < 150 && speed < -0.6)) target = Math.min(index + 1, count - 1);
    else if (dx > THRESHOLD || (dt < 150 && speed > 0.6)) target = Math.max(index - 1, 0);
    if (target !== index) onIndexChange(target);
    setSnapping(true);
    requestAnimationFrame(() => {
      setDx(0);
      setSnapping(false);
    });
  }

  function onPointerCancel() {
    dragging.current = false;
    setSnapping(true);
    requestAnimationFrame(() => {
      setDx(0);
      setSnapping(false);
    });
  }

  return (
    <div
      className={cn(
        "grid overflow-hidden",
        snapping && "transition-transform duration-300 ease-out",
        className,
      )}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children.map((child, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          inert={i !== index}
          className="col-start-1 row-start-1 w-full"
          style={{ transform: `translateX(calc(${(i - index) * 100}% + ${dx}px))` }}
          onClickCapture={(e) => {
            if (dragged.current) e.stopPropagation();
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
