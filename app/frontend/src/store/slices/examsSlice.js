import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchExamsApi,
  createExamApi,
  updateExamApi,
  deleteExamApi,
} from '../../services/examsService';

export const fetchExams = createAsyncThunk('exams/fetchAll', (params) => fetchExamsApi(params));
export const createExam = createAsyncThunk('exams/create', createExamApi);
export const updateExam = createAsyncThunk('exams/update', ({ id, data }) => updateExamApi(id, data));
export const deleteExam = createAsyncThunk('exams/delete', deleteExamApi);

const examsSlice = createSlice({
  name: 'exams',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.meta.arg);
      });
  },
});

export default examsSlice.reducer;
