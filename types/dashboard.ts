export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export type ActionPlanStatus = 'open' | 'pending' | 'overdue';

export interface WeeklyData {
  year: string | number; 
  week: string;
  value: number;
  goal?: number;
  meetGoal?: number;
  behindGoal?: number;
  atRisk?: number;
  date: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  dueDate: string;
  status: ActionPlanStatus;
}

export interface KPIData {
  id: string;
  category: string;
  title: string;
  color: string;
  icon: string;
   metricId: string, 
  metrics: {
    primary: string;
    secondary?: string;
  };
  chartData: WeeklyData[];
  actionPlans: ActionPlanItem[];
  actionPlanCounts: {
    open: number;
    pending: number;
    overdue: number;
  };
}

export interface FilterState {
  department: string;
  startMonth: string;
  endMonth: string;
  startYear: number;
  endYear: number;
  timePeriod: TimePeriod;
}

export interface DashboardState {
  kpiData: KPIData[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
}
