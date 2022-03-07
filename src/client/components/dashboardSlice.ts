import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import HttpRequestClient from "../utils/request";

export const fetchNodeList = createAsyncThunk(
  "fetch/nodeList",
  async () => {
    const res = await HttpRequestClient.get("/list/subscriptions");
    const array = res?.data?.filter(ele=>ele.node_name);
    array.sort((a, b) => {
      return a.node_name.normalize().localeCompare(b.node_name.normalize());
    });
    return array;
  }
)

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
  },
  reducers: {

  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchNodeList.fulfilled, (state, action) => {
      // Add user to the state array
      state.nodeList = action.payload;
    })
  },
});

// Action creators are generated for each case reducer function
// export const {  } = dashboardSlice.actions;

export default dashboardSlice.reducer;
