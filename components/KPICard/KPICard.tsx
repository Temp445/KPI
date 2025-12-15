"use client";

import { Card } from "@/components/ui/card";
import { KPIData } from "@/types/dashboard";
import { ExternalLink } from "lucide-react";
import { KPIChart } from "./KPIChart";
import { ActionPlanSection } from "../ActionPlan/ActionPlanSection";
import { useDashboardStore } from "@/stores/dashboardStore";
import { getDaysInMonth, getWeeksBetweenMonths, getWeeksInYear, getSelectedMonthLength, getMonthStartISO, getMonthEndISO, getMonthIndex } from "@/utils/dateCalculations";
import CircleBand from "../KPICircleChart/CircleBand";
import { useEffect, useState } from "react";
import ToggleSwitch from "../FiltersButton/ToggleSwitch";
import ToggleMenu from "../FiltersButton/ToggleMenu";
import { supabase } from "@/lib/supabase";

type SegmentColor =
  | "red"
  | "amber"
  | "yellow"
  | "white"
  | { gradient: [string, string] };

interface KPICardProps {
  data: KPIData;
  onUpload?: (id: string) => void;
}

export function KPICard({ data, onUpload }: KPICardProps) {
  const { filters } = useDashboardStore();
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>(data.metricId ?? "");
  const [selectedChartData, setSelectedChartData] = useState(data.chartData);


  useEffect(() => {
    fetchMetricChartData(selectedMetric);
  }, [filters, selectedMetric]);

  const fetchMetricChartData = async (metricId: string) => {
    if (!metricId) return;

    try {
    const startMonthIndex = getMonthIndex(filters.startMonth);
    const start = getMonthStartISO(filters.startMonth, filters.startYear);
    const end = getMonthEndISO(filters.endMonth, filters.endYear);

      const { data: rows } = await supabase
        .from("kpi_weekly_data")
        .select("*")
        .eq("metric_id", metricId)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });

      const newData = (rows ?? []).map((d: any) => {
        const dt = new Date(d.date);
        let weekLabel = "";
        if (filters.timePeriod === "daily") {
          weekLabel = `D${String(dt.getDate()).padStart(2, "0")}`;
        } else if (filters.timePeriod === "weekly") {
          const rangeStart = new Date(filters.startYear, startMonthIndex, 1);
          const weekNumber = Math.ceil(((dt.getTime() - rangeStart.getTime()) / 86400000 + 1) / 7);
          weekLabel = `WK${weekNumber}`;
        } else if (filters.timePeriod === "monthly") {
          weekLabel = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        }

        return {
          week: weekLabel,
          year: dt.getFullYear(),
          value: Number(d.value) || 0,
          goal: d.goal ?? undefined,
          meetGoal: d.meet_goal ?? undefined,
          behindGoal: d.behind_goal ?? undefined,
          atRisk: d.at_risk ?? undefined,
          date: d.date,
        };
      });

      setSelectedChartData(newData);
    } catch (error) {
      console.error("Error fetching KPI data", error);
    }
  };

  const filterChartDataByRange = (data: typeof selectedChartData) => {
    const startDate = new Date(filters.startYear, getMonthIndex(filters.startMonth), 1);
    const endDate = new Date(filters.endYear, getMonthIndex(filters.endMonth) + 1, 0);
    return data.filter(d => {
      const dt = new Date(d.date);
      return dt.getTime() >= startDate.getTime() && dt.getTime() <= endDate.getTime();
    });
  };

  const emptyWeeklyData: typeof selectedChartData[number] = {
  week: "",
  year: 0,
  value: 0,
  goal: 0,
  meetGoal: 0,
  date: "",
};


  const mapChartDataToSegments = () => {
    const filteredData = filterChartDataByRange(selectedChartData);
    let mapped: typeof selectedChartData = [];

    const startMonthIndex = getMonthIndex(filters.startMonth);

    if (filters.timePeriod === "daily") {
      const days = getDaysInMonth(filters.startMonth, filters.startYear);
      mapped = Array.from({ length: days }, (_, i) => {
        const position = i + 1;
        const found = filteredData.find(d => new Date(d.date).getDate() === position);
        return found ?? emptyWeeklyData;
      });
    } else if (filters.timePeriod === "weekly") {
      const totalWeeks = getWeeksBetweenMonths(filters.startMonth, filters.startYear, filters.endMonth, filters.endYear);
      mapped = Array.from({ length: totalWeeks }, (_, i) => {
        const position = i + 1;
        const found = filteredData.find(d => {
          const dt = new Date(d.date);
          const rangeStart = new Date(filters.startYear, startMonthIndex, 1);
          const weekNumber = Math.ceil(((dt.getTime() - rangeStart.getTime()) / 86400000 + 1) / 7);
          return weekNumber === position;
        });
        return found ?? emptyWeeklyData;
      });
    } else if (filters.timePeriod === "monthly") {
      const totalMonths = getSelectedMonthLength(filters.startMonth, filters.startYear, filters.endMonth, filters.endYear);
      mapped = Array.from({ length: totalMonths }, (_, i) => {
        const position = i;
        const found = filteredData.find(d => {
          const dt = new Date(d.date);
          const monthIndex = (dt.getFullYear() - filters.startYear) * 12 + dt.getMonth() - startMonthIndex;
          return monthIndex === position;
        });
        return found ?? emptyWeeklyData;
      });
    } else {
      const totalWeeks = getWeeksInYear(filters.startYear);
      mapped = Array.from({ length: totalWeeks }, (_, i) => {
        const found = filteredData[i];
        return found ?? emptyWeeklyData;
      });
    }

    return mapped;
  };

  const mappedChartData = mapChartDataToSegments();

  const colors: SegmentColor[] = mappedChartData.map(weekData => {
    if (!weekData.value) return "white"; // No data
    const isGoal = weekData.goal && weekData.value >= weekData.goal;
    const isBehind = weekData.behindGoal && weekData.value < (weekData.goal || 0);
    const isAtRisk = weekData.atRisk && weekData.value < (weekData.goal || 0) * 0.9;

    if (isAtRisk) return "red";
    if (isBehind) return "amber";
    if (isGoal) return "yellow";
    return "white";
  });

  // Custom display
  const [direction, setDirection] = useState<"clockwise" | "anticlockwise">("clockwise");
  const [startRing, setStartRing] = useState<"outer" | "inner">("outer");
  const [length, setLength] = useState<1 | 2 | 3>(1);

  const segmentCount = mappedChartData.length;

  const handleBoxClick = (pillar: string, idx: number) => {
    alert(`${pillar}: segment ${idx + 1}`);
  };


  const hasNoData =
  !selectedChartData ||
  selectedChartData.length === 0 ||
  selectedChartData.every(d => !d.value && !d.goal && !d.meetGoal && !d.behindGoal && !d.atRisk);


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-2 rounded-lg relative group" style={{ backgroundColor: data.color }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">{data.category}</h2>

          <div className="flex items-center 2xl:gap-2">
            <ToggleSwitch checked={rotateEnabled} onChange={setRotateEnabled} />
            <div>
              <button
                className="text-white hover:bg-white/20 p-2 rounded-md transition-colors"
                onClick={() => onUpload?.(`${data.id}:${selectedMetric}:import`)}
              >
                <ExternalLink className="w-5 h-5" />
              </button>

              <ToggleMenu
                setDirection={setDirection}
                direction={direction}
                setStartRing={setStartRing}
                startRing={startRing}
                setLength={(val: number) => setLength(val as 1 | 2 | 3)}
                length={length}
                showRange={
                  (filters.timePeriod === "monthly" && mappedChartData.length >= 4) ||
                  filters.timePeriod === "weekly" ||
                  filters.timePeriod === "daily"
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center items-center p-6">
          <CircleBand
            letter={data.icon}
            segments={segmentCount}
            colors={colors}
            size="200%"
            rotationEnabled={rotateEnabled}
            activeSegment={activeSegment}
            setActiveSegment={setActiveSegment}
            direction={direction}
            startRing={startRing}
            length={length}
            tooltipRenderer={(i) => (
              <div>{data.icon}: Segment {i + 1}</div>
            )}
            onSegmentClick={(i) => handleBoxClick?.(data.icon, i)}
          />
        </div>
      </div>


      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5"
            value={selectedMetric}
            onChange={(e) => {
              e.preventDefault();
              setSelectedMetric(e.target.value);
              fetchMetricChartData(e.target.value);
            }}
          >
            {data.metrics.allMetrics?.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        
        {hasNoData ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            No data available.
          </div>
        ) : (
          <KPIChart
          data={selectedChartData}
          title={data.metrics.allMetrics?.find(m => m.id === selectedMetric)?.title || data.metrics.primary}
           metricType={data.metrics.allMetrics?.find(m => m.id === selectedMetric)?.metric_type || "count"}
          color={data.color}
        />
      )}
        <ActionPlanSection
          actionPlans={data.actionPlans}
          counts={data.actionPlanCounts}
          categoryId={data.id}
        />

        {data.metrics.secondary && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{data.metrics.secondary}</h4>
              {/* <button className="text-gray-400 hover:text-gray-600">
                <Upload className="w-4 h-4" />
              </button> */}
            </div>
            {hasNoData ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            No data available.
          </div>
        ) : (
            <KPIChart
              data={selectedChartData}
              title={data.metrics.secondary}
              color={data.color}
              type="line"
            />
        )}
          </div>
        )}
      </div>
    </Card>
  );
}
