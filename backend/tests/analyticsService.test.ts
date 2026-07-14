import { describe, expect, it } from 'vitest';
import { calculateSalesForecast } from '../src/services/analyticsService.js';

describe('calculateSalesForecast', () => {
  it('projects the next month from recent revenue trends', () => {
    const forecast = calculateSalesForecast([
      { month: 'Jan', revenue: 1200 },
      { month: 'Feb', revenue: 1400 },
      { month: 'Mar', revenue: 1600 },
      { month: 'Apr', revenue: 1800 },
      { month: 'May', revenue: 2100 },
      { month: 'Jun', revenue: 2400 },
    ]);

    expect(forecast.nextMonthRevenue).toBeGreaterThan(2400);
    expect(forecast.projectedOrders).toBeGreaterThan(0);
    expect(forecast.trend).toBe('upward');
  });
});
