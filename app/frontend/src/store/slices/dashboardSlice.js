import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAdminStatsApi } from '../../services/staffService';

export const fetchAdminStats = createAsyncThunk(
  'dashboard/fetchStats',
  fetchAdminStatsApi,
  { condition: (_, { getState }) => getState().dashboard.status !== 'loading' }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      total_students: 0,
      total_classes: 0,
      total_teachers: 0,
      total_staff: 0,
      pending_fees: 0,
      student_present_today: 0,
      student_absent_today: 0,
      staff_present_today: 0,
      staff_late_today: 0,
      staff_absent_today: 0,
      fee_total_expected: 0,
      fee_total_collected: 0,
      fee_total_pending: 0,
      fee_total_overdue: 0,
    },
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
