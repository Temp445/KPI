"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeeklyData } from "@/types/dashboard";

interface Props {
  duplicates: { date: string; rows: WeeklyData[] }[];
  originalData: WeeklyData[];
  onResolve: (rows: WeeklyData[]) => Promise<void> | void;
  onCancel: () => void;
}

export function ExcelDuplicateCleaner({
  duplicates,
  originalData,
  onResolve,
  onCancel,
}: Props) {

  // 🔐 RUNTIME SAFETY GUARD
  if (!duplicates || duplicates.length === 0) {
    return null;
  }

  const [resolvedIndex, setResolvedIndex] = useState<Record<string, number>>({});

  const normalizeDate = (date: string) =>
    new Date(date).toISOString().slice(0, 10);

  const handleSelect = (date: string, index: number) => {
    setResolvedIndex((prev) => ({
      ...prev,
      [normalizeDate(date)]: index,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(resolvedIndex).length !== duplicates.length) {
      alert("Please select one row for each duplicate date.");
      return;
    }

    const duplicateDateSet = new Set(
      duplicates.map((d) => normalizeDate(d.date))
    );

    const nonDuplicateRows = originalData.filter(
      (row) => !duplicateDateSet.has(normalizeDate(row.date))
    );

    const resolvedRows = duplicates.map((d) => {
      const key = normalizeDate(d.date);
      return d.rows[resolvedIndex[key]];
    });

    const finalRows = [...nonDuplicateRows, ...resolvedRows].sort(
      (a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date))
    );

    await onResolve(finalRows);
  };

  return (
    <div className="p-4 border rounded-md bg-yellow-50">
      <p className="text-sm font-semibold mb-3">
        Duplicate dates found. Select one row per date to continue.
      </p>

      {duplicates.map((d) => {
        const dateKey = normalizeDate(d.date);

        return (
          <div key={dateKey} className="mb-4">
            <p className="font-medium mb-2">{dateKey}</p>

            <table className="w-full text-xs border">
              <thead className="bg-gray-100">
                <tr>
                  <th>Select</th>
                  <th>Value</th>
                  <th>Goal</th>
                  <th>Meet</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="text-center">
                      <input
                        type="radio"
                        name={dateKey}
                        checked={resolvedIndex[dateKey] === idx}
                        onChange={() => handleSelect(d.date, idx)}
                      />
                    </td>
                    <td className="text-center">{row.value}</td>
                    <td className="text-center">{row.goal}</td>
                    <td className="text-center">{row.meetGoal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Continue & Import
        </Button>
      </div>
    </div>
  );
}
