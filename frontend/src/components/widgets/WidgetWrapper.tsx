import React, { useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import type { WidgetConfig } from '../../types/dashboard';
import type { Order } from '../../lib/dataEngine';
import {
  KpiWidget, BarChartWidget, LineChartWidget, AreaChartWidget,
  ScatterChartWidget, PieChartWidget, TableWidget,
} from './WidgetContent';

interface WidgetWrapperProps {
  widget: WidgetConfig;
  orders: Order[];
  onDelete: (id: string) => void;
  onSettings: (widget: WidgetConfig) => void;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, orders, onDelete, onSettings }) => {
  const [hovered, setHovered] = useState(false);

  const renderContent = () => {
    switch (widget.type) {
      case 'kpi':           return <KpiWidget config={widget} data={orders} />;
      case 'bar-chart':     return <BarChartWidget config={widget} data={orders} />;
      case 'line-chart':    return <LineChartWidget config={widget} data={orders} />;
      case 'area-chart':    return <AreaChartWidget config={widget} data={orders} />;
      case 'scatter-chart': return <ScatterChartWidget config={widget} data={orders} />;
      case 'pie-chart':     return <PieChartWidget config={widget} data={orders} />;
      case 'table':         return <TableWidget config={widget} data={orders} />;
      default:              return null;
    }
  };

  return (
    <div
      className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group transition-shadow hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action toolbar */}
      {hovered && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1 border border-gray-100">
          <button
            className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Settings"
            onClick={(e) => { e.stopPropagation(); onSettings(widget); }}
          >
            <Settings size={14} />
          </button>
          <button
            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove "${widget.title}"?`)) onDelete(widget.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default WidgetWrapper;
