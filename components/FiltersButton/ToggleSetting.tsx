"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings,Plus, Minus   } from "lucide-react";

const ToggleSetting = ({
  onToggleOverflow,
  maxLength,
  setMaxLength,
  allowOverflow,
  kpiDataLength
}: {
  onToggleOverflow: () => void;
  maxLength: number;
  setMaxLength: React.Dispatch<React.SetStateAction<number>>;
  allowOverflow: boolean
  kpiDataLength: number
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div ref={menuRef} className="relative inline-block">
      <button
        className="p-2 text-gray-900 border bg-white dark:text-gray-200 dark:bg-black  rounded-sm transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-900 shadow-xl border border-gray-200 overflow-hidden z-20">
          <div className="border-b border-gray-100">
            <button
              onClick={onToggleOverflow}
              className="w-full px-4 py-3 text-left text-sm font-medium  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
            >
              <span>Change View</span>
              <span className="text-xs bg-blue-500 text-white  px-2.5 py-1 rounded-sm ">
                {allowOverflow ? "Fixed" : "Scroll"}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <div className="text-sm font-medium">
              Max Items
            </div>

            <div className="flex items-center  gap-3">
              <button
                onClick={() => setMaxLength((prev) => Math.max(1, prev - 1))}
                disabled={maxLength <= 1}
                className="p-0.5 border border-gray-600 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1">
                <div className="rounded-md text-center">
                  <span className="text-sm font-bold">
                    {maxLength}
                  </span>
                  
                </div>
              </div>

              <button
                onClick={() =>
                  setMaxLength((prev) => Math.min(kpiDataLength, prev + 1))
                }
                disabled={maxLength >= kpiDataLength}
                className="p-0.5 border border-gray-600 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

           
          </div>
        </div>
      )}
    </div>
  );
};

export default ToggleSetting;