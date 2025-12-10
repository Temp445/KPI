"use client";

import { Card } from "@/components/ui/card";
import { KPIData } from "@/types/dashboard";
import { ExternalLink, Upload } from "lucide-react";
import { KPIChart } from "./KPIChart";
import { ActionPlanSection } from "../ActionPlan/ActionPlanSection";
import { useDashboardStore } from "@/stores/dashboardStore";
import {
  getDaysInMonth,
  getWeeksBetweenMonths,
  getWeeksInYear,
  getSelectedMonthLength,
} from "@/utils/dateCalculations";
import CircleBand from "../KPICircleChart/CircleBand";
import { useState } from "react";
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

export function KPICard({ data, onUpload}: KPICardProps) {
  const { filters } = useDashboardStore();
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(true);

  const [selectedMetric, setSelectedMetric] = useState<string>(data.metricId ?? "");
  const [selectedChartData, setSelectedChartData] = useState(data.chartData);

  const fetchMetricChartData = async (metricId: string) => {
    if (!metricId) return;

    const start = `${filters.startYear}-${String(
      months.indexOf(filters.startMonth) + 1
    ).padStart(2, "0")}-01`;
    const end = `${filters.endYear}-${String(
      months.indexOf(filters.endMonth) + 1
    ).padStart(2, "0")}-31`;

    const { data: rows } = await supabase
      .from("kpi_weekly_data")
      .select("*")
      .eq("metric_id", metricId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });

    const newData =
      rows?.map((d: any) => ({
        week: `WK${d.week_number}`,
        year: d.year,
        value: Number(d.value) || 0,
        goal: d.goal ?? undefined,
        meetGoal: d.meet_goal ?? undefined,
        behindGoal: d.behind_goal ?? undefined,
        atRisk: d.at_risk ?? undefined,
        date: d.date,
      })) ?? [];

    setSelectedChartData(newData);
  };

  const handleBoxClick = (pillar: string, idx: number) => {
    alert(`${pillar}: segment ${idx + 1}`);
  };

  const getNumbersToDisplay = () => {
    switch (filters.timePeriod) {
      case "daily":
        return getDaysInMonth(filters?.startMonth, filters.startYear);
      case "monthly":
        return getSelectedMonthLength(
          filters?.startMonth,
          filters.startYear,
          filters?.endMonth,
          filters.endYear
        );
      case "weekly":
        return getWeeksBetweenMonths(
          filters?.startMonth,
          filters?.startYear,
          filters?.endMonth,
          filters?.endYear
        );
      default:
        return getWeeksInYear(filters.startYear);
    }
  };

  const maxNumbers = getNumbersToDisplay();
  const segmentCount = Math.min(maxNumbers);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  //  segment positions mapping
  const mapChartDataToSegments = () => {
    const mapped: typeof selectedChartData = [];
    const totalSegments = getNumbersToDisplay();

    const startYear = Number(filters.startYear);
    const startMonthIndex = months.indexOf(filters.startMonth);

    for (let i = 0; i < totalSegments; i++) {
      const position = i + 1;
      let found: any;

      if (filters.timePeriod === "daily") {
        found = selectedChartData.find(
          (d) =>
            new Date(d.date) >=
              new Date(
                filters.startYear,
                months.indexOf(filters.startMonth),
                1
              ) &&
            new Date(d.date) <=
              new Date(
                filters.endYear,
                months.indexOf(filters.endMonth) + 1,
                0
              ) &&
            new Date(d.date).getDate() === position
        );
      } else if (filters.timePeriod === "weekly") {
        found = selectedChartData.find((d) => {
          const dt = new Date(d.date);

          const firstDayOfMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
          const dayOfMonth = dt.getDate();
          const localWeek = Math.ceil(
            (dayOfMonth + firstDayOfMonth.getDay()) / 7
          );

          // Start of filter range
          const startDate = new Date(
            filters.startYear,
            months.indexOf(filters.startMonth),
            1
          );

          const totalMonthsDiff =
            (dt.getFullYear() - startDate.getFullYear()) * 12 +
            (dt.getMonth() - startDate.getMonth());

          const safeMonths = Math.max(0, totalMonthsDiff);

          const cumulativeWeekOffset = Array.from({
            length: safeMonths,
          }).reduce((acc: number, _, idx) => {
            const m = new Date(
              startDate.getFullYear(),
              startDate.getMonth() + idx,
              1
            );
            const days = new Date(
              m.getFullYear(),
              m.getMonth() + 1,
              0
            ).getDate();

            const weekCount = Math.ceil(
              (days + new Date(m.getFullYear(), m.getMonth(), 1).getDay()) / 7
            );

            return acc + weekCount;
          }, 0);

          const relativePosition = cumulativeWeekOffset + localWeek;

          return relativePosition === position;
        });
      } else if (filters.timePeriod === "monthly") {
        found = selectedChartData.find((d) => {
          const dt = new Date(d.date);
          const yearDiff = dt.getFullYear() - startYear;
          const monthDiff = dt.getMonth() - startMonthIndex;
          const relativePosition = yearDiff * 12 + monthDiff + 1;
          return relativePosition === position;
        });
      }

      mapped.push(found ?? { value: 0, goal: 0, date: "" });
    }

    return mapped;
  };

  const mappedChartData = mapChartDataToSegments();

  const colors: SegmentColor[] = mappedChartData.map((weekData) => {
    const isGoal = weekData?.goal && weekData.value >= weekData.goal;
    const isBehind =
      weekData?.behindGoal && weekData.value < (weekData.goal || 0);
    const isAtRisk =
      weekData?.atRisk && weekData.value < (weekData.goal || 0) * 0.9;

    if (isAtRisk) return "red";
    if (isBehind) return "amber";
    if (isGoal) return "yellow";
    return "white";
  });

  // Custom display
  const [direction, setDirection] = useState<"clockwise" | "anticlockwise">(
    "clockwise"
  );
  const [startRing, setStartRing] = useState<"outer" | "inner">("outer");
  const [length, setLength] = useState<1 | 2 | 3>(1);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <div
        className="p-2 rounded-t-lg relative group"
        style={{ backgroundColor: data.color }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">{data.category}</h2>

          <div className="flex items-center 2xl:gap-2">
            <ToggleSwitch checked={rotateEnabled} onChange={setRotateEnabled} />

            <div>
              <button
                className="text-white hover:bg-white/20 p-2 rounded-md transition-colors"
                onClick={() =>
                  onUpload?.(`${data.id}:${selectedMetric}:import`)
                }
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
                  (filters.timePeriod === "monthly" &&
                    mappedChartData.length >= 4) ||
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
              <div>
                {data.icon}: Segment {i + 1}
              </div>
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
              setSelectedMetric(e.target.value);
              fetchMetricChartData(e.target.value);
            }}
          >
            {data.metrics.allMetrics?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
  

        </div>

        <KPIChart
          data={selectedChartData}
          title={
            data.metrics.allMetrics?.find((m) => m.id === selectedMetric)
              ?.title || data.metrics.primary
          }
          color={data.color}
        />

        <ActionPlanSection
          actionPlans={data.actionPlans}
          counts={data.actionPlanCounts}
          categoryId={data.id}
        />

        {data.metrics.secondary && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{data.metrics.secondary}</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <KPIChart
              data={selectedChartData}
              title={data.metrics.secondary}
              color={data.color}
              type="line"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
