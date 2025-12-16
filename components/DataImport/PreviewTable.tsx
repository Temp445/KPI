// Preview the uploaded Excel data 

"use client";

import * as React from "react";
import { X } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PreviewRow = {
  date?: string;
  value?: number;
  goal?: number;
  meetGoal?: number;
  behindGoal?: number;
  atRisk?: number;
};

type PreviewTableProps = {
  file: File | null;
  isManual: boolean;
  previewData: PreviewRow[];
  handlePreviewCancel: () => void;
};

const ITEMS_PER_PAGE = 10;

export default function PreviewTable({
  file,
  isManual,
  previewData,
  handlePreviewCancel,
}: PreviewTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  /* 🔹 Reset page when new data comes */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [previewData]);

  if (!file || isManual || !previewData?.length) return null;

  /* 🔹 Pagination calculations */
  const totalPages = Math.ceil(previewData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentRows = previewData.slice(startIndex, endIndex);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">
          Preview Data ({previewData.length} rows)
        </h4>

        <button onClick={handlePreviewCancel}>
          <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden  overflow-y-auto">
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
            {currentRows.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{row.date || "-"}</td>
                <td className="px-3 py-2 text-right">{row.value ?? "-"}</td>
                <td className="px-3 py-2 text-right">{row.goal ?? "-"}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-2">
          <PaginationContent>
            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(p - 1, 1));
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {/* Page numbers */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  );
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
