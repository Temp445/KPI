import { create } from 'zustand';
import { DashboardState, KPIData, FilterState, TimePeriod } from '@/types/dashboard';

interface DashboardStore extends DashboardState {
  setFilters: (filters: Partial<FilterState>) => void;
  setKPIData: (data: KPIData[]) => void;
  updateKPIData: (id: string, data: Partial<KPIData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}


const initialFilters: FilterState = {
  department: 'All Departments',
  startMonth: new Date().toLocaleString('default', { month: 'long' }),
  endMonth: new Date().toLocaleString('default', { month: 'long' }),
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear(),
  timePeriod: 'weekly' as TimePeriod,
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  kpiData: [],
  filters: initialFilters,
  loading: false,
  error: null,

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setKPIData: (data) => set({ kpiData: data }),

  updateKPIData: (id, data) =>
    set((state) => ({
      kpiData: state.kpiData.map((kpi) =>
        kpi.id === id ? { ...kpi, ...data } : kpi
      ),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: initialFilters }),
}));
