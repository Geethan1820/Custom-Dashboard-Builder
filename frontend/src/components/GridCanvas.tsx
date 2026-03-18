import React from 'react';
import * as RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { WidgetConfig, GridLayoutItem } from '../types/dashboard';
import WidgetWrapper from './widgets/WidgetWrapper';
import type { Order } from '../lib/dataEngine';

// Defensive import that handles both ESM and CJS bundling
const getRGL = () => {
  const rgl = (RGL as any).default || RGL;
  const Responsive = rgl.Responsive || (RGL as any).Responsive;
  const WidthProvider = rgl.WidthProvider || (RGL as any).WidthProvider;
  return { Responsive, WidthProvider };
};

const { Responsive, WidthProvider } = getRGL();

// Ensure WidthProvider is a function before calling it
const ResponsiveGridLayout = typeof WidthProvider === 'function' 
  ? WidthProvider(Responsive) 
  : Responsive;

if (typeof WidthProvider !== 'function') {
  console.warn('Dashboard Builder: WidthProvider not found in react-grid-layout. Grid might not be responsive.');
}

interface GridCanvasProps {
  layout: GridLayoutItem[];
  widgets: WidgetConfig[];
  orders: Order[];
  onLayoutChange: (layout: GridLayoutItem[]) => void;
  onDeleteWidget: (id: string) => void;
  onSettingsWidget: (widget: WidgetConfig) => void;
  onDrop: (layout: GridLayoutItem[], item: GridLayoutItem, e: Event) => void;
}

const BREAKPOINTS = { lg: 1200, md: 900, sm: 600, xs: 480, xxs: 0 };
const COLS       = { lg: 12,    md: 8,    sm: 6,   xs: 4,   xxs: 2 };
const ROW_HEIGHT = 80;

const GridCanvas: React.FC<GridCanvasProps> = ({
  layout,
  widgets,
  orders,
  onLayoutChange,
  onDeleteWidget,
  onSettingsWidget,
  onDrop,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 relative min-h-[600px]">
      {/* Empty State Overlay */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 pointer-events-none">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-4xl">📐</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your canvas is empty</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Drag a widget from the sidebar or click "Add" to get started. 
            The 12-column grid will help you align your dashboard perfectly.
          </p>
        </div>
      )}

      <style>{`
        .react-resizable-handle {
          z-index: 50 !important;
          background-color: #6366f1;
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: 4px;
        }
        .react-grid-item:hover .react-resizable-handle {
          opacity: 0.6;
        }
        .react-grid-item:hover .react-resizable-handle:hover {
          opacity: 1;
          background-color: #4f46e5;
        }
        .react-resizable-handle-se {
          width: 12px;
          height: 12px;
          bottom: 4px !important;
          right: 4px !important;
          cursor: se-resize;
        }
        .react-resizable-handle-e {
          width: 6px;
          height: 40px;
          top: 50% !important;
          margin-top: -20px;
          right: 2px !important;
          cursor: e-resize;
        }
        .react-resizable-handle-s {
          height: 6px;
          width: 40px;
          left: 50% !important;
          margin-left: -20px;
          bottom: 2px !important;
          cursor: s-resize;
        }
      `}</style>

      <ResponsiveGridLayout
        className="layout min-h-[500px]"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout }}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        onLayoutChange={(currentLayout: any) => onLayoutChange(currentLayout as GridLayoutItem[])}
        onDrop={onDrop}
        isDroppable={true}
        droppingItem={{ i: 'dropping', w: 2, h: 2 }}
        draggableHandle=".widget-drag-handle"
        resizeHandles={['s', 'e', 'se']}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map((widget) => {
          const gridItem = layout.find(l => l.i === widget.id);
          return (
            <div key={widget.id} data-grid={gridItem} className="cursor-default">
              {/* Drag handle restricted to top area to avoid covering resize handles */}
              <div className="widget-drag-handle absolute top-0 left-0 right-0 h-10 cursor-grab z-10" />
              <WidgetWrapper
                widget={widget}
                orders={orders}
                onDelete={onDeleteWidget}
                onSettings={onSettingsWidget}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default GridCanvas;
