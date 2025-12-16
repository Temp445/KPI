"use client";

import { useDashboardStore } from "@/stores/dashboardStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import CustomMonthPicker from "./CustomMonthPicker";
import { clampEndMonthYear, months } from "@/utils/clampEndMonthYear";
import { useToast } from "@/hooks/use-toast";
import ToggleSetting from "../FiltersButton/ToggleSetting";

interface DashboardFiltersProps {
  toggleOverflow: () => void;
  allowOverflow: boolean;
  maxLength: number;
  kpiData: any[];
  setMaxLength: React.Dispatch<React.SetStateAction<number>>;
}


const departments = [
  "All Departments",
  "Manufacturing",
  "Quality Control",
  "Operations",
  "Human Resources",
];

export function DashboardFilters({
  toggleOverflow,
  allowOverflow,
  maxLength,
  kpiData,
  setMaxLength,
}: DashboardFiltersProps) {  
  const { toast } = useToast();

  const { filters, setFilters } = useDashboardStore();
  const startIndex = months.indexOf(filters.startMonth);
  const endIndex = months.indexOf(filters.endMonth);

  const monthRange = endIndex - startIndex + 1;

  useEffect(() => {
    const sameYear = filters.startYear === filters.endYear;
    const isSingleMonth = monthRange === 1;

    if (sameYear && isSingleMonth && filters.timePeriod !== "daily") {
      setFilters({ timePeriod: "daily" });
      return;
    }

    if ((!sameYear || !isSingleMonth) && filters.timePeriod === "daily") {
      setFilters({ timePeriod: "weekly" });
      return;
    }

    if (sameYear && isSingleMonth && filters.timePeriod === "monthly") {
      setFilters({ timePeriod: "daily" });
    }
  }, [filters.startYear, filters.endYear, monthRange]);

  const isSingleMonthSameYear =
    filters.startYear === filters.endYear &&
    filters.startMonth === filters.endMonth;

  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
   <div className="flex flex-col md:flex-row gap-3">
       <Select
        value={filters.department}
        onValueChange={(value) => setFilters({ department: value })}
      >
        <SelectTrigger className="w-[200px] bg-white dark:bg-gray-900 border-gray-300">
          <SelectValue placeholder="Select Department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <CustomMonthPicker
        selectedMonth={filters.startMonth}
        selectedYear={filters.startYear}
        onChange={(month, year) => {
          let newStartMonth = month;
          let newStartYear = year;

          if (year !== filters.startYear && month === filters.startMonth) {
            newStartMonth = "January";
          }

          const { newEndMonth, newEndYear } = clampEndMonthYear(
            newStartMonth,
            newStartYear,
            filters.endMonth,
            filters.endYear
          );

          let fixedEndYear = newEndYear;
          if (newStartYear > filters.endYear) {
            fixedEndYear = newStartYear;
          }

          setFilters({
            startMonth: newStartMonth,
            startYear: newStartYear,
            endMonth: newEndMonth,
            endYear: fixedEndYear,
          });
        }}
      />

      <CustomMonthPicker
        selectedMonth={filters.endMonth}
        selectedYear={filters.endYear}
        onChange={(month, year) => {
          let safeEndYear = year;
          let safeEndMonth = month;

          if (year < filters.startYear) {
            safeEndYear = filters.startYear;
            safeEndMonth = filters.startMonth;
          }

          if (
            safeEndYear === filters.startYear &&
            months.indexOf(safeEndMonth) < months.indexOf(filters.startMonth)
          ) {
            safeEndMonth = filters.startMonth;
          }

          const { newEndMonth, newEndYear, exceeded } = clampEndMonthYear(
            filters.startMonth,
            filters.startYear,
            safeEndMonth,
            safeEndYear
          );

          if (exceeded) {
            toast({
              title: "Invalid filter range",
              description: "Please choose a range within 12 months.",
              variant: "destructive",
            });
          }

          setFilters({
            endMonth: newEndMonth,
            endYear: newEndYear,
          });
        }}
      />
      </div>
   </div>

   <div className="flex gap-4">
       <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 rounded-md overflow-hidden">
        <Button
        type="button"
          variant="ghost"
          size="sm"
          className={`rounded-none px-4 ${
            filters?.startYear === filters?.endYear && monthRange === 1
              ? filters.timePeriod === "daily"
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-900"
              : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800"
          }`}
          onClick={() =>
            monthRange === 1 && setFilters({ timePeriod: "daily" })
          }
          disabled={monthRange !== 1}
        >
          Daily
        </Button>

        <Button
        type="button"
          variant="ghost"
          size="sm"
          className={`rounded-none px-4 ${
            filters.timePeriod === "weekly"
              ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-900"
          }`}
          onClick={() => setFilters({ timePeriod: "weekly" })}
        >
          Weekly
        </Button>

        <Button
        type="button"
          variant="ghost"
          size="sm"
          className={`rounded-none px-4 ${
            !isSingleMonthSameYear && filters.timePeriod === "monthly"
              ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              : isSingleMonthSameYear
              ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800"
              : "hover:bg-gray-100 dark:hover:bg-gray-900"
          }`}
          onClick={() =>
            !isSingleMonthSameYear && setFilters({ timePeriod: "monthly" })
          }
          disabled={isSingleMonthSameYear}
        >
          Monthly
        </Button>
      </div>
        
        <ToggleSetting
        onToggleOverflow={toggleOverflow}
        allowOverflow={allowOverflow}
        maxLength={maxLength}
        setMaxLength={setMaxLength}
        kpiDataLength={kpiData.length}
      />
   </div>
    </div>
  );
}
