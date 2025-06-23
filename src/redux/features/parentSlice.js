import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";

export const fetchParentByUserId = createAsyncThunk(
  "parent/fetchParentByUserId",
  async (userID, { rejectWithValue }) => {
    try {
      const res = await api.get(`/Parent/user/${userID}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi lấy thông tin phụ huynh");
    }
  }
);

const parentSlice = createSlice({
  name: "parent",
  initialState: {
    parent: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.parent = action.payload;
      })
      .addCase(fetchParentByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default parentSlice.reducer;
