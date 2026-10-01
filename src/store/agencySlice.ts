import { basePath } from "@/utils/config";
import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { baseURL, key } from "@/utils/config";
import { SetDevKey, setToken } from "@/utils/setAuthAxios";
import { setToast } from "@/utils/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import { setInMemoryCredential } from "@/utils/authToken";

interface UserState {
  agency: any[];
  totalagencyWiseHost: number;
  agencyWiseHost: any[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  agency: [],
  agencyWiseHost: [],
  totalagencyWiseHost: 0,
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

interface AllImpressionPayload {
  name?: string;
  start?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  isBlock?: boolean;
  country?: string;
  sortBy?: "createdAt" | "netAvailableEarnings";
  sortOrder?: "asc" | "desc";
}


export const getAllAgency: any = createAsyncThunk(
  "api/admin/agency/getAgencies",
  async (payload: AllImpressionPayload | undefined) => {
    const baseUrl = "api/admin/agency/getAgencies";
    const params = new URLSearchParams();

    if (payload?.start !== undefined) params.append("start", String(payload.start));
    if (payload?.limit !== undefined) params.append("limit", String(payload.limit));
    if (payload?.startDate) params.append("startDate", payload.startDate);
    if (payload?.endDate) params.append("endDate", payload.endDate);
    if (payload?.search) params.append("search", payload.search);

    if (payload?.isBlock !== undefined) params.append("isBlock", String(payload.isBlock));
    if (payload?.country) params.append("country", payload.country);
    if (payload?.sortBy) params.append("sortBy", payload.sortBy);
    if (payload?.sortOrder) params.append("sortOrder", payload.sortOrder);

    const url =
      params.toString().length > 0 ? `${baseUrl}?${params.toString()}` : baseUrl;

    return apiInstanceFetch.get(url);
  }
);

export const getAgencyWiseHost: any = createAsyncThunk(
  "api/admin/host/listAgencyHosts",
  async (payload: any) => {
    const baseUrl = "api/admin/host/listAgencyHosts";
    const params = new URLSearchParams();

    if (payload?.start !== undefined) params.append("start", String(payload.start));
    if (payload?.limit !== undefined) params.append("limit", String(payload.limit));
    if (payload?.search) params.append("search", payload.search);
    if (payload?.startDate) params.append("startDate", payload.startDate);
    if (payload?.endDate) params.append("endDate", payload.endDate);
    if (payload?.agencyId) params.append("agencyId", String(payload.agencyId));

    // Filters (kept optional to avoid breaking existing API behavior)
    if (payload?.isBlock !== undefined) params.append("isBlock", String(payload.isBlock));
    if (payload?.isOnline !== undefined) params.append("isOnline", String(payload.isOnline));
    if (payload?.isBusy !== undefined) params.append("isBusy", String(payload.isBusy));
    if (payload?.isLive !== undefined) params.append("isLive", String(payload.isLive));
    if (payload?.country) params.append("country", payload.country);

    // Server sorting
    if (payload?.sortBy) params.append("sortBy", payload.sortBy);
    if (payload?.sortOrder) params.append("sortOrder", payload.sortOrder);

    const url =
      params.toString().length > 0 ? `${baseUrl}?${params.toString()}` : baseUrl;

    return apiInstanceFetch.get(url);
  }
);

export const createAgency = createAsyncThunk(
  "api/admin/agency/createAgency",
  async (payload) => {

    return apiInstanceFetch.post(`api/admin/agency/createAgency`, payload);
  }
);

export const deleteAgency: any = createAsyncThunk(
  "api/admin/impression/deleteAgency",
  async (payload: AllImpressionPayload | undefined) => {
    return apiInstanceFetch.delete(`api/admin/impression/deleteAgency?impressionId=${payload}`);
  }
);

export const updateAgency = createAsyncThunk(
  "api/admin/agency/updateAgency",
  async (payload: any) => {
    return apiInstanceFetch.patch(
      `api/admin/agency/updateAgency?agencyId=${payload?.agencyId}`,
      payload?.formData
    );
  }
);


export const blockUnblockAgency: any = createAsyncThunk(
  "api/admin/agency/toggleAgencyBlockStatus?agencyId",
  async (payload: any) => {
    return apiInstanceFetch.patch(`api/admin/agency/toggleAgencyBlockStatus?agencyId=${payload}`);
  }
);

export const agencyLogin = createAsyncThunk(
  "api/admin/loginAgency",
  async (payload: any) => {

    return apiInstanceFetch.post(`api/agency/loginAgency?email=${payload?.email}&password=${payload?.password}`,
    );
  }
);



const agencySlice = createSlice({
  name: "agency",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllAgency.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getAllAgency.fulfilled,
      (state, action: PayloadAction<any>) => {

        state.isSkeleton = false;
        state.agency = action.payload.data;
        state.total = action.payload.total
      }
    );
    builder.addCase(getAllAgency.rejected, (state, action: PayloadAction<any>) => {
      state.isSkeleton = false;
    });


    builder.addCase(agencyLogin.pending, (state: any, action: PayloadAction<any>) => {
      state.isLoading = true;
    });
    builder.addCase(
      agencyLogin.fulfilled,
      (state: any, action: any) => {
        state.isLoading = false;
        if (action.payload && action?.payload?.status !== false) {

          const token: any = sessionStorage.getItem("tokenAgency");

          setTimeout(() => {
            setToast("success", "Login Successfully");
          }, 1000)
          // const token = action.payload.data.data;
          const decodedToken: any = jwtDecode(token);
          sessionStorage.setItem("isAgency", "true");
          state.isAuth = true;
          state.admin = decodedToken;
          state.permission = decodedToken?.flag;
          setToken(action.payload.data);
          SetDevKey(key);
          const encrypted = CryptoJS.AES.encrypt(action?.meta?.arg?.password, key).toString();
          setInMemoryCredential(encrypted);
          setTimeout(() => {

            window.location.href = `${basePath}/DashboardAgency`;
          }, 1000)
        } else {
          DangerRight(action.payload?.data?.message || action?.payload?.message);
        }
      }
    );
    builder.addCase(
      agencyLogin.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(getAgencyWiseHost.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getAgencyWiseHost.fulfilled,
      (state, action: PayloadAction<any>) => {

        state.isSkeleton = false;
        state.agencyWiseHost = action.payload.hosts;
        state.totalagencyWiseHost = action.payload.total
      }
    );
    builder.addCase(getAgencyWiseHost.rejected, (state, action: PayloadAction<any>) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      createAgency.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      createAgency.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.status) {
          state.agency.unshift(action?.payload?.data);

          Success("Agency Add Successfully");
        } else {
          DangerRight(action?.payload?.message)
        }
      }
    );
    builder.addCase(createAgency.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(
      deleteAgency.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(deleteAgency.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {

        state.agency = state.agency.filter(
          (agency) => agency?._id !== action?.meta?.arg
        );
        Success("Impression Delete Successfully");
      } else {
        DangerRight(action?.payload?.message)
      }
      state.isLoading = false;
    });

    builder.addCase(deleteAgency.rejected, (state, action) => {
      state.isLoading = false;
    });


    builder.addCase(
      updateAgency.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      updateAgency.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload.status) {
          const agencyIndex = state.agency.findIndex(
            (agency) => agency?._id === action?.payload?.data?._id
          );

          if (agencyIndex !== -1) {


            state.agency[agencyIndex] = {
              ...state.agency[agencyIndex],
              ...action.payload.data,
            };
            Success("Agency Update Successfully");
          } else {
            DangerRight(action?.payload?.message)
          }
        }
        state.isLoading = false;
      }
    );

    builder.addCase(updateAgency.rejected, (state, action) => {
      state.isLoading = false;
    });


    builder.addCase(
      blockUnblockAgency.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      blockUnblockAgency.fulfilled,
      (state, action: PayloadAction<any>) => {

        if (action?.payload?.status) {

          const updateVipPlan = action.payload.data;
          const bannerIndex = state.agency.findIndex(
            (agency) => agency?._id === updateVipPlan?._id
          );
          if (bannerIndex !== -1) {
            state.agency[bannerIndex].isBlock = updateVipPlan.isBlock;
          }
          updateVipPlan?.isBlock ?
            Success("Agency Block Successfully") :
            Success("Agency UnBlock Successfully")
        } else {
          DangerRight(action?.payload?.message)
        }
        state.isLoading = false;
      }
    );

    builder.addCase(blockUnblockAgency.rejected, (state, action) => {
      state.isLoading = false;
    });


  },
});

export default agencySlice.reducer;
