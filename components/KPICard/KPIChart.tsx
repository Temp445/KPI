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
  metricType?: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export function KPIChart({ data, title, metricType, color, type = 'bar' }: KPIChartProps) {
  return (
    <div style={{ width: '100%', height: 300, boxSizing: 'border-box', fontSize: '10px', textAlign: 'left', marginLeft: '0' }}>
      <ResponsiveContainer  width="100%" height="100%">
        {type === 'bar' ? (
          
          <BarChart data={data}  margin={{ top: 30, right: 5, left: -20, bottom: 5 }}>
              <text
                   y={10}
                   textAnchor="start"
                   dominantBaseline="middle"
                   style={{
                     fontSize: 14,
                     fontWeight: 600,
                     fill: "#374151",
                   }}
                 >
                   {title}
                 </text>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
             padding={{ left: 10, right: 20 }}
             
            />
            <YAxis  tick={{ fontSize: 10 }} stroke="#999" 
            label={{
              value: metricType || "Count",    
              angle: -90,        
              position: "outsideLeft",
              dx: -5,
              style: { textAnchor: "middle", fontSize: 12, fill: "#555", paddingRight: '20px' },
              }}
            />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Bar dataKey="goal" fill="#2aaaf4"  name="Goal" />
            )}
            {data[0]?.meetGoal !== undefined && (
              <Bar dataKey="meetGoal" fill="#10b981" name="Meet Goal" />
            )}
            {data[0]?.behindGoal !== undefined && (
              <Bar dataKey="behindGoal" fill="#f59e0b" name="Behind Goal" />
            )}
            {data[0]?.atRisk !== undefined && (
              <Bar dataKey="atRisk" fill="#ef4444" name="At Risk" />
            )}
            <Bar dataKey="value" fill={color} name="Value" />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 5, left: -22, bottom: 5 }} >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
              padding={{ left: 0, right: 0 }}
            />
             <YAxis
               tick={{ fontSize: 10 }}
               stroke="#999"
               label={{
                 value: metricType || "Count",
                 angle: -90,
                 position: "insideLeft",
                 dx: 20,
                 style: { textAnchor: "middle", fontSize: 12, fill: "#555" },
               }}
             />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Line
                type="monotone"
                dataKey="goal"
                stroke="#2aaaf4"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Goal"
              />
            )}
            {data[0]?.goal !== undefined && (
              <Line
                type="monotone"
                dataKey="meetGoal"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Meet Goal"
              />
            )}
            {data[0]?.goal !== undefined && (
              <Line
                type="monotone"
                dataKey="behindGoal"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Behind Goal"
              />
            )}
           
            {data[0]?.goal !== undefined && (
              <Line
                type="monotone"
                dataKey="atRisk"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="At Risk"
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
          <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              stroke="#999"
              padding={{ left: 0, right: 0 }}
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#999"
              label={{
              value: metricType || "Count",  
              angle: -90,
              position: "outsideLeft",
              style: { textAnchor: "middle", fontSize: 12, fill: "#555" }
            }} />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
            />
            {data[0]?.goal !== undefined && (
              <Area
                type="monotone"
                dataKey="goal"
                stroke="#2aaaf4"
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
