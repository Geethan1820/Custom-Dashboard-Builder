import type { WidgetConfig } from '../types/dashboard';

export interface Order {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const aggregateData = (data: Order[], config: WidgetConfig) => {
  if (!data || data.length === 0) return 0;

  const metric = config.metric as keyof Order;
  const values = data.map(item => Number(item[metric]) || 0);

  switch (config.aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    case 'count':
      return data.length;
    case 'min':
      return values.length > 0 ? Math.min(...values) : 0;
    case 'max':
      return values.length > 0 ? Math.max(...values) : 0;
    default:
      return 0;
  }
};

export const groupData = (data: Order[], config: WidgetConfig) => {
  if (!data || data.length === 0) return [];

  const xAxis = config.xAxis as keyof Order;
  const yAxis = config.yAxis as keyof Order;
  const aggregation = config.aggregation || 'sum';

  const groups: Record<string, number[]> = {};

  data.forEach(item => {
    let key = String(item[xAxis]);
    // Format date if needed
    if (xAxis === 'createdAt') {
      key = new Date(key).toLocaleDateString();
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(Number(item[yAxis]) || 0);
  });

  return Object.entries(groups).map(([name, values]) => {
    let value = 0;
    switch (aggregation) {
      case 'sum':   value = values.reduce((a, b) => a + b, 0); break;
      case 'avg':   value = values.reduce((a, b) => a + b, 0) / values.length; break;
      case 'count': value = values.length; break;
      case 'min':   value = Math.min(...values); break;
      case 'max':   value = Math.max(...values); break;
    }
    return { name, value };
  }).sort((a, b) => a.name.localeCompare(b.name));
};
