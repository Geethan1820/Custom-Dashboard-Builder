import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { Save, RefreshCw, LayoutDashboard as LayoutIcon, CheckCircle, Calendar } from 'lucide-react';
import type { WidgetConfig, GridLayoutItem, WidgetType } from '../types/dashboard';
import { WIDGET_CATALOG } from '../types/dashboard';
import WidgetSidebar from '../components/WidgetSidebar';
import GridCanvas from '../components/GridCanvas';
import WidgetSettingsPanel from '../components/WidgetSettingsPanel';
import api from '../lib/api';
import type { Order } from '../lib/dataEngine';

const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layout, setLayout] = useState<GridLayoutItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settingsWidget, setSettingsWidget] = useState<WidgetConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load dashboard on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/orders')
        ]);
        setLayout(dashRes.data.layout || []);
        setWidgets(dashRes.data.widgets || []);
        setOrders(ordersRes.data || []);
      } catch {
        /* no saved dashboard yet */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Polling for new orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (dateFilter === 'today') return orderDate >= startOfToday;
      if (dateFilter === '7d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return orderDate >= d;
      }
      if (dateFilter === '30d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return orderDate >= d;
      }
      return true;
    });
  }, [orders, dateFilter]);

  const handleAddWidget = useCallback((type: WidgetType) => {
    const catalog = WIDGET_CATALOG.find(c => c.type === type)!;
    const id = nanoid(8);
    const newWidget: WidgetConfig = {
      id,
      type,
      title: catalog.label,
      color: '#6366f1',
      ...catalog.defaultConfig,
    };
    const newLayoutItem: GridLayoutItem = {
      i: id,
      x: (layout.length * 3) % 12,
      y: Infinity,
      w: catalog.defaultW,
      h: catalog.defaultH,
      minW: 2,
      minH: 2,
    };
    setWidgets(prev => [...prev, newWidget]);
    setLayout(prev => [...prev, newLayoutItem]);
  }, [layout]);

  const handleDeleteWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayout(prev => prev.filter(l => l.i !== id));
    if (settingsWidget?.id === id) setSettingsWidget(null);
  }, [settingsWidget]);

  const handleUpdateSettings = useCallback((updated: WidgetConfig) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/dashboard', { layout, widgets });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = useCallback((_layout: GridLayoutItem[], item: GridLayoutItem, e: Event) => {
    const type = (e as any).dataTransfer?.getData('widgetType') as WidgetType || 'kpi';
    const catalog = WIDGET_CATALOG.find(c => c.type === type)!;

    const id = nanoid(8);
    const newWidget: WidgetConfig = {
      id,
      type,
      title: catalog.label,
      color: '#6366f1',
      ...catalog.defaultConfig,
    };

    setWidgets(prev => [...prev, newWidget]);
    setLayout(prev => {
      const filtered = prev.filter(l => l.i !== 'dropping');
      return [...filtered, {
        ...item,
        i: id,
        w: catalog.defaultW,
        h: catalog.defaultH,
        minW: 2,
        minH: 2,
      }];
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Toolbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <LayoutIcon size={18} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Dashboard Builder</h1>
          </div>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar size={14} className="text-gray-400" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="text-xs font-semibold text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none uppercase tracking-wider"
              >
                <option value="all">All Time Data</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
              {widgets.length} Widget{widgets.length !== 1 ? 's' : ''}
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100 animate-pulse">
                <RefreshCw size={10} className="animate-spin" />
                Syncing...
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { if(confirm('Clear entire dashboard?')) { setWidgets([]); setLayout([]); } }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all shadow-md active:scale-95 ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            } disabled:opacity-50`}
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : saved ? 'Layout Saved!' : 'Save Dashboard'}
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex flex-1 min-h-0">
        <WidgetSidebar onAddWidget={handleAddWidget} />
        <div className="flex-1 bg-gray-50 overflow-auto scroll-smooth">
          <GridCanvas
            layout={layout}
            widgets={widgets}
            orders={filteredOrders}
            onLayoutChange={setLayout}
            onDeleteWidget={handleDeleteWidget}
            onSettingsWidget={setSettingsWidget}
            onDrop={handleDrop}
          />
        </div>
        {settingsWidget && (
          <WidgetSettingsPanel
            widget={settingsWidget}
            onClose={() => setSettingsWidget(null)}
            onSave={handleUpdateSettings}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
