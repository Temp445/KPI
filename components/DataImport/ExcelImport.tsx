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
import { ManualEntryTable } from "./ManualEntryTable";
import PreviewTable from "./PreviewTable";

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
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<WeeklyData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duplicateDates, setDuplicateDates] = useState<string[] | null>(null);
  const [pendingUploadData, setPendingUploadData] = useState<
    WeeklyData[] | null
  >(null);

  const [isManual, setIsManual] = useState(false);

  const createEmptyRows = (count: number): WeeklyData[] =>
    Array.from({ length: count }, () => ({
      date: "",
      year: "",
      week: "",
    }));

  const [manualRows, setManualRows] = useState<WeeklyData[]>(
    createEmptyRows(10)
  );

  const [internalDuplicateList, setInternalDuplicateList] = useState<
    { date: string; rows: WeeklyData[] }[] | null
  >(null);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLoading(true);

    const result = await processExcelFile(selectedFile);

    if (result.success && result.data) {
      setPreviewData(result.data);
    } else {
      setError(result.error || "Failed to process file");
    }

    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  // Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/i)) {
      processFile(droppedFile);
    }
  };

  // Drag Over Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  //  Close Handler
  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setManualRows([
      {
        date: "",
        year: "",
        week: "",
      },
    ]);
    setDuplicateDates(null);
    setPendingUploadData(null);
    setInternalDuplicateList(null);
    onClose();
  };

  // Preview Cancel Handler
  const handlePreviewCancel = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setInternalDuplicateList(null);
  };

  // Excel Import Handler
  const handleImport = async () => {
    if (!previewData) return;
    setLoading(true);

    //Check duplicates inside Excel
    const internalDupes = findInternalDuplicates(previewData);

    if (internalDupes.length > 0) {
      setInternalDuplicateList(internalDupes);
      setLoading(false);
      return;
    }
    const result = await onImport(previewData);

    if (!result) {
      setLoading(false);
      return;
    }

    if (result.status === "duplicates") {
      setDuplicateDates(result.duplicates ?? null);
      setPendingUploadData(result.newData ?? null);
      setLoading(false);
      return;
    }

    if (result.status === "ok") {
      setLoading(false);
      handleClose();
    }
  };

  // Manual Import Handler
  const handleManualImport = async () => {
    const cleaned = manualRows.filter((r) => r.date.trim() !== "");
    if (cleaned.length === 0) {
      alert("Please enter at least one valid row");
      return;
    }

    setLoading(true);

    const result = await onImport(cleaned);

    if (!result) {
      setLoading(false);
      return;
    }

    if (result.status === "duplicates") {
      setDuplicateDates(result.duplicates ?? null);
      setPendingUploadData(result.newData ?? null);
      setLoading(false);
      return;
    }

    if (result.status === "ok") {
      setLoading(false);
      handleClose();
    }
  };

  // Helper to normalize date strings
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

  // Find internal duplicates in uploaded data
  function findInternalDuplicates(data: WeeklyData[]) {
    const map: Record<string, WeeklyData[]> = {};

    for (const row of data) {
      const dateKey = normalizeDate(row.date);
      if (!dateKey) continue;

      map[dateKey] ??= [];
      map[dateKey].push({
        ...row,
        date: dateKey,
      });
    }

    return Object.entries(map)
      .filter(([, rows]) => rows.length > 1)
      .map(([date, rows]) => ({ date, rows }));
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!loading && !open) handleClose();
      }}
    >
      <DialogContent className="max-w-6xl h-[85vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              {/* Spinner */}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />

              {/* Text */}
              <p className="text-sm font-medium text-slate-700">
                Importing data, please wait...
              </p>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Import Data for {kpiTitle}</DialogTitle>

          <div className="flex items-center justify-between pt-5">
            <div className="flex gap-2">
              <Button
                variant={isManual ? "outline" : "green"}
                size="sm"
                disabled={loading}
                onClick={() => {
                  setIsManual(false);
                  setFile(null);
                  setPreviewData(null);
                  setDuplicateDates(null);
                  setPendingUploadData(null);
                  setInternalDuplicateList(null);
                  setManualRows([
                    {
                      date: "",
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
                disabled={loading}
                onClick={() => {
                  setIsManual(true);
                  setFile(null);
                  setPreviewData(null);
                  setError(null);
                  setDuplicateDates(null);
                  setPendingUploadData(null);
                  setManualRows(createEmptyRows(10));
                  setInternalDuplicateList(null);
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
          {/* File Upload Section */}
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

          {/* Preview Table */}
          {file && !isManual && previewData && (
            <PreviewTable
              file={file}
              isManual={isManual}
              previewData={previewData}
              handlePreviewCancel={handlePreviewCancel}
            />
          )}

          {/* Handle Internal Duplicates in Excel  */}
          {internalDuplicateList && previewData && (
            <ExcelDuplicateCleaner
              duplicates={internalDuplicateList!}
              originalData={previewData!}
              onResolve={async (cleanedRows) => {
                setLoading(true);
                setInternalDuplicateList(null);
                setPreviewData(cleanedRows);
                const result = await onImport(cleanedRows);

                if (result?.status === "duplicates") {
                  setDuplicateDates(result.duplicates ?? null);
                  setPendingUploadData(result.newData ?? null);
                  setLoading(false);
                  return;
                }

                if (result?.status === "ok") {
                  setLoading(false);
                  handleClose();
                }
              }}
              onCancel={() => setInternalDuplicateList(null)}
            />
          )}

          {/* Manual Entry */}
          {isManual && (
            <ManualEntryTable rows={manualRows} setRows={setManualRows} />
          )}

          {/* Handle Duplicates with DB */}
          {duplicateDates && pendingUploadData && (
            <ExcelCompareWithDB
              duplicateDates={duplicateDates}
              pendingUploadData={pendingUploadData}
              existingData={existingData || []}
              onSubmitSelection={async (selectedDuplicates) => {
                setLoading(true);

                try {
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
                } catch (err) {
                  console.error("Replace duplicate failed", err);
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => {
                setDuplicateDates(null);
                setPendingUploadData(null);
              }}
            />
          )}
        </div>

        {!duplicateDates && !internalDuplicateList && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-2">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            {!isManual ? (
              <Button type="button" onClick={handleImport} disabled={!previewData || loading}>
                {loading ? (
                  <>
                    <span className="animate-pulse">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
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
