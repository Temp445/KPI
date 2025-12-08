"use client";

import { Card } from "@/components/ui/card";
import { KPIData } from "@/types/dashboard";
import { ExternalLink, Upload } from "lucide-react";
import { KPIChart } from "./KPIChart";
import { ActionPlanSection } from "../ActionPlan/ActionPlanSection";
import { useDashboardStore } from "@/stores/dashboardStore";
import { getDaysInMonth, getWeeksBetweenMonths, getWeeksInYear, getSelectedMonthLength } from "@/utils/dateCalculations";
import CircleBand from "../KPICircleChart/CircleBand";
import { useState } from "react";
import ToggleSwitch from "../FiltersButton/ToggleSwitch";
import ToggleMenu from "../FiltersButton/ToggleMenu";

type SegmentColor = "red" | "amber" | "yellow" | "white" | { gradient: [string, string] };

interface KPICardProps {
  data: KPIData;
  onUpload?: (id: string) => void;
}

export function KPICard({ data, onUpload }: KPICardProps) {
  const { filters } = useDashboardStore();
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(true);

  const handleBoxClick = (pillar: string, idx: number) => {
    alert(`${pillar}: segment ${idx + 1}`);
  };

  // Calculate total number of segments
  const getNumbersToDisplay = () => {
    switch (filters.timePeriod) {
      case "daily":
        return getDaysInMonth(filters?.startMonth, filters.startYear);
      case "monthly":
        return getSelectedMonthLength(filters?.startMonth, filters.startYear, filters?.endMonth, filters.endYear);
      case "weekly":
        return getWeeksBetweenMonths(filters?.startMonth, filters?.startYear, filters?.endMonth, filters?.endYear);
      default:
        return getWeeksInYear(filters.startYear);
    }
  };

  const maxNumbers = getNumbersToDisplay();
  const segmentCount = Math.min(maxNumbers);

  // Map chart data to proper positions
  const mapChartDataToPositions = () => {
    const mapped: typeof data.chartData = [];

    for (let i = 0; i < segmentCount; i++) {
      const position = i + 1;
      let found: any;

      if (filters.timePeriod === "daily") {
        found = data.chartData.find((d) => new Date(d.date).getDate() === position);
      } else if (filters.timePeriod === "weekly") {
        found = data.chartData.find((d) => Number(d.week.replace("WK", "")) === position);
      } else if (filters.timePeriod === "monthly") {
        found = data.chartData.find((d) => Number(d.week.split("-")[1]) === position);
      }

      mapped.push(found ?? { value: 0, goal: 0, date: "" });
    }

    return mapped;
  };

  const mappedChartData = mapChartDataToPositions();

  const colors: SegmentColor[] = mappedChartData.map((weekData) => {
    const value = weekData.value ?? 0;
    const goal = weekData.goal ?? 0;
    const behindGoal = weekData.behindGoal ?? 0;
    const atRisk = weekData.atRisk ?? 0;

    if (goal && value < goal * 0.9) return "red";
    if (goal && value < goal) return "amber";
    if (goal && value >= goal) return "yellow";
    return "white";
  });

  // Custom display
  const [direction, setDirection] = useState<"clockwise" | "anticlockwise">("clockwise");
  const [startRing, setStartRing] = useState<"outer" | "inner">("outer");
  const [length, setLength] = useState<1 | 2 | 3>(1);

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
                onClick={() => onUpload?.(data.id)}
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
          <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
            <option>{data.metrics.primary}</option>
          </select>
          <button className="text-gray-400 hover:text-gray-600">
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <KPIChart data={data.chartData} title={data.metrics.primary} color={data.color} />

        <ActionPlanSection actionPlans={data.actionPlans} counts={data.actionPlanCounts} categoryId={data.id} />

        {data.metrics.secondary && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{data.metrics.secondary}</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <KPIChart data={data.chartData} title={data.metrics.secondary} color={data.color} type="line" />
          </div>
        )}
      </div>
    </Card>
  );
}
