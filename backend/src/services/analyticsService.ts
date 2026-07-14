export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface ForecastSummary {
  nextMonthRevenue: number;
  projectedOrders: number;
  trend: 'upward' | 'downward' | 'stable';
}

export const calculateSalesForecast = (history: RevenuePoint[]): ForecastSummary => {
  if (!history.length) {
    return { nextMonthRevenue: 0, projectedOrders: 0, trend: 'stable' };
  }

  const recent = history.slice(-6);
  const first = recent[0].revenue;
  const last = recent[recent.length - 1].revenue;
  const growth = first === 0 ? 0 : ((last - first) / first) * 100;

  const nextMonthRevenue = Math.round(last * (1 + growth / 100 + 0.03));
  const projectedOrders = Math.max(1, Math.round(nextMonthRevenue / 180));

  let trend: ForecastSummary['trend'] = 'stable';
  if (growth > 5) trend = 'upward';
  if (growth < -5) trend = 'downward';

  return { nextMonthRevenue, projectedOrders, trend };
};
