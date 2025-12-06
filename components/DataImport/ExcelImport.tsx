'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, Download, X } from 'lucide-react';
import { processExcelFile, exportToExcel, generateExcelTemplate } from '@/utils/excelProcessor';
import { WeeklyData } from '@/types/dashboard';

interface ExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: WeeklyData[]) => void;
  kpiTitle: string;
}

export function ExcelImport({ isOpen, onClose, onImport, kpiTitle }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<WeeklyData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

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
      setError(result.error || 'Failed to process file');
    }

    setLoading(false);
  };

  const handleImport = () => {
    if (previewData) {
      onImport(previewData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setProgress(0);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      setFile(droppedFile);
      setError(null);
      setLoading(true);
      setProgress(30);

      const result = await processExcelFile(droppedFile);
      setProgress(70);

      if (result.success && result.data) {
        setPreviewData(result.data);
        setProgress(100);
      } else {
        setError(result.error || 'Failed to process file');
      }

      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data for {kpiTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={generateExcelTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
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

          {file && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <span className="text-sm flex-1">{file.name}</span>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewData(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">Processing file...</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {previewData && previewData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Preview Data ({previewData.length} rows)</h4>
              <div className="border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Week</th>
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
                        <td className="px-3 py-2">{row.week}</td>
                        <td className="px-3 py-2 text-right">{row.value}</td>
                        <td className="px-3 py-2 text-right">{row.goal || '-'}</td>
                        <td className="px-3 py-2 text-right">{row.meetGoal || '-'}</td>
                        <td className="px-3 py-2 text-right">{row.behindGoal || '-'}</td>
                        <td className="px-3 py-2 text-right">{row.atRisk || '-'}</td>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!previewData || loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
