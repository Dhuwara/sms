import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStudentsApi } from '../../services/studentsService';

export const fetchStudents = createAsyncThunk('students/fetchAll', fetchStudentsApi);

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default studentsSlice.reducer;
