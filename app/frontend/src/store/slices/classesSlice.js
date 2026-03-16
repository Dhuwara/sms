import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchClassesApi,
  fetchTeachersApi,
  fetchSubjectsApi,
} from '../../services/classesService';

export const fetchClasses = createAsyncThunk('classes/fetchAll', fetchClassesApi);
export const fetchTeachers = createAsyncThunk('classes/fetchTeachers', fetchTeachersApi);
export const fetchSubjects = createAsyncThunk('classes/fetchSubjects', fetchSubjectsApi);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    list: [],
    teachers: [],
    subjects: [],
    status: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
    teachersStatus: 'idle',
    subjectsStatus: 'idle',
    error: null,
  },
  reducers: {
    addClass: (state, action) => { state.list.unshift(action.payload); },
    updateClass: (state, action) => {
      const idx = state.list.findIndex(c => c._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeClass: (state, action) => {
      state.list = state.list.filter(c => c._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchTeachers.pending, (state) => { state.teachersStatus = 'loading'; })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.teachersStatus = 'succeeded';
        state.teachers = action.payload;
      })
      .addCase(fetchSubjects.pending, (state) => { state.subjectsStatus = 'loading'; })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjectsStatus = 'succeeded';
        state.subjects = action.payload;
      });
  },
});

export const { addClass, updateClass, removeClass } = classesSlice.actions;
export default classesSlice.reducer;
