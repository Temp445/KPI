import * as XLSX from 'xlsx';
import { WeeklyData } from '@/types/dashboard';

export interface ExcelImportResult {
  success: boolean;
  data?: WeeklyData[];
  error?: string;
}

export const processExcelFile = async (file: File): Promise<ExcelImportResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const weeklyData: WeeklyData[] = jsonData.map((row: any) => ({
      week: row.week || row.Week || '',
      value: parseFloat(row.value || row.Value || '0'),
      goal: row.goal || row.Goal ? parseFloat(row.goal || row.Goal) : undefined,
      meetGoal: row.meetGoal || row['Meet Goal'] ? parseFloat(row.meetGoal || row['Meet Goal']) : undefined,
      behindGoal: row.behindGoal || row['Behind Goal'] ? parseFloat(row.behindGoal || row['Behind Goal']) : undefined,
      atRisk: row.atRisk || row['At Risk'] ? parseFloat(row.atRisk || row['At Risk']) : undefined,
    }));

    if (weeklyData.length === 0) {
      return {
        success: false,
        error: 'No data found in Excel file',
      };
    }

    return {
      success: true,
      data: weeklyData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process Excel file',
    };
  }
};

export const exportToExcel = (data: WeeklyData[], filename: string = 'kpi-data.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI Data');

  XLSX.writeFile(workbook, filename);
};

export const generateExcelTemplate = () => {
  const templateData = [
    {
      week: 'WK1',
      value: 0,
      goal: 0,
      meetGoal: 0,
      behindGoal: 0,
      atRisk: 0,
    },
    {
      week: 'WK2',
      value: 0,
      goal: 0,
      meetGoal: 0,
      behindGoal: 0,
      atRisk: 0,
    },
  ];

  exportToExcel(templateData, 'kpi-template.xlsx');
};
