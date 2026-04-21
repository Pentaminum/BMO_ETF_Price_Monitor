import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Area,
  AreaChart,
} from 'recharts';

interface ETFPriceChartProps {
  chartData: Record<string, number>;
}

interface TooltipPayloadEntry {
  value: number;
  payload: { date: string; price: number; };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// custom tooltip
const PriceTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-black">
        <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-mono font-black text-[#0078c1]">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export const ETFPriceChart = ({ chartData }: ETFPriceChartProps) => {
  const formattedData = useMemo(() => {
    if (!chartData || typeof chartData !== 'object' || Object.keys(chartData).length === 0) return [];
    
    return Object.entries(chartData)
      .map(([date, price]) => ({
        date,
        price: Number(price),
      }))
      .filter(item => !isNaN(item.price))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [chartData]);

  const domain = useMemo(() => {
    if (formattedData.length === 0) return [0, 100];
    const prices = formattedData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const padding = range === 0 ? 10 : range * 0.15; 
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [formattedData]);

  if (formattedData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <p className="text-slate-400 text-sm font-medium italic">No price history available.</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ outline: 'none' }}>
      <ResponsiveContainer width="100%" aspect={2.5}>
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
          style={{ outline: 'none' }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#000000', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            }}
          />
          
          <YAxis 
            domain={domain}
            orientation="right"
            tick={{ fontSize: 11, fill: '#000000', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />

          <Tooltip 
            content={<PriceTooltip />} 
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#0078c1" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#0078c1' }}
            animationDuration={1000}
          />

          <Brush 
            dataKey="date" 
            height={40} 
            stroke="#cbd5e1"
            fill="#ffffff"
            tickFormatter={() => ""}
            travellerWidth={10}
          >
            <AreaChart data={formattedData}>
              <Area type="monotone" dataKey="price" stroke="#94a3b8" fill="#f1f5f9" />
            </AreaChart>
          </Brush>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};