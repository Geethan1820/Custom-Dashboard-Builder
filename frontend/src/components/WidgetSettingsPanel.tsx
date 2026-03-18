import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { WidgetConfig, AggregationType, FormatType } from '../types/dashboard';

interface WidgetSettingsPanelProps {
  widget: WidgetConfig | null;
  onClose: () => void;
  onSave: (updated: WidgetConfig) => void;
}

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];

const METRIC_OPTIONS = [
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unitPrice', label: 'Unit Price' },
];

const AGGREGATION_OPTIONS: { value: AggregationType; label: string }[] = [
  { value: 'sum',   label: 'Sum' },
  { value: 'avg',   label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min',   label: 'Minimum' },
  { value: 'max',   label: 'Maximum' },
];

const X_AXIS_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Date' },
  { value: 'country', label: 'Country' },
];

const WidgetSettingsPanel: React.FC<WidgetSettingsPanelProps> = ({ widget, onClose, onSave }) => {
  const [localWidget, setLocalWidget] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    if (widget) {
      setLocalWidget({ ...widget });
    }
  }, [widget]);

  if (!widget || !localWidget) return null;

  const updateField = (field: keyof WidgetConfig, value: any) => {
    setLocalWidget(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (localWidget) {
      onSave(localWidget);
      onClose();
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-800">Widget Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* General Settings */}
        <section className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              General
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={localWidget.title}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Accent Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateField('color', c)}
                      className={`w-6 h-6 rounded-md border-2 transition-all ${localWidget.color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Binding Settings */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Data Configuration
          </label>
          
          {(localWidget.type === 'kpi' || localWidget.type.includes('chart')) && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Metric (Y-Axis Value)</label>
                <select 
                  value={localWidget.type === 'kpi' ? localWidget.metric : localWidget.yAxis}
                  onChange={e => updateField(localWidget.type === 'kpi' ? 'metric' : 'yAxis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none appearance-none cursor-pointer"
                >
                  {METRIC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Aggregation</label>
                <select 
                  value={localWidget.aggregation}
                  onChange={e => updateField('aggregation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                >
                  {AGGREGATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {localWidget.type.includes('chart') && localWidget.type !== 'scatter-chart' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Group By (X-Axis)</label>
                  <select 
                    value={localWidget.xAxis}
                    onChange={e => updateField('xAxis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  >
                    {X_AXIS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {localWidget.type === 'kpi' && (
            <div className="space-y-3 pt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Format</label>
                <div className="flex bg-gray-50 p-1 rounded-lg">
                  {(['number', 'currency'] as FormatType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => updateField('format', f)}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${localWidget.format === f ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Decimal Precision ({localWidget.precision})</label>
                <input 
                  type="range" min="0" max="4" step="1"
                  value={localWidget.precision || 0}
                  onChange={e => updateField('precision', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          {(localWidget.type === 'pie-chart' || localWidget.type === 'bar-chart') && (
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={localWidget.showLabels}
                  onChange={e => updateField('showLabels', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-xs text-gray-600 group-hover:text-gray-900">Show Data Labels</span>
              </label>
              {localWidget.type === 'pie-chart' && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={localWidget.showLegend}
                    onChange={e => updateField('showLegend', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">Show Legend</span>
                </label>
              )}
            </div>
          )}

          {localWidget.type === 'table' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Display Columns</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {['id', 'firstName', 'lastName', 'email', 'product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdAt'].map(col => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={(localWidget.columns || []).includes(col)}
                        onChange={e => {
                          const current = localWidget.columns || [];
                          const updated = e.target.checked 
                            ? [...current, col]
                            : current.filter(c => c !== col);
                          updateField('columns', updated);
                        }}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-[11px] text-gray-600 group-hover:text-gray-900 capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Items Per Page</label>
                  <input 
                    type="number" min="1" max="50"
                    value={localWidget.pageSize || 10}
                    onChange={e => updateField('pageSize', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort Order</label>
                  <select 
                    value={localWidget.sortOrder || 'desc'}
                    onChange={e => updateField('sortOrder', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Sort By Column</label>
                <select 
                  value={localWidget.sortField || 'createdAt'}
                  onChange={e => updateField('sortField', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                >
                  {['id', 'firstName', 'lastName', 'email', 'product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdAt'].map(col => (
                    <option key={col} value={col}>{col.replace(/([A-Z])/g, ' $1')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          Apply Settings
        </button>
      </div>
    </aside>
  );
};

export default WidgetSettingsPanel;
