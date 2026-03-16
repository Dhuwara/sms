import { configureStore } from '@reduxjs/toolkit';
import classesReducer from './slices/classesSlice';
import studentsReducer from './slices/studentsSlice';
import communicationReducer from './slices/communicationSlice';
import examsReducer from './slices/examsSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    classes: classesReducer,
    students: studentsReducer,
    communication: communicationReducer,
    exams: examsReducer,
    dashboard: dashboardReducer,
  },
});
