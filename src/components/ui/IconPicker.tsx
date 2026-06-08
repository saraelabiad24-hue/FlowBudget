"use client";

import { useState, useRef, useEffect } from "react";
import { getIconsByType } from "@/data/categoryPresets";
import type { IconGroup } from "@/data/categoryPresets";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  type: "income" | "expense";
}

export default function IconPicker({ value, onChange, type }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const groups: IconGroup[] = getIconsByType(type);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        {value ? (
          <span className="text-xl leading-none">{value}</span>
        ) : (
          <span className="text-gray-400">Select icon</span>
        )}
        <svg
          className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 max-h-72 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{group.label}</p>
              <div className="flex flex-wrap gap-1">
                {group.icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { onChange(icon); setOpen(false); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition
                      ${value === icon ? "bg-blue-100 ring-2 ring-blue-500" : "hover:bg-gray-100"}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
