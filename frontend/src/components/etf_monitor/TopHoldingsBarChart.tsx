import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import type { Constituent } from '../../types/etf_data';

interface Props {
    holdings: Constituent[];
}

interface TooltipPayload {
    payload: {
        name: string;
        size: number;
        weight: string | number;
        price: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
        <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-black">
            <p className="text-base font-black text-black mb-2">{label}</p>
            <div className="space-y-1.5 text-sm text-black font-medium">
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Total Value</span>
                <span className="font-mono font-bold text-[#0078c1]">${Number(data.size).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Weight</span>
                <span className="font-mono font-bold">{data.weight}%</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Latest close Price</span>
                <span className="font-mono font-bold">${Number(data.price).toFixed(2)}</span>
            </div>
            </div>
        </div>
        );
  }
  return null;
};

export const TopHoldingsBarChart = ({ holdings }: Props) => {
    const chartData = useMemo(() => {
        if (!holdings || holdings.length === 0) return [];
        return holdings.map((item) => ({
        name: item.name,
        size: item.holding_size,
        weight: (item.weight * 100).toFixed(2),
        price: item.latest_close_price
        }));
    }, [holdings]);

    const formatCompactNumber = (value: unknown): string => {
        const num = Number(value);
        if (isNaN(num)) return '';
        return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'USD' }).format(num);
    };

    if (chartData.length === 0) {
        return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic text-sm">No holdings data available.</p>
        </div>
        );
    }

    return (
        <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 55, bottom: 0 }}
            >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#d1d5db" />
            
            <XAxis 
                type="number" 
                tickFormatter={formatCompactNumber} 
                tick={{ fontSize: 11, fill: '#000000', fontWeight: 600 }}
                axisLine={{ stroke: '#000000' }}
            /> 

            <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={{ stroke: '#000000' }}
                tickLine={false}
                tick={{ 
                    fontSize: 12, 
                    fill: '#000000', 
                    fontWeight: 800,
                    textAnchor: 'end',
                }}
                width={30}
                dx={-10}
                tickFormatter={(value) => {
                    return value.length > 4 ? `${value.substring(0, 4)}...` : value;
                }}
            />

            <Tooltip 
                cursor={{ fill: '#f1f5f9' }} 
                content={<CustomTooltip />} 
            />

            <Bar dataKey="size" fill="#0078c1" radius={[0, 6, 6, 0]} barSize={40} animationDuration={500}>
                <LabelList 
                dataKey="size" 
                position="right" 
                formatter={formatCompactNumber}
                style={{ fontSize: 12, fill: '#000000', fontWeight: 800 }}
                offset={10}
                /> 
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
};