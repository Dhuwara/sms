import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAdminStatsApi } from '../../services/staffService';

export const fetchAdminStats = createAsyncThunk('dashboard/fetchStats', fetchAdminStatsApi);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      total_students: 0,
      total_classes: 0,
      total_teachers: 0,
      total_staff: 0,
      pending_fees: 0,
      present_today: 0,
      absent_today: 0,
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
