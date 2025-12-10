import * as XLSX from 'xlsx';
import { WeeklyData } from '@/types/dashboard';

export interface ExcelImportResult {
  success: boolean;
  data?: WeeklyData[];
  error?: string;
}

/** Convert Excel serial date → YYYY-MM-DD */
function excelSerialToDate(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30);
  const converted = new Date(excelEpoch.getTime() + serial * 86400000);
  return converted.toISOString().split("T")[0];
}

/** Normalize any date input into YYYY-MM-DD */
function normalizeDate(raw: any): string {
  if (!raw) return "";
  if (typeof raw === "number") return excelSerialToDate(raw);
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? "" : parsed.toISOString().split("T")[0];
}

/** Normalize Excel headers → lowercase or camelCase */
function normalizeHeader(header: string): string {
  const clean = header.trim().replace(/\s+|_|-/g, '').toLowerCase();

  if (clean === 'meetgoal') return 'meetGoal';
  if (clean === 'behindgoal') return 'behindGoal';
  if (clean === 'atrisk') return 'atRisk';
  return clean;
}

/** Process Excel file to WeeklyData */
export const processExcelFile = async (file: File): Promise<ExcelImportResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
    if (!rows.length) return { success: false, error: 'No data found in Excel file' };

    const rawHeaders = rows[0];
    const normalizedHeaders = rawHeaders.map((h: any) => normalizeHeader(String(h)));

    // Map rows to objects
    const bodyRows = rows.slice(1);
    const jsonData = bodyRows.map((row: any[]) => {
      const obj: any = {};
      normalizedHeaders.forEach((key: string, i: number) => {
        obj[key] = row[i] != null ? row[i] : null;
      });
      return obj;
    });

    // Map to WeeklyData
    const weeklyData: WeeklyData[] = jsonData.map((row: any) => ({
      week: row.week || "",
      year: row.year || "",
      value: row.value != null ? Number(row.value) : 0,
      goal: row.goal != null ? Number(row.goal) : undefined,
      meetGoal: row.meetGoal != null ? Number(row.meetGoal) : undefined,
      behindGoal: row.behindGoal != null ? Number(row.behindGoal) : undefined,
      atRisk: row.atRisk != null ? Number(row.atRisk) : undefined,
      date: normalizeDate(row.date),
    }));

    return { success: true, data: weeklyData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process Excel file',
    };
  }
};

/** Export WeeklyData to Excel */
export const exportToExcel = (data: WeeklyData[], filename: string) => {
  const cleaned = data.map((row) => ({
    Date: row.date || "",
    Value: row.value ?? 0,
    Goal: row.goal ?? "",
    MeetGoal: row.meetGoal ?? "",
    BehindGoal: row.behindGoal ?? "",
    AtRisk: row.atRisk ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(cleaned);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "KPI Data");
  XLSX.writeFile(workbook, filename);
};
