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

export function Dashboard() {
  const { kpiData, setKPIData, loading, setLoading } = useDashboardStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const [allowOverflow, setAllowOverflow] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("allowOverflow");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

const [maxLength, setMaxLength] = useState<number>(20);


 useEffect(() => {
  if (kpiData.length > 0) {
    setMaxLength(prev => {
      if (prev > kpiData.length) return kpiData.length;
      if (prev === 9999) return kpiData.length;
      return prev;
    });
  }
}, [kpiData]);

 useEffect(() => {
  if (maxLength > 0) {
    localStorage.setItem("maxLength", maxLength.toString());
  }
}, [maxLength]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('kpi_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      const kpiDataPromises = categories?.map(async (category) => {
        const { data: metrics } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('category_id', category.id)
          .limit(1)
          .maybeSingle();

        let chartData: WeeklyData[] = [];
        if (metrics) {
          const { data: weeklyData } = await supabase
            .from('kpi_weekly_data')
            .select('*')
            .eq('metric_id', metrics.id)
            .eq('year', new Date().getFullYear())
            .order('week_number');

          chartData =
            weeklyData?.map((d) => ({
              week: `WK${d.week_number}`,
              value: parseFloat(d.value.toString()),
              goal: d.goal ? parseFloat(d.goal.toString()) : undefined,
              meetGoal: d.meet_goal ? parseFloat(d.meet_goal.toString()) : undefined,
              behindGoal: d.behind_goal ? parseFloat(d.behind_goal.toString()) : undefined,
              atRisk: d.at_risk ? parseFloat(d.at_risk.toString()) : undefined,
            })) || [];
        }

        if (chartData.length === 0) {
          chartData = Array.from({ length: 8 }, (_, i) => ({
            week: `WK${i + 1}`,
            value: Math.floor(Math.random() * 5),
            goal: 3,
            meetGoal: 2,
            behindGoal: 1,
            atRisk: 1,
          }));
        }

        const { data: actionPlans } = await supabase
          .from('action_plans')
          .select('*')
          .eq('category_id', category.id)
          .order('due_date')
          .limit(2);

        const plans =
          actionPlans?.map((p) => ({
            id: p.id,
            title: p.title,
            dueDate: new Date(p.due_date).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            status: p.status as 'open' | 'pending' | 'overdue',
          })) || [];

        const openCount = actionPlans?.filter((p) => p.status === 'open').length || 0;
        const pendingCount = actionPlans?.filter((p) => p.status === 'pending').length || 0;
        const overdueCount = actionPlans?.filter((p) => p.status === 'overdue').length || 0;

        const kpi: KPIData = {
          id: category.id,
          category: category.name,
          title: metrics?.title || `${category.name} Metrics`,
          color: category.color,
          icon: category.icon,
          metrics: {
            primary: metrics?.title || `No of ${category.name}`,
            secondary:
              category.name === 'Quality'
                ? 'Pareto: Right First Time'
                : category.name === 'Safety'
                ? 'One Minute Manager'
                : `One Minute Manager`,
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
      }) || [];

      const loadedKPIData = await Promise.all(kpiDataPromises);
      setKPIData(loadedKPIData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (kpiId: string) => {
    setSelectedKPI(kpiId);
    setImportDialogOpen(true);
  };

  const handleImportData = async (data: WeeklyData[]) => {
    if (!selectedKPI) return;

    const kpi = kpiData.find((k) => k.id === selectedKPI);
    if (kpi) {
      const updatedKPI = { ...kpi, chartData: data };
      setKPIData(kpiData.map((k) => (k.id === selectedKPI ? updatedKPI : k)));
    }
  };

  const selectedKPIData = kpiData.find((k) => k.id === selectedKPI);

  const toggleOverflow = () => {
    setAllowOverflow(prev => {
      const newValue = !prev;
      localStorage.setItem("allowOverflow", JSON.stringify(newValue));
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
          <div className='flex items-center gap-3 -ml-24 md:-ml-0'>
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
              <Skeleton key={i} className="h-[600px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className={`${allowOverflow ? "overflow-x-auto overflow-visible" : ""}`}>
            <div
              className={`${
                allowOverflow
                  ? "flex gap-4 w-screen md:w-max"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              } gap-4`}
            >
              {kpiData.slice(0, maxLength).map((kpi) => (
                <div key={kpi.id} className={allowOverflow ? "flex-shrink-0 w-[80%] sm:w-[500px] h-[85vh]" : ""}>
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
        />
      )}
    </div>
  );
}
