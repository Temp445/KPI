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
  const [progress, setProgress] = useState(0);
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
    value: 0,
    goal: 0,
    meetGoal: 0,
    behindGoal: 0,
    atRisk: 0,
    year: "",
    week: "",
  }));


  const [manualRows, setManualRows] = useState<WeeklyData[]>( createEmptyRows(10));

  const [internalDuplicateList, setInternalDuplicateList] = useState< { date: string; rows: WeeklyData[] }[] | null>(null);

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

  const handlePreviewCancel = () => {
  setFile(null);
  setPreviewData(null);
  setError(null);
  setProgress(0);
};

  // Excel Import Handler
  const handleImport = async () => {
    if (!previewData) return;
    //Check duplicates inside Excel
    const internalDupes = findInternalDuplicates(previewData);

    if (internalDupes.length > 0) {
      setInternalDuplicateList(internalDupes); 
      return;
    }
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

  // Manual Import Handler
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data for {kpiTitle}</DialogTitle>

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
                  setManualRows(createEmptyRows(10))
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
              setInternalDuplicateList(null);
              setPreviewData(cleanedRows);

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
        )}



          {/* Manual Entry */}
            {isManual && (
              <ManualEntryTable
                rows={manualRows}
                setRows={setManualRows}
              />
            )}


          {/* Handle Duplicates with DB */}
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
       
        </div>

        
        {!duplicateDates && (
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
