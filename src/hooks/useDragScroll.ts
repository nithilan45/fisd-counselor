// src/hooks/useDragScroll.ts
import { useEffect, useRef } from "react";

type Options = {
  axis?: "x" | "y";
  momentum?: boolean; // keep smooth scrolling on touch/iOS
};

export function useDragScroll<T extends HTMLElement>(opts: Options = { axis: "x", momentum: true }) {
  const ref = useRef<T | null>(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only left mouse / primary pointer
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDown.current = true;
      isDragging.current = false;
      // capture so we keep events even if pointer leaves element
      el.setPointerCapture?.(e.pointerId);
      startX.current = e.clientX;
      startY.current = e.clientY;
      scrollLeft.current = el.scrollLeft;
      scrollTop.current = el.scrollTop;
      // visual feedback
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown.current) return;
      
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only start dragging if moved more than 5 pixels
      if (distance > 5) {
        isDragging.current = true;
        e.preventDefault();
        (document.body as any).style.userSelect = "none";
        if (opts.axis !== "y") el.scrollLeft = scrollLeft.current - dx;
        if (opts.axis !== "x") el.scrollTop  = scrollTop.current  - dy;
      }
    };

    const end = (e: PointerEvent | PointerEventInit) => {
      if (!isDown.current) return;
      isDown.current = false;
      el.releasePointerCapture?.((e as PointerEvent).pointerId ?? 0);
      el.style.cursor = "";
      (document.body as any).style.userSelect = "";
      isDragging.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", end as any);
    el.addEventListener("pointercancel", end as any);
    el.addEventListener("pointerleave", end as any);

    // wheel should still work naturally; no handler needed
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", end as any);
      el.removeEventListener("pointercancel", end as any);
      el.removeEventListener("pointerleave", end as any);
    };
  }, [opts.axis]);

  return ref;
}
