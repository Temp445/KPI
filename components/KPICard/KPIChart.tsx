'use client';

import { WeeklyData } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface KPIChartProps {
  data: WeeklyData[];
  title: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export function KPIChart({ data, title, color, type = 'bar' }: KPIChartProps) {
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#999" />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Bar dataKey="goal" fill="#10b981" name="Goal" />
            )}
            {data[0]?.meetGoal !== undefined && (
              <Bar dataKey="meetgoal" fill="#10b981" name="Meet Goal" />
            )}
            {data[0]?.behindGoal !== undefined && (
              <Bar dataKey="behindgoal" fill="#f59e0b" name="Behind Goal" />
            )}
            {data[0]?.atRisk !== undefined && (
              <Bar dataKey="atrisk" fill="#ef4444" name="At Risk" />
            )}
            <Bar dataKey="value" fill={color} name="Value" />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#999" />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Line
                type="monotone"
                dataKey="goal"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Goal"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Value"
            />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#999" />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Area
                type="monotone"
                dataKey="goal"
                stroke="#10b981"
                fill="#10b98133"
                name="Goal"
              />
            )}
            {data[0]?.meetGoal !== undefined && (
              <Area
                type="monotone"
                dataKey="meetGoal"
                stroke="#10b981"
                fill="#10b98166"
                name="Meet Goal"
              />
            )}
            {data[0]?.atRisk !== undefined && (
              <Area
                type="monotone"
                dataKey="atRisk"
                stroke="#ef4444"
                fill="#ef444466"
                name="At Risk"
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`${color}66`}
              name="Value"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
