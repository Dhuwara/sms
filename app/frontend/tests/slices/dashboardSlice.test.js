import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer, { fetchAdminStats } from '../../src/store/slices/dashboardSlice';

// Mock the service
vi.mock('../../src/services/staffService', () => ({
  fetchAdminStatsApi: vi.fn(),
}));

const { fetchAdminStatsApi } = await import('../../src/services/staffService');

describe('dashboardSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { dashboard: dashboardReducer },
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = store.getState().dashboard;

    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.stats.total_students).toBe(0);
    expect(state.stats.total_classes).toBe(0);
    expect(state.stats.total_teachers).toBe(0);
    expect(state.stats.student_present_today).toBe(0);
    expect(state.stats.student_absent_today).toBe(0);
    expect(state.stats.staff_present_today).toBe(0);
    expect(state.stats.staff_late_today).toBe(0);
    expect(state.stats.staff_absent_today).toBe(0);
  });

  it('should set loading state when fetching stats', () => {
    // Dispatch pending action manually
    store.dispatch({ type: fetchAdminStats.pending.type });

    const state = store.getState().dashboard;
    expect(state.status).toBe('loading');
  });

  it('should update stats on successful fetch', () => {
    const mockStats = {
      total_students: 250,
      total_classes: 10,
      total_teachers: 20,
      total_staff: 30,
      pending_fees: 50000,
      student_present_today: 200,
      student_absent_today: 50,
      staff_present_today: 25,
      staff_late_today: 3,
      staff_absent_today: 2,
    };

    store.dispatch({
      type: fetchAdminStats.fulfilled.type,
      payload: mockStats,
    });

    const state = store.getState().dashboard;
    expect(state.status).toBe('succeeded');
    expect(state.stats.total_students).toBe(250);
    expect(state.stats.total_classes).toBe(10);
    expect(state.stats.student_present_today).toBe(200);
    expect(state.stats.staff_late_today).toBe(3);
  });

  it('should handle fetch failure', () => {
    store.dispatch({
      type: fetchAdminStats.rejected.type,
      error: { message: 'Network Error' },
    });

    const state = store.getState().dashboard;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network Error');
  });

  it('should handle full fetch lifecycle', async () => {
    const mockData = {
      total_students: 100,
      total_classes: 5,
      total_teachers: 10,
      total_staff: 15,
      pending_fees: 20000,
      student_present_today: 80,
      student_absent_today: 20,
      staff_present_today: 12,
      staff_late_today: 1,
      staff_absent_today: 2,
    };

    fetchAdminStatsApi.mockResolvedValueOnce(mockData);

    await store.dispatch(fetchAdminStats());

    const state = store.getState().dashboard;
    expect(state.status).toBe('succeeded');
    expect(state.stats).toEqual(mockData);
  });

  it('should handle rejected fetch lifecycle', async () => {
    fetchAdminStatsApi.mockRejectedValueOnce(new Error('Server down'));

    await store.dispatch(fetchAdminStats());

    const state = store.getState().dashboard;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Server down');
  });
});
