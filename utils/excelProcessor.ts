import * as XLSX from 'xlsx';
import { WeeklyData } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';

export interface ExcelImportResult {
  success: boolean;
  data?: WeeklyData[];
  error?: string;
}

/** Convert Excel serial date → YYYY-MM-DD */
function excelSerialToDate(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30); // Excel zero date
  const converted = new Date(excelEpoch.getTime() + serial * 86400000);
  return converted.toISOString().split("T")[0];
}

/** Normalize any date input into YYYY-MM-DD */
function normalizeDate(raw: any): string {
  if (!raw) return "";

  // case 1: Excel serial (number)
  if (typeof raw === "number") {
    return excelSerialToDate(raw);
  }

  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return ""; // fallback
}

export const processExcelFile = async (file: File): Promise<ExcelImportResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return { success: false, error: 'No data found in Excel file' };
    }

    const weeklyData: WeeklyData[] = jsonData.map((row: any) => {
      const rawDate = row.date || row.Date;

      return {
        week: row.week || row.Week || "",
        year: row.year || row.Year || "",
        value: row.value != null ? Number(row.value) : 0,
        goal: row.goal != null ? Number(row.goal) : undefined,
        meetGoal: row.meetGoal != null ? Number(row.meetGoal) : undefined,
        behindGoal: row.behindGoal != null ? Number(row.behindGoal) : undefined,
        atRisk: row.atRisk != null ? Number(row.atRisk) : undefined,
        date: normalizeDate(rawDate), // <-- fixed
      };
    });

    return { success: true, data: weeklyData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process Excel file',
    };
  }
};

export const exportToExcel = (data: WeeklyData[], filename: string) => {
  const cleaned = data.map((row) => ({
    date: row.date || "",
    value: row.value ?? 0,
    goal: row.goal ?? "",
    meetGoal: row.meetGoal ?? "",
    behindGoal: row.behindGoal ?? "",
    atRisk: row.atRisk ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(cleaned);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "KPI Data");
  XLSX.writeFile(workbook, filename);
};



export const generateExcelTemplate = async (
  filters: any,
  categoryTitle: string,
  metricId: string
) => {
  try {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const start = new Date(filters.startYear, months.indexOf(filters.startMonth), 1);
    const end = new Date(filters.endYear, months.indexOf(filters.endMonth) + 1, 0);

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("kpi_weekly_data")
      .select("*")
      .eq("metric_id", metricId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Template fetch error:", error);
      return;
    }

    const cleaned = (data || []).map((row: any) => ({
      date: row.date || "",
      value: Number(row.value) || 0,
      goal: row.goal ?? 0,
      meetGoal: row.meet_goal ?? 0,
      behindGoal: row.behind_goal ?? 0,
      atRisk: row.at_risk ?? 0,
    }));


    const worksheet = XLSX.utils.json_to_sheet(cleaned);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, categoryTitle.substring(0, 30));

    XLSX.writeFile(workbook, `kpi-template-${categoryTitle}.xlsx`);
  } catch (err) {
    console.error("Error generating template:", err);
  }
};

