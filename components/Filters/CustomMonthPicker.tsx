"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface CustomMonthPickerProps {
  label?: string;
  selectedMonth: string;
  selectedYear: number;
  onChange: (month: string, year: number) => void;
  className?: string;
}

export default function CustomMonthPicker({
  label,
  selectedMonth,
  selectedYear,
  onChange,
  className = "",
}: CustomMonthPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className={`relative w-[160px] md:w-[180px] ${className}`}>
      {label && (
        <p className="text-xs mb-1 text-gray-600 dark:text-gray-300">{label}</p>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center border border-gray-300 dark:border-gray-700 
                   bg-white dark:bg-gray-900 p-2 rounded-md cursor-pointer"
      >
        <span className="text-sm">
          {selectedMonth} {selectedYear}
        </span>

        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 
                        border border-gray-200 dark:border-gray-700 
                        rounded-lg shadow-xl p-3">

          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={() => onChange(selectedMonth, selectedYear - 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className=" text-xs font-semibold">{selectedYear}</span>

            <button
              type="button"
              onClick={() => onChange(selectedMonth, selectedYear + 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => {
              const isSelected = m === selectedMonth;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onChange(m, selectedYear);
                    setOpen(false);
                  }}
                  className={`
                    text-xs p-2 rounded-md border transition
                    ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-gray-100"
                    }
                  `}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
