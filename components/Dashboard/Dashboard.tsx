'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { DashboardFilters } from '@/components/Filters/DashboardFilters';
import { KPICard } from '@/components/KPICard/KPICard';
import { ExcelImport } from '@/components/DataImport/ExcelImport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { KPIData, WeeklyData } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import ToggleSetting from '../FiltersButton/ToggleSetting';
import { toast } from '@/hooks/use-toast';
import { months } from '@/utils/clampEndMonthYear';
import { exportToExcel } from '@/utils/excelProcessor';
import { useAuth } from '@/context/authContext';

type ImportResult = 
  | { status: "ok" }
  | { status: "duplicates"; duplicates: string[]; newData: WeeklyData[] }
  | { status: "error"; error: any };


export function Dashboard() {
  const { user } = useAuth();
  const { kpiData, setKPIData, loading, setLoading, filters } = useDashboardStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);
  const [existingRowsForImport, setExistingRowsForImport] = useState<WeeklyData[] | null>(null);

  const [allowOverflow, setAllowOverflow] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('allowOverflow');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  const [maxLength, setMaxLength] = useState<number>(20);

  useEffect(() => {
    if (kpiData.length > 0) {
      setMaxLength((prev) => {
        if (prev > kpiData.length) return kpiData.length;
        if (prev === 9999) return kpiData.length;
        return prev;
      });
    }
  }, [kpiData]);

  useEffect(() => {
    if (maxLength > 0) {
      localStorage.setItem('maxLength', maxLength.toString());
    }
  }, [maxLength]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load dashboard KPI data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('kpi_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;
      const cats = categories ?? [];
      const kpiDataPromises = cats.map(async (category) => {
        const { data: metric } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('category_id', category.id)

          const { data: weeklyData } = await supabase
            .from('kpi_weekly_data')
            .select('*')
            .eq('metric_id', metric?.[0]?.id)
            .order('date', { ascending: true });
          
          const chartData: WeeklyData[] = (weeklyData || []).map((row: any) => ({
            week: row.week_number?.toString() || "",
            year: row.year?.toString() || "",
            value: row.value ?? 0,
            goal: row.goal ?? undefined,
            meetGoal: row.meet_goal ?? undefined,
            behindGoal: row.behind_goal ?? undefined,
            atRisk: row.at_risk ?? undefined,
            date: row.date,
          }));

        const { data: actionPlans } = await supabase
          .from('action_plans')
          .select('*')
          .eq('category_id', category.id)
          .order('due_date')

        const plans =
          actionPlans?.map((p: any) => ({
            id: p.id,
            title: p.title,
            dueDate: new Date(p.due_date).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            status: p.status,
          })) || [];

        const openCount = actionPlans?.filter((p: any) => p.status === 'open').length || 0;
        const pendingCount = actionPlans?.filter((p: any) => p.status === 'pending').length || 0;
        const overdueCount = actionPlans?.filter((p: any) => p.status === 'overdue').length || 0;

        const kpi: KPIData = {
          id: category.id,
          category: category.name,
          title: metric?.[0]?.title || `${category.name} Metrics`,
          color: category.color,
          icon: category.icon,
          metricId: metric?.[0]?.id || null, 
          metrics: {
            primary: metric?.[0]?.title || `No of ${category.name}`,
            secondary:
              category.name === 'Quality'
                ? 'Pareto: Right First Time'
                : category.name === 'Safety'
                ? 'One Minute Manager'
                : `One Minute Manager`,
                allMetrics: metric?.map((m: any) => ({ id: m.id, title: m.title ,metric_type: m.metric_type})) || [],
          },
          chartData,
          actionPlans: plans,
          actionPlanCounts: {
            open: openCount,
            pending: pendingCount,
            overdue: overdueCount,
          },
        };

        return kpi;
      });

      const loadedKPIData = await Promise.all(kpiDataPromises);
      setKPIData(loadedKPIData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle KPI card upload button click
  const handleUpload = async (payload: string) => {
  const [categoryId, metricId, type] = payload.split(":");

  setSelectedKPI(categoryId);
  setActiveMetricId(metricId);

  if (type === "import") {
    try {
      const { data: existing, error: existingError } = await supabase
        .from('kpi_weekly_data')
        .select('*')
        .eq('metric_id', metricId)
        .order('date', { ascending: true });

      if (existingError) throw existingError;

      // normalize to WeeklyData shape the component expects
      const existingNormalized: WeeklyData[] = (existing || []).map((r: any) => ({
        date: (r.date || '').toString(),
        value: r.value ?? 0,
        goal: r.goal ?? undefined,
        meetGoal: r.meet_goal ?? undefined,
        behindGoal: r.behind_goal ?? undefined,
        atRisk: r.at_risk ?? undefined,
        year: r.year?.toString() ?? '',
        week: r.week_number?.toString() ?? ''
      }));

      setExistingRowsForImport(existingNormalized);
    } catch (err) {
      console.error('Failed to fetch existing rows for import', err);
      setExistingRowsForImport(null);
    } finally {
      setImportDialogOpen(true);
    }
  }
};

// Filter chart data by selected date range
const filterChartDataByRange = (data: WeeklyData[], startYear: number, startMonth: string, endYear: number, endMonth: string) => {
  const startDate = new Date(startYear, months.indexOf(startMonth), 1);
  const endDate = new Date(endYear, months.indexOf(endMonth) + 1, 0); 
  return data.filter(d => {
    const dt = new Date(d.date);
    return dt >= startDate && dt <= endDate;
  });
};


// Download filtered data to Excel
const handleDownload = (metricId: string) => {
  if (!user) {
    toast({
      title: "Not Logged In",
      description: "You must be logged in to download data.",
      variant: "destructive",
    });
    return;
  }

  const metric = kpiData
    .flatMap(k => k.metrics.allMetrics)
    .find(m => m?.id === metricId);

  const kpi = kpiData.find(k => k.metrics.allMetrics?.some(m => m?.id === metricId));
  if (!kpi) return;

  const filteredData = filterChartDataByRange(
    kpi.chartData,
    Number(filters.startYear),
    filters.startMonth,
    Number(filters.endYear),
    filters.endMonth
  );

  if (filteredData.length === 0) {
    alert("No data available to export for selected filter range");
    return;
  }

  const metricName = metric?.title || metricId;
  exportToExcel(filteredData, `${metricName.replace(/\s+/g, "_")}-data.xlsx`);
};

// Insert data rows into DB
async function insertDataRows(data: WeeklyData[], metricId: string) {
  const formattedRows = data.map((row) => {
    const dateObj = new Date(row.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const week = Math.ceil(
      ((dateObj.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );

    return {
      metric_id: metricId,
      week_number: week,
      year,
      month,
      value: Number(row.value ?? 0),
      goal: row.goal ?? null,
      meet_goal: row.meetGoal ?? null,
      behind_goal: row.behindGoal ?? null,
      at_risk: row.atRisk ?? null,
      date: row.date,
    };
  });

  const { error } = await supabase.from("kpi_weekly_data").upsert(formattedRows, {onConflict: "metric_id,date"});

  if (error) throw error;
}

// Import new data, checking for duplicates first
const handleImportData = async (
  data: WeeklyData[]
): Promise<ImportResult> => {
  if (!user) {
    toast({
      title: "Not Logged In",
      description: "You must be logged in to import data.",
      variant: "destructive",
    });
    return { status: "error", error: "not_logged_in" };
  }

  if (!selectedKPI || !activeMetricId) {
    return { status: "error", error: "no_metric_selected" };
  }

  try {
    setLoading(true); 

    const metricId = activeMetricId;

    // Normalize uploaded dates
    const uploadedDates = data.map((d) =>
      new Date(d.date).toISOString().slice(0, 10)
    );

    const { data: existingDB, error: existingError } = await supabase
      .from("kpi_weekly_data")
      .select("date")
      .eq("metric_id", metricId);

    if (existingError) throw existingError;

    const existingDates = (existingDB || []).map((r: any) =>
      new Date(r.date).toISOString().slice(0, 10)
    );

    const duplicates = uploadedDates.filter((d) =>
      existingDates.includes(d)
    );

    if (duplicates.length > 0) {
      return { status: "duplicates", duplicates, newData: data };
    }

    await insertDataRows(data, metricId);

    await loadDashboardData();

    toast({
      title: "Import Successful",
      description: "Data imported successfully.",
      variant: "success",
    });

    setImportDialogOpen(false);
    setSelectedKPI(null);
    setActiveMetricId(null);

    return { status: "ok" };
  } catch (error) {
    console.error("Import error:", error);

    toast({
      title: "Import Failed",
      description:
        error instanceof Error ? error.message : String(error),
      variant: "destructive",
    });

    return { status: "error", error };
  } finally {
    setLoading(false); 
  }
};

// Handle replacing duplicates in DB with uploaded data
const handleReplaceDuplicates = async (pendingData: WeeklyData[], duplicates: string[]): Promise<ImportResult> => {
  if (!user || !activeMetricId) return { status: "error", error: "not_ready" };

  try {
    setLoading(true);
    const metricId = activeMetricId;

    await supabase
      .from("kpi_weekly_data")
      .delete()
      .eq("metric_id", metricId)
      .in(
        "date",
        duplicates.map((d) => new Date(d).toISOString().slice(0, 10))
      );

    await insertDataRows(pendingData, metricId);

    await loadDashboardData();
    toast({ title: "Replaced", description: "Existing rows replaced.", variant: "success" });
    return { status: "ok" };
  } catch (error) {
    toast({ title: "Replace Failed", description: String(error), variant: "destructive" });
    return { status: "error", error };
  } finally {
    setLoading(false);
  }
};

// Get selected KPI data
const selectedKPIData = kpiData.find((k) => k.id === selectedKPI);

// overflow toggle handler
const toggleOverflow = () => {
    setAllowOverflow((prev) => {
      const newValue = !prev;
      localStorage.setItem('allowOverflow', JSON.stringify(newValue));
      return newValue;
    });
  };
  

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="flex items-center md:justify-between mb-6 gap-4 flex-wrap">
            <DashboardFilters toggleOverflow={toggleOverflow} allowOverflow={allowOverflow} maxLength={maxLength} setMaxLength={setMaxLength} kpiData={kpiData} />

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[600px] rounded-lg bg-gray-100 " />
            ))}
          </div>
        ) : (
          <div className={`${allowOverflow ? 'overflow-x-auto overflow-visible' : ''}`}>
            <div
              className={`${
                allowOverflow
                  ? 'flex gap-4 w-screen md:w-max'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              } gap-4`}
            >
              {kpiData.slice(0, maxLength).map((kpi) => (
                <div
                  key={kpi.id}
                  className={allowOverflow ? 'flex-shrink-0 w-[80%] sm:w-[500px] h-[85vh]' : ''}
                >
                  <KPICard data={kpi} onUpload={handleUpload} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
 
      {selectedKPIData && (
        <ExcelImport
          isOpen={importDialogOpen}
          onClose={() => {
            setImportDialogOpen(false);
            setSelectedKPI(null);
            setExistingRowsForImport(null); 
          }}
          onImport={handleImportData}
          onReplaceDuplicates={handleReplaceDuplicates}
          kpiTitle={selectedKPIData.title}
          selectedKPIData={{ metricId: activeMetricId! }}
          onDownload={handleDownload}
          existingData={existingRowsForImport}
        />
      )}
    </div>
  );
}
