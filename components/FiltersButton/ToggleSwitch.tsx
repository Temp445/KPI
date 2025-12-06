"use client";

import { RotateCw,RefreshCwOff } from "lucide-react";

export default function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-6 bg-white items-center justify-center rounded-full transition-all duration-200`}
      role="switch"
      aria-checked={checked}
    >
       {checked ? (
          <RotateCw className="h-3.5 w-3.5 text-emerald-700" />
        ) : (
          <RefreshCwOff  className="h-3.5 w-3.5 text-gray-800" />
        )}
    </button>
  );
}