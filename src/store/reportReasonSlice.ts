import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ReportReason {
  _id?: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ReportReasonState {
  items: ReportReason[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: ReportReasonState = {
  items: [],
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

export const getReportReasons = createAsyncThunk(
  "api/admin/reportReason/getReportReasons",
  async () => {
    return apiInstanceFetch.get("api/admin/reportReason/getReportReasons");
  }
);

export const createReportReason = createAsyncThunk(
  "api/admin/reportReason/createReportReason",
  async (payload: { title: string }) => {
    return apiInstanceFetch.post(
      "api/admin/reportReason/createReportReason",
      payload
    );
  }
);

export const updateReportReason = createAsyncThunk(
  "api/admin/reportReason/updateReportReason",
  async (payload: { reportReasonId: string; title: string }) => {
    return apiInstanceFetch.patch(
      "api/admin/reportReason/updateReportReason",
      payload
    );
  }
);

export const deleteReportReason = createAsyncThunk(
  "api/admin/reportReason/deleteReportReason",
  async (reportReasonId: string) => {
    return apiInstanceFetch.delete(
      `api/admin/reportReason/deleteReportReason?reportReasonId=${reportReasonId}`
    );
  }
);

const reportReasonSlice = createSlice({
  name: "reportReason",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getReportReasons.pending, (state) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getReportReasons.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        const data = action.payload?.data || [];
        state.items = data;
        state.total = action.payload?.total ?? data.length ?? 0;
      }
    );
    builder.addCase(getReportReasons.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(createReportReason.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createReportReason.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          if (action.payload?.data) {
            state.items.unshift(action.payload.data);
          }
          Success(action.payload?.message || "Report reason created successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(createReportReason.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateReportReason.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateReportReason.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const updated = action.payload?.data;
          const idx = state.items.findIndex((r) => r._id === updated?._id);
          if (idx !== -1 && updated) {
            state.items[idx] = {
              ...state.items[idx],
              ...updated,
            };
          }
          Success(
            action.payload?.message || "Report reason updated successfully"
          );
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(updateReportReason.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deleteReportReason.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      deleteReportReason.fulfilled,
      (state, action: PayloadAction<any, string, { arg: string }>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const deletedId = action.meta.arg;
          state.items = state.items.filter((r) => r._id !== deletedId);
          Success(
            action.payload?.message || "Report reason deleted successfully"
          );
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(deleteReportReason.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default reportReasonSlice.reducer;

