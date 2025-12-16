// Manual data entry table component for adding/editing weekly data rows

"use client";

import { Button } from "@/components/ui/button";
import { WeeklyData } from "@/types/dashboard";

interface ManualEntryTableProps {
  rows: WeeklyData[];
  setRows: React.Dispatch<React.SetStateAction<WeeklyData[]>>;
}

const emptyRow: WeeklyData = {
  date: "",
  year: "",
  week: "",
};

export function ManualEntryTable({ rows, setRows }: ManualEntryTableProps) {
  const updateRow = (
    index: number,
    field: keyof WeeklyData,
    value: any
  ) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);

  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated.length ? updated : [{ ...emptyRow }]);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-y-scroll max-h-[50vh]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              {[
                 "No",
                "Date",
                "Value",
                "Goal",
                "Meet",
                "Behind",
                "At Risk",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 border-r text-center font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx}>
                  <td className="border-r p-2 text-center font-medium"> {idx + 1}</td>
                <td className="border-r p-0">
                  <input
                    type="date"
                    className="w-full p-2 text-center focus:outline-none"
                    value={row.date}
                    onChange={(e) =>
                      updateRow(idx, "date", e.target.value)
                    }
                  />
                </td>

                {[
                  "value",
                  "goal",
                  "meetGoal",
                  "behindGoal",
                  "atRisk",
                ].map((field) => (
                  <td key={field} className="border-r p-0">
                    <input
                      type="number"
                      className="w-full p-2 text-center focus:outline-none no-spinner"
                      value={(row as any)[field]}
                      onChange={(e) =>
                        updateRow(
                          idx,
                          field as keyof WeeklyData,
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                ))}

                <td className="p-2 text-center">
                  <button
                    type="button"
                    className="text-red-500 text-xs hover:underline"
                    onClick={() => removeRow(idx)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" onClick={addRow} variant="outline" className="w-full">
        + Add Row
      </Button>
    </div>
  );
}
