"use client";

import { WeeklyData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ExcelCompareWithDBProps {
  duplicateDates: string[];
  pendingUploadData: WeeklyData[];
  existingData: WeeklyData[];
  onSubmitSelection: (finalData: WeeklyData[]) => Promise<void>;
  onCancel: () => void;
}


export function ExcelCompareWithDB({
  duplicateDates,
  pendingUploadData,
  existingData,
  onSubmitSelection,
  onCancel,
}: ExcelCompareWithDBProps) {
  // Start with empty selection
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Update selectedDates when selectAll toggled
  useEffect(() => {
    if (selectAll) {
      setSelectedDates([...duplicateDates]);
    } else {
      setSelectedDates([]);
    }
  }, [selectAll, duplicateDates]);

  useEffect(() => {
  setSelectAll(selectedDates.length === duplicateDates.length);
}, [selectedDates, duplicateDates]);


  const toggleDateSelection = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleSubmit = async () => {
  const finalData = duplicateDates.map((date) => {
    if (selectedDates.includes(date)) {
      return pendingUploadData.find((d) => new Date(d.date).toISOString().slice(0, 10) === date);
    } else {
      return existingData.find((d) => new Date(d.date).toISOString().slice(0, 10) === date);
    }
  }).filter(Boolean) as WeeklyData[];

  await onSubmitSelection(finalData);
};

  return (
    <div>
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md mt-4">
      <h3 className="font-semibold text-sm mb-2">Duplicate Dates Found</h3>
      <p className="text-xs mb-2 border p-2 bg-yellow-100 w-fit">
   Note: Compare the old and new data. To update with new values, select the rows to replace; leave unchecked to keep the existing values.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
        {/* Existing Data */}
        <div>
          <h4 className="font-medium text-xs mb-1">Existing Data</h4>
          <div className="border rounded-md overflow-auto max-h-56">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-yellow-100 sticky top-0">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Value</th>
                  <th className="border px-2 py-1">Goal</th>
                  <th className="border px-2 py-1">Meet</th>
                  <th className="border px-2 py-1">Behind</th>
                  <th className="border px-2 py-1">At Risk</th>
                </tr>
              </thead>
              <tbody>
                {duplicateDates.map((date) => {
                  const oldRow = existingData.find(d => new Date(d.date).toISOString().slice(0,10) === date);
                  return (
                    <tr key={date} className="border-t">
                      <td className="border px-2 py-1">{date}</td>
                      <td className="border px-2 py-1">{oldRow?.value ?? "-"}</td>
                      <td className="border px-2 py-1">{oldRow?.goal ?? "-"}</td>
                      <td className="border px-2 py-1">{oldRow?.meetGoal ?? "-"}</td>
                      <td className="border px-2 py-1">{oldRow?.behindGoal ?? "-"}</td>
                      <td className="border px-2 py-1">{oldRow?.atRisk ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Data */}
        <div>
          <h4 className="font-medium text-xs mb-1 flex items-center justify-between">
            New Uploaded Data
          <label className="flex items-center gap-1 text-xs">
  <input
    type="checkbox"
    checked={selectAll}
    onChange={() => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      setSelectedDates(newSelectAll ? [...duplicateDates] : []);
    }}
  />
  Select All
</label>

          </h4>
          <div className="border rounded-md overflow-auto max-h-56">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-yellow-100 sticky top-0">
                <tr>
                  <th className="border px-2 py-1">Select</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Value</th>
                  <th className="border px-2 py-1">Goal</th>
                  <th className="border px-2 py-1">Meet</th>
                  <th className="border px-2 py-1">Behind</th>
                  <th className="border px-2 py-1">At Risk</th>
                </tr>
              </thead>
              <tbody>
                {duplicateDates.map((date) => {
                  const newRow = pendingUploadData.find(d => new Date(d.date).toISOString().slice(0,10) === date);
                  const isSelected = selectedDates.includes(date);
                  return (
                    <tr key={date} className="border-t">
                      <td className="border px-2 py-1 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleDateSelection(date)} />
                      </td>
                      <td className="border px-2 py-1">{date}</td>
                      <td className="border px-2 py-1">{newRow?.value ?? "-"}</td>
                      <td className="border px-2 py-1">{newRow?.goal ?? "-"}</td>
                      <td className="border px-2 py-1">{newRow?.meetGoal ?? "-"}</td>
                      <td className="border px-2 py-1">{newRow?.behindGoal ?? "-"}</td>
                      <td className="border px-2 py-1">{newRow?.atRisk ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

  
    </div>

        <div className="flex items-end justify-end gap-2 mt-5">
         <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      <Button onClick={handleSubmit}>
  {selectedDates.length === 0
    ? 'Keep Existing'
    : selectedDates.length === duplicateDates.length
      ? 'Replace All'
      : 'Replace Selected'} and import Data
</Button>

   
      </div>
    </div>
  );
}
