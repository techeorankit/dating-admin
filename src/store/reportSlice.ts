import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface UserHostReport {
  _id: string;
  reporterId: string;
  reporterRole: string;
  targetId: string;
  targetRole: string;
  reason: string;
  status: number;
  proceedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporterName: string;
  reporterUniqueId: string;
  reporterImage: string;
  targetName: string;
  targetUniqueId: string;
  targetImage: string;
}

interface ReportState {
  items: UserHostReport[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: ReportState = {
  items: [],
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

export const getUserHostReports = createAsyncThunk(
  "api/admin/report/getUserHostReports",
  async (params: any = {}) => {
    const { status, search, start, limit, startDate, endDate } = params;
    return apiInstanceFetch.get(
      `api/admin/report/getUserHostReports?status=${status || "all"}&search=${
        search || ""
      }&start=${start || 1}&limit=${limit || 10}&startDate=${
        startDate || "All"
      }&endDate=${endDate || "All"}`
    );
  }
);

export const solveUserHostReport = createAsyncThunk(
  "api/admin/report/solveUserHostReport",
  async (payload: { reportId: string; targetId: string; reporterId: string }) => {
    const { reportId, targetId, reporterId } = payload;
    return apiInstanceFetch.patch(
      `api/admin/report/solveUserHostReport?reportId=${reportId}&targetId=${targetId}&reporterId=${reporterId}`
    );
  }
);

export const deleteUserHostReport = createAsyncThunk(
  "api/admin/report/deleteUserHostReport",
  async (reportId: string) => {
    return apiInstanceFetch.delete(
      `api/admin/report/deleteUserHostReport?reportId=${reportId}`
    );
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserHostReports.pending, (state) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getUserHostReports.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        const data: UserHostReport[] = action.payload?.data || [];
        state.items = data;
        state.total = action.payload?.total ?? data.length ?? 0;
      }
    );
    builder.addCase(getUserHostReports.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(solveUserHostReport.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      solveUserHostReport.fulfilled,
      (state, action: PayloadAction<any, string, { arg: { reportId: string } }>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const updatedReportId = action.meta.arg.reportId;
          const idx = state.items.findIndex((r) => r._id === updatedReportId);
          if (idx !== -1) {
            state.items[idx] = {
              ...state.items[idx],
              status: 2,
              proceedAt: action.payload?.data?.proceedAt ?? state.items[idx].proceedAt ?? null,
            };
          }
          Success(action.payload?.message || "Report solved successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(solveUserHostReport.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deleteUserHostReport.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      deleteUserHostReport.fulfilled,
      (state, action: PayloadAction<any, string, { arg: string }>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const deletedId = action.meta.arg;
          state.items = state.items.filter((r) => r._id !== deletedId);
          state.total = Math.max(0, state.total - 1);
          Success(action.payload?.message || "Report deleted successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(deleteUserHostReport.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default reportSlice.reducer;

