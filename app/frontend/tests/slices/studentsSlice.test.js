import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import studentsReducer, { fetchStudents } from '../../src/store/slices/studentsSlice';

vi.mock('../../src/services/studentsService', () => ({
  fetchStudentsApi: vi.fn(),
}));

const { fetchStudentsApi } = await import('../../src/services/studentsService');

describe('studentsSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { students: studentsReducer },
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = store.getState().students;
    expect(state.list).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('should set loading state when fetching', () => {
    store.dispatch({ type: fetchStudents.pending.type });
    expect(store.getState().students.status).toBe('loading');
  });

  it('should populate list on successful fetch', () => {
    const mockStudents = [
      { _id: '1', name: 'Alice', roll_no: 'S001', class: 'Grade 5-A' },
      { _id: '2', name: 'Bob', roll_no: 'S002', class: 'Grade 5-B' },
    ];

    store.dispatch({
      type: fetchStudents.fulfilled.type,
      payload: mockStudents,
    });

    const state = store.getState().students;
    expect(state.status).toBe('succeeded');
    expect(state.list).toHaveLength(2);
    expect(state.list[0].name).toBe('Alice');
    expect(state.list[1].name).toBe('Bob');
  });

  it('should handle fetch error', () => {
    store.dispatch({
      type: fetchStudents.rejected.type,
      error: { message: 'Failed to fetch students' },
    });

    const state = store.getState().students;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to fetch students');
  });

  it('should handle full async lifecycle', async () => {
    const mockData = [
      { _id: '1', name: 'Charlie', roll_no: 'S003' },
    ];
    fetchStudentsApi.mockResolvedValueOnce(mockData);

    await store.dispatch(fetchStudents());

    const state = store.getState().students;
    expect(state.status).toBe('succeeded');
    expect(state.list).toEqual(mockData);
  });

  it('should replace previous list on new fetch', async () => {
    // First fetch
    store.dispatch({
      type: fetchStudents.fulfilled.type,
      payload: [{ _id: '1', name: 'Old Student' }],
    });

    // Second fetch replaces
    const newData = [{ _id: '2', name: 'New Student' }];
    fetchStudentsApi.mockResolvedValueOnce(newData);

    await store.dispatch(fetchStudents());

    const state = store.getState().students;
    expect(state.list).toHaveLength(1);
    expect(state.list[0].name).toBe('New Student');
  });
});
