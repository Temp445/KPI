"use client";

import { SlidersHorizontal, GripVertical, GripHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ToggleMenu({
  setDirection,
  direction,
  setStartRing,
  startRing,
  setLength,
  length,
  showRange,
}: {
  setDirection: (dir: "clockwise" | "anticlockwise") => void;
  direction: "clockwise" | "anticlockwise";
  setStartRing: (ring: "outer" | "inner") => void;
  startRing: "outer" | "inner";
  setLength: (val: number) => void;
  length: 1 | 2 | 3;
  showRange: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pos]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded hover:bg-white/10"
      >
        <SlidersHorizontal className="h-5 w-4 text-white" />
      </button>

      {open && (
        <div
          ref={menuRef}
          onMouseDown={startDrag}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`,
          }}
          className="absolute right-0 w-40 rounded bg-white dark:bg-gray-900 shadow-lg border border-gray-100 py-0.5 hover:cursor-pointer active:cursor-move z-20"
        >
          <span className="flex justify-end px-2">
            <GripHorizontal className="w-4 h-3 text-gray-500 " />
          </span>

          {direction === "anticlockwise" ? (  <button
            onClick={() => setDirection("clockwise")}
            className="w-full px-4 py-0.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clockwise
          </button>) : (

          <button
            onClick={() => setDirection("anticlockwise")}
            className="w-full px-4 py-0.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Counter-Clockwise
          </button>
          )}

          {length > 1 && (
            <div>
              <div className="border-t my-1"></div>
            {startRing === "inner" ? (    <button
                onClick={() => setStartRing("outer")}
                className="w-full px-4 py-0.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Start at Outer Circle
              </button>
              ): (
                   <button
                onClick={() => setStartRing("inner")}
                className="w-full px-4 py-0.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Start at Inner Circle
              </button>
              )}
          
            </div>
          )}
          <div className="border-t my-1"></div>
{showRange && (
          <div className="px-4 py-1">
            <label className="text-xs block mb-1">
              Display Ratio 1:{length}
            </label>

            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value) as 1 | 2 | 3;
                setLength(val);

                if (val > 1) {
                  setStartRing("inner");
                }
              }}
              className="w-full h-1.5 bg-gray-200 rounded accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-between text-xs">
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
          </div>
)}
        </div>
      )}
    </div>
  );
}
