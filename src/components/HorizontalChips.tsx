// src/components/HorizontalChips.tsx
import React, { useRef, useState } from "react";

interface HorizontalChipsProps {
  items: string[];
  onItemClick: (item: string) => void;
}

export default function HorizontalChips({ items, onItemClick }: HorizontalChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="
          chips-scroll flex gap-3 overflow-x-auto overflow-y-hidden px-3 py-2
          whitespace-nowrap scroll-smooth
        "
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((t, i) => (
          <button
            key={i}
            onClick={(e) => {
              // Only prevent click if we were actually dragging
              if (isDragging) {
                e.preventDefault();
                return;
              }
              onItemClick(t);
            }}
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
