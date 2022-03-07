import { createSlice } from '@reduxjs/toolkit';

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
  },
  reducers: {
    setNodeList: (state, action) => {
      state.nodeList = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setNodeList } = dashboardSlice.actions;

export default dashboardSlice.reducer;
