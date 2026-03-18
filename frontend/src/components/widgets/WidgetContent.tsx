import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import type { WidgetConfig } from '../../types/dashboard';
import { aggregateData, groupData, type Order } from '../../lib/dataEngine';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#14b8a6'];

interface WidgetProps {
  config: WidgetConfig;
  data: Order[];
}

export function KpiWidget({ config, data }: WidgetProps) {
  const value = aggregateData(data, config);
  const isCurrency = config.format === 'currency';
  
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: config.precision ?? 0 }).format(value)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: config.precision ?? 0 }).format(value);

  return (
    <div className="h-full flex flex-col justify-between p-4">
      <p className="text-sm font-medium text-gray-500">{config.title}</p>
      <div>
        <p className="text-3xl font-bold text-gray-900 truncate" title={formattedValue}>{formattedValue}</p>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {config.aggregation || 'sum'} of {config.metric || 'totalAmount'}
        </p>
      </div>
      <div className="h-1.5 rounded-full mt-2" style={{ backgroundColor: config.color || '#6366f1' }} />
    </div>
  );
}

export function BarChartWidget({ config, data }: WidgetProps) {
  const chartData = groupData(data, config);
  return (
    <div className="h-full flex flex-col p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{config.title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill={config.color || '#6366f1'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LineChartWidget({ config, data }: WidgetProps) {
  const chartData = groupData(data, config);
  return (
    <div className="h-full flex flex-col p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{config.title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={config.color || '#8b5cf6'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AreaChartWidget({ config, data }: WidgetProps) {
  const chartData = groupData(data, config);
  const gradId = `areaGrad-${config.id}`;
  const color = config.color || '#6366f1';

  return (
    <div className="h-full flex flex-col p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{config.title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradId})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScatterChartWidget({ config, data }: WidgetProps) {
  const xAxis = config.xAxis as keyof Order || 'quantity';
  const yAxis = config.yAxis as keyof Order || 'unitPrice';
  const chartData = data.map(item => ({
    x: Number(item[xAxis]),
    y: Number(item[yAxis]),
    name: `${item.firstName} ${item.lastName}`
  }));

  return (
    <div className="h-full flex flex-col p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{config.title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="x" tick={{ fontSize: 10 }} name={xAxis} />
            <YAxis dataKey="y" tick={{ fontSize: 10 }} name={yAxis} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={chartData} fill={config.color || '#ec4899'} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieChartWidget({ config, data }: WidgetProps) {
  const chartData = groupData(data, config);
  return (
    <div className="h-full flex flex-col p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{config.title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              cx="50%" 
              cy="50%" 
              innerRadius="40%"
              outerRadius="70%" 
              dataKey="value" 
              label={config.showLabels ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : undefined}
            >
              {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            {config.showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TableWidget({ config, data }: WidgetProps) {
  const columns = config.columns || ['id', 'product', 'totalAmount', 'status'];
  
  const processedData = React.useMemo(() => {
    let result = [...data];
    
    // Sorting
    if (config.sortField) {
      const field = config.sortField as keyof Order;
      const order = config.sortOrder === 'asc' ? 1 : -1;
      
      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    }
    
    // Pagination
    const limit = config.pageSize || 10;
    return result.slice(0, limit);
  }, [data, config.sortField, config.sortOrder, config.pageSize]);

  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">{config.title}</p>
        <span className="text-[10px] text-gray-400 font-medium">Top {processedData.length} records</span>
      </div>
      <div className="flex-1 overflow-auto border rounded-xl border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-[10px] sm:text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/80 backdrop-blur-sm text-gray-500 border-b border-gray-100">
              {columns.map(col => (
                <th key={col} className="px-4 py-2.5 text-left font-bold uppercase tracking-widest">{col.replace(/([A-Z])/g, ' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {processedData.map((row: any) => (
              <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-4 py-2 text-gray-600 truncate max-w-[150px]">
                    {col === 'totalAmount' || col === 'unitPrice' 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row[col])
                      : col === 'createdAt'
                        ? new Date(row[col]).toLocaleDateString()
                        : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
