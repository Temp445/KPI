"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Download, X } from "lucide-react";
import { processExcelFile } from "@/utils/excelProcessor";
import { WeeklyData } from "@/types/dashboard";
import { ExcelCompareWithDB } from "./ExcelCompareWithDB";
import { ExcelDuplicateCleaner } from "./ExcelDuplicateCleaner";

interface ExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: WeeklyData[]) => Promise<{
    status: "ok" | "duplicates" | "error";
    duplicates?: string[];
    newData?: WeeklyData[];
    error?: any;
  }>;
  onReplaceDuplicates: (
    finalData: WeeklyData[],
    selectedDates: string[]
  ) => Promise<any>;
  kpiTitle: string;
  selectedKPIData?: { metricId: string };
  onDownload?: (metricId: string) => void;
  existingData?: WeeklyData[] | null;
}

export function ExcelImport({
  isOpen,
  onClose,
  onImport,
  onReplaceDuplicates,
  kpiTitle,
  selectedKPIData,
  onDownload,
  existingData,
}: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<WeeklyData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duplicateDates, setDuplicateDates] = useState<string[] | null>(null);
  const [pendingUploadData, setPendingUploadData] = useState<
    WeeklyData[] | null
  >(null);

  const [isManual, setIsManual] = useState(false);
  const [manualRows, setManualRows] = useState<WeeklyData[]>([
    {
      date: "",
      value: 0,
      goal: 0,
      meetGoal: 0,
      behindGoal: 0,
      atRisk: 0,
      year: "",
      week: "",
    },
  ]);

  const [internalDuplicateList, setInternalDuplicateList] = useState<
    { date: string; rows: WeeklyData[] }[] | null
  >(null);

  // --- Utility functions ---
  const updateRow = (index: number, field: keyof WeeklyData, value: any) => {
    const newRows = [...manualRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setManualRows(newRows);
  };

  const removeRow = (index: number) => {
    const newRows = manualRows.filter((_, i) => i !== index);
    setManualRows(
      newRows.length
        ? newRows
        : [
            {
              date: "",
              value: 0,
              goal: 0,
              meetGoal: 0,
              behindGoal: 0,
              atRisk: 0,
              year: "",
              week: "",
            },
          ]
    );
  };

  const addRow = () => {
    setManualRows([
      ...manualRows,
      {
        date: "",
        value: 0,
        goal: 0,
        meetGoal: 0,
        behindGoal: 0,
        atRisk: 0,
        year: "",
        week: "",
      },
    ]);
  };

  // --- File processing ---
  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLoading(true);
    setProgress(30);

    const result = await processExcelFile(selectedFile);
    setProgress(70);

    if (result.success && result.data) {
      setPreviewData(result.data);
      setProgress(100);
    } else {
      setError(result.error || "Failed to process file");
    }

    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/i)) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setProgress(0);
    setManualRows([
      {
        date: "",
        value: 0,
        goal: 0,
        meetGoal: 0,
        behindGoal: 0,
        atRisk: 0,
        year: "",
        week: "",
      },
    ]);
    setDuplicateDates(null);
    setPendingUploadData(null);
    onClose();
  };

  // --- Import functions ---
  const handleImport = async () => {
    if (!previewData) return;
    // 1️⃣ Check duplicates inside Excel
    const internalDupes = findInternalDuplicates(previewData);

    if (internalDupes.length > 0) {
      setInternalDuplicateList(internalDupes); // NEW STATE
      return;
    }

    // 2️⃣ No internal duplicates → continue with backend import
    const result = await onImport(previewData);

    if (!result) return;

    if (result.status === "duplicates") {
      setDuplicateDates(result.duplicates ?? null);
      setPendingUploadData(result.newData ?? null);
      return;
    }

    if (result.status === "ok") {
      handleClose();
    }
  };

  const handleManualImport = async () => {
    const cleaned = manualRows.filter((r) => r.date.trim() !== "");
    if (cleaned.length === 0) {
      alert("Please enter at least one valid row");
      return;
    }

    const result = await onImport(cleaned);
    if (!result) return;

    if (result.status === "duplicates") {
      setDuplicateDates(result.duplicates ?? null);
      setPendingUploadData(result.newData ?? null);
      return;
    }

    if (result.status === "ok") {
      handleClose();
    }
  };

  function normalizeDate(date: any): string {
    if (!date) return "";

    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }

    if (typeof date === "string") {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    }

    return "";
  }

  function findInternalDuplicates(data: WeeklyData[]) {
    const map: Record<string, WeeklyData[]> = {};

    for (const row of data) {
      const dateKey = normalizeDate(row.date);
      if (!dateKey) continue;

      map[dateKey] ??= [];
      map[dateKey].push({
        ...row,
        date: dateKey, // enforce normalized date
      });
    }

    return Object.entries(map)
      .filter(([, rows]) => rows.length > 1)
      .map(([date, rows]) => ({ date, rows }));
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data for {kpiTitle}</DialogTitle>

          {/* Toggle Upload / Manual */}
          <div className="flex items-center justify-between pt-5">
            <div className="flex gap-2">
              <Button
                variant={isManual ? "outline" : "green"}
                size="sm"
                onClick={() => {
                  setIsManual(false);
                  setFile(null);
                  setPreviewData(null);
                  setDuplicateDates(null);
                  setPendingUploadData(null);
                  setManualRows([
                    {
                      date: "",
                      value: 0,
                      goal: 0,
                      meetGoal: 0,
                      behindGoal: 0,
                      atRisk: 0,
                      year: "",
                      week: "",
                    },
                  ]);
                }}
              >
                Upload Excel
              </Button>
              <Button
                variant={isManual ? "green" : "outline"}
                size="sm"
                onClick={() => {
                  setIsManual(true);
                  setFile(null);
                  setPreviewData(null);
                  setError(null);
                  setDuplicateDates(null);
                  setPendingUploadData(null);
                }}
              >
                Manual Entry
              </Button>
            </div>
            {!isManual && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(selectedKPIData?.metricId!)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          {!file && !isManual && (
            <div
              className="border-2 border-dashed border-green-800 bg-green-50 dark:bg-slate-700 rounded-lg p-8 py-32 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-green-800" />
              <p className="text-sm mb-2">
                Drag and drop your Excel file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports .xlsx and .xls files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* File Preview */}
          {file && !isManual && previewData && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">
                Preview Data ({previewData.length} rows)
              </h4>
              <div className="border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Value</th>
                      <th className="px-3 py-2 text-right">Goal</th>
                      <th className="px-3 py-2 text-right">Meet Goal</th>
                      <th className="px-3 py-2 text-right">Behind Goal</th>
                      <th className="px-3 py-2 text-right">At Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{row.date || "-"}</td>
                        <td className="px-3 py-2 text-right">{row.value}</td>
                        <td className="px-3 py-2 text-right">
                          {row.goal ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.meetGoal ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.behindGoal ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.atRisk ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 10 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing first 10 of {previewData.length} rows
                </p>
              )}
            </div>
          )}

          {/* Manual Entry */}
          {isManual && (
            <div className="space-y-4">
              <div className="border rounded-md overflow-y-scroll max-h-[40vh]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 border-r text-center">Date</th>
                      <th className="px-3 py-2 border-r text-center">Value</th>
                      <th className="px-3 py-2 border-r text-center">Goal</th>
                      <th className="px-3 py-2 border-r text-center">Meet</th>
                      <th className="px-3 py-2 border-r text-center">Behind</th>
                      <th className="px-3 py-2 border-r text-center">
                        At Risk
                      </th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {manualRows.map((row, idx) => (
                      <tr key={idx}>
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
                                  field as any,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <button
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
              <Button onClick={addRow} variant="outline" className="w-full">
                + Add Row
              </Button>
            </div>
          )}

          {/* Duplicate Conflict Resolver */}
          {duplicateDates && pendingUploadData && (
            <ExcelCompareWithDB
              duplicateDates={duplicateDates || []}
              pendingUploadData={pendingUploadData || []}
              existingData={existingData || []}
              onSubmitSelection={async (selectedDuplicates) => {
                const nonDuplicateNewRows = (pendingUploadData || []).filter(
                  (d) =>
                    !(duplicateDates || []).includes(
                      new Date(d.date).toISOString().slice(0, 10)
                    )
                );
                const finalData = [
                  ...selectedDuplicates,
                  ...nonDuplicateNewRows,
                ];

                await onReplaceDuplicates(
                  finalData,
                  finalData.map((d) => d.date)
                );

                setDuplicateDates(null);
                setPendingUploadData(null);
                handleClose();
              }}
              onCancel={() => {
                setDuplicateDates(null);
                setPendingUploadData(null);
              }}
            />
          )}

          {/* Internal Duplicate Resolver */}
          <ExcelDuplicateCleaner
            duplicates={internalDuplicateList!}
            originalData={previewData!}
            onResolve={async (cleanedRows) => {
              setPreviewData(cleanedRows);
              setInternalDuplicateList(null);

              const result = await onImport(cleanedRows);

              if (result?.status === "duplicates") {
                setDuplicateDates(result.duplicates ?? null);
                setPendingUploadData(result.newData ?? null);
                return;
              }

              if (result?.status === "ok") {
                handleClose();
              }
            }}
            onCancel={() => setInternalDuplicateList(null)}
          />
        </div>

        {!duplicateDates && !internalDuplicateList && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {!isManual ? (
              <Button onClick={handleImport} disabled={!previewData || loading}>
                <Upload className="w-4 h-4 mr-2" /> Import Data
              </Button>
            ) : (
              <Button
                onClick={handleManualImport}
                disabled={manualRows.length === 0}
              >
                <Upload className="w-4 h-4 mr-2" /> Import Data
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
