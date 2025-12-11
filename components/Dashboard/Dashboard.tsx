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

export function Dashboard() {
  const { user } = useAuth();
  const { kpiData, setKPIData, loading, setLoading, filters } = useDashboardStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

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

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const start = new Date(
        Number(filters.startYear),
        Math.max(0, months.indexOf(filters.startMonth)),
        1
      );
      const end = new Date(
        Number(filters.endYear),
        Math.max(0, months.indexOf(filters.endMonth)) + 1,
        0
      );

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
          .limit(2);

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
                allMetrics: metric?.map((m: any) => ({ id: m.id, title: m.title })) || [],
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

 const handleUpload = (payload: string) => {
  const [categoryId, metricId, type] = payload.split(":");

  setSelectedKPI(categoryId);
  setActiveMetricId(metricId);

  if (type === "import") {
    setImportDialogOpen(true);
  }
};

const filterChartDataByRange = (data: WeeklyData[], startYear: number, startMonth: string, endYear: number, endMonth: string) => {
  const startDate = new Date(startYear, months.indexOf(startMonth), 1);
  const endDate = new Date(endYear, months.indexOf(endMonth) + 1, 0); 
  return data.filter(d => {
    const dt = new Date(d.date);
    return dt >= startDate && dt <= endDate;
  });
};

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

  const handleImportData = async (data: WeeklyData[]) => {

    if (!user) {
    toast({
      title: "Not Logged In",
      description: "You must be logged in to import data.",
      variant: "destructive",
    });
    return;
  }

  if (!selectedKPI || !activeMetricId) return;

  try {
    setLoading(true);
    const metricId = activeMetricId;   

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
        value: Number(row.value),
        goal: row.goal ?? null,
        meet_goal: row.meetGoal ?? null,
        behind_goal: row.behindGoal ?? null,
        at_risk: row.atRisk ?? null,
        date: row.date,
      };
    });

    // Remove duplicate dates
    const map = new Map();
    formattedRows.forEach((row) => {
      if (!map.has(row.date)) map.set(row.date, row);
    });
    const uniqueRows = Array.from(map.values());

    // Remove existing rows for same metricId + date
    for (const row of uniqueRows) {
      await supabase
        .from("kpi_weekly_data")
        .delete()
        .eq("metric_id", metricId)
        .eq("date", row.date);
    }

    await supabase.from("kpi_weekly_data").insert(uniqueRows);

    toast({
      title: "Import Success",
      description: "Excel imported to selected metric.",
      variant: "success",
    });

    await loadDashboardData();
    setImportDialogOpen(false);
    setSelectedKPI(null);
    setActiveMetricId(null);

  } catch (error) {
    toast({
      title: "Import Failed",
      description: String(error),
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const selectedKPIData = kpiData.find((k) => k.id === selectedKPI);

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
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TL Dashboard</h1>
          <div className="flex justify-between items-end md:items-start gap-4 ">
            <DashboardFilters />
            <div className="flex items-center gap-3 -ml-24 md:-ml-0">
              <ThemeToggle />
              <ToggleSetting
                onToggleOverflow={toggleOverflow}
                allowOverflow={allowOverflow}
                maxLength={maxLength}
                setMaxLength={setMaxLength}
                kpiDataLength={kpiData.length}
              />
            </div>
          </div>
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
          }}
          onImport={handleImportData}
          kpiTitle={selectedKPIData.title}
          selectedKPIData={{ metricId: activeMetricId! }}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
