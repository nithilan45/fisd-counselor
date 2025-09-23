// src/components/HorizontalChips.tsx
import React from "react";
import { useDragScroll } from "../hooks/useDragScroll";

interface HorizontalChipsProps {
  items: string[];
  onItemClick: (item: string) => void;
}

export default function HorizontalChips({ items, onItemClick }: HorizontalChipsProps) {
  const ref = useDragScroll<HTMLDivElement>({ axis: "x" });

  return (
    <div className="relative w-full">
      <div
        ref={ref}
        className="
          chips-scroll flex gap-3 overflow-x-auto overflow-y-hidden px-3 py-2
          whitespace-nowrap scroll-smooth
        "
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          cursor: "grab", // shows hand before dragging
        }}
      >
        {items.map((t, i) => (
          <button
            key={i}
            onClick={() => onItemClick(t)}
            className="flex-none rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800 dark:text-white"
          >
            {t}
          </button>
        ))}
        {/* little spacer so last chip isn't flush */}
        <div className="flex-none w-6" />
      </div>

      {/* optional edge fades that DON'T block drag */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-800" />
    </div>
  );
}
