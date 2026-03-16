import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchPTMsApi,
  createPTMApi,
  deletePTMApi,
  fetchAnnouncementsApi,
  fetchSchoolEventsApi,
} from '../../services/communicationService';

export const fetchPTMs = createAsyncThunk('communication/fetchPTMs', fetchPTMsApi);
export const createPTM = createAsyncThunk('communication/createPTM', createPTMApi);
export const deletePTM = createAsyncThunk('communication/deletePTM', deletePTMApi);
export const fetchAnnouncements = createAsyncThunk(
  'communication/fetchAnnouncements',
  (audience) => fetchAnnouncementsApi(audience),
);
export const fetchSchoolEvents = createAsyncThunk(
  'communication/fetchSchoolEvents',
  fetchSchoolEventsApi,
);

const communicationSlice = createSlice({
  name: 'communication',
  initialState: {
    ptmList: [],
    announcements: [],
    schoolEvents: [],
    ptmStatus: 'idle',
    announcementsStatus: 'idle',
    schoolEventsStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // PTM
      .addCase(fetchPTMs.pending, (state) => { state.ptmStatus = 'loading'; })
      .addCase(fetchPTMs.fulfilled, (state, action) => {
        state.ptmStatus = 'succeeded';
        state.ptmList = action.payload;
      })
      .addCase(fetchPTMs.rejected, (state) => { state.ptmStatus = 'failed'; })
      .addCase(createPTM.fulfilled, (state, action) => {
        state.ptmList.push(action.payload);
      })
      .addCase(deletePTM.fulfilled, (state, action) => {
        // action.meta.arg is the id passed to deletePTM()
        state.ptmList = state.ptmList.filter(p => p._id !== action.meta.arg);
      })
      // Announcements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcementsStatus = 'succeeded';
        state.announcements = action.payload;
      })
      // School Events
      .addCase(fetchSchoolEvents.fulfilled, (state, action) => {
        state.schoolEventsStatus = 'succeeded';
        state.schoolEvents = action.payload;
      });
  },
});

export default communicationSlice.reducer;
