import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from '../components/dashboardSlice';

export default configureStore({
  reducer: {
    dashboard: dashboardReducer
  },
});