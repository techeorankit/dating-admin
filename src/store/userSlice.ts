import { DangerRight } from "@/api/toastServices";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { setToast } from "@/utils/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface UserState {
  user: any[];
  userCoinHistory: any[];
  userCallHistory: any[];
  userGiftHistory: any[];
  userVipPlanHistory: any[];
  userCoinPlanPurchaseHistory: any[];
  totalFollowingList: number;
  userWalletData: any[];
  total: number;
  totalCoinPlanPurchase: number;
  totalCallHistory: number;
  totalDuration: number;
  totalUserGiftHistory: number;
  totalVipPlanHistory: number;
  countryData: any[];
  booking: any[];
  userProfile: any;
  userFollowingList: any[];
  hostBlockList: any[];
  totalHostBlockList: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  user: [],
  total: 0,
  totalCallHistory: 0,
  totalDuration: 0,
  totalUserGiftHistory: 0,
  totalCoinPlanPurchase: 0,
  totalVipPlanHistory: 0,
  userProfile: {},
  countryData: [],
  userWalletData: [],
  userGiftHistory: [],
  userCallHistory: [],
  userCoinHistory: [],
  totalFollowingList: 0,
  userCoinPlanPurchaseHistory: [],
  userFollowingList: [],
  userVipPlanHistory: [],
  hostBlockList: [],
  totalHostBlockList: 0,
  booking: [],
  isLoading: false,
  isSkeleton: false,
};

interface AllUsersPayload {
  start?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  userId: string;
  meta: any;
  id?: string;
  data: any;
  status: any;
  isVip?: boolean;
  isBlock?: boolean;
  isOnline?: boolean;
  isBusy?: boolean;
  isHost?: boolean;
  country?: string;
}

/** Same query shape as retrieveUserList: userId + pagination + search (name / unique id). */
export type UserRelationListPayload =
  | string
  | {
      userId: string;
      start?: number;
      limit?: number;
      search?: string;
    };

function normalizeUserRelationPayload(
  payload: UserRelationListPayload | undefined
): { userId: string; start?: number; limit?: number; search?: string } | null {
  if (payload == null || payload === "") return null;
  if (typeof payload === "string") {
    return { userId: payload };
  }
  return {
    userId: payload.userId,
    start: payload.start,
    limit: payload.limit,
    search: payload.search,
  };
}

function buildUserRelationQuery(
  baseUrl: string,
  p: { userId: string; start?: number; limit?: number; search?: string }
) {
  const params = new URLSearchParams();
  params.append("userId", p.userId);
  if (p.start !== undefined) params.append("start", String(p.start));
  if (p.limit !== undefined) params.append("limit", String(p.limit));
  const q = p.search?.trim();
  if (q) params.append("search", q);
  const qs = params.toString();
  return qs.length ? `${baseUrl}?${qs}` : baseUrl;
}

export const getRealOrFakeUser: any = createAsyncThunk(
  "api/admin/user/retrieveUserList",
  async (payload: AllUsersPayload | undefined) => {
    const baseUrl = "api/admin/user/retrieveUserList";
    const params = new URLSearchParams();

    if (payload?.start !== undefined) params.append("start", String(payload.start));
    if (payload?.limit !== undefined) params.append("limit", String(payload.limit));
    if (payload?.startDate) params.append("startDate", payload.startDate);
    if (payload?.endDate) params.append("endDate", payload.endDate);
    if (payload?.search) params.append("search", payload.search);

    if (payload?.isVip !== undefined) params.append("isVip", String(payload.isVip));
    if (payload?.isBlock !== undefined) params.append("isBlock", String(payload.isBlock));
    if (payload?.isOnline !== undefined) params.append("isOnline", String(payload.isOnline));
    if (payload?.isBusy !== undefined) params.append("isBusy", String(payload.isBusy));
    if (payload?.isHost !== undefined) params.append("isHost", String(payload.isHost));
    if (payload?.country) params.append("country", payload.country);

    const url =
      params.toString().length > 0 ? `${baseUrl}?${params.toString()}` : baseUrl;

    return apiInstanceFetch.get(url);
  }
);

export const getUserProfile = createAsyncThunk(
  "api/admin/user/fetchUserProfile",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `api/admin/user/fetchUserProfile?userId=${payload}`
    );
  }
);

export const getUserFollowingList: any = createAsyncThunk(
  "api/admin/followerFollowing/fetchFollowing",
  async (payload: UserRelationListPayload | undefined) => {
    const p = normalizeUserRelationPayload(payload);
    if (!p?.userId) {
      return apiInstanceFetch.get("api/admin/followerFollowing/fetchFollowing");
    }
    return apiInstanceFetch.get(
      buildUserRelationQuery("api/admin/followerFollowing/fetchFollowing", p)
    );
  }
);

export const getHostBlockList: any = createAsyncThunk(
  "api/admin/block/listBlockedHostsForUser?userId",
  async (payload: UserRelationListPayload | undefined) => {
    const p = normalizeUserRelationPayload(payload);
    if (!p?.userId) {
      return apiInstanceFetch.get(
        "api/admin/block/listBlockedHostsForUser"
      );
    }
    return apiInstanceFetch.get(
      buildUserRelationQuery(
        "api/admin/block/listBlockedHostsForUser",
        p
      )
    );
  }
);

export const getCoinPlanHistory = createAsyncThunk(
  "api/admin/history/getCoinTransactionHistory",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `api/admin/history/getCoinTransactionHistory?userId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&endDate=${payload?.limit}`
    );
  }
);

export const getCallHistory: any = createAsyncThunk(
  "api/admin/history/fetchCallTransactionHistory",
  async (payload: AllUsersPayload | undefined) => {
    const search = encodeURIComponent(payload?.search ?? "");
    return apiInstanceFetch.get(
      `api/admin/history/fetchCallTransactionHistory?userId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}&search=${search}`
    );
  }
);

export const getGiftHistory: any = createAsyncThunk(
  "api/admin/history/retrieveGiftTransactionHistory",
  async (payload: AllUsersPayload | undefined) => {
    const search = encodeURIComponent(payload?.search ?? "");
    return apiInstanceFetch.get(
      `api/admin/history/retrieveGiftTransactionHistory?userId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}&search=${search}`
    );
  }
);



export const getVipPlanPurchaseHistory: any = createAsyncThunk(
  "api/admin/history/getVIPPlanTransactionHistory",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `api/admin/history/getVIPPlanTransactionHistory?userId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}`
    );
  }
);

export const getCoinPlanPurchaseHistory: any = createAsyncThunk(
  "api/admin/history/fetchCoinPlanTransactionHistory",
  async (payload: AllUsersPayload | undefined) => {

    return apiInstanceFetch.get(
      `api/admin/history/fetchCoinPlanTransactionHistory?userId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}`
    );
  }
);



export const blockuser: any = createAsyncThunk(
  "api/admin/user/modifyUserBlockStatus",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.patch(
      `api/admin/user/modifyUserBlockStatus?userId=${payload}`
    );
  }
);

export const getUserAppointment = createAsyncThunk(
  "admin/user/appointment",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `api/admin/appointment/fetchCustomerBookings?status=${payload?.status}&start=${payload?.start}&limit=${payload?.limit}&customerId=${payload?.id}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const updateUserCoin = createAsyncThunk(
  "api/admin/user/updateUserCoin",
  async (
    payload: { userId: string; amount: number; type: "add" | "deduct" },
    { rejectWithValue }
  ) => {
    try {
      const { userId, amount, type } = payload;

      const historyType = type === "add" ? 14 : 15;

      const body = {
        userId,
        coin: amount,
        action: type,
        historyType,
      };

      const res = await apiInstanceFetch.patch(`api/admin/user/updateUserCoin`, body);
      if (res.status) {
        setToast("success", `Coins ${type === "add" ? "added" : "deducted"} successfully`);
      } else {
        DangerRight(res?.message || "Failed to update coins");
      }

      return res;
    } catch (err: any) {
      DangerRight(err?.response?.data?.message || "Something went wrong while updating coins");
      return rejectWithValue(err?.response?.data);
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserFollowerList: (state) => {
      state.userFollowingList = [];
      state.totalFollowingList = 0;
      state.isSkeleton = false;
    },
    clearHostUserBlockList: (state) => {
      state.hostBlockList = [];
      state.totalHostBlockList = 0;
      state.isSkeleton = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRealOrFakeUser.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
    });

    builder.addCase(
      getRealOrFakeUser.fulfilled,
      (state, action: PayloadAction<any>) => {

        state.isSkeleton = false;
        state.user = action.payload.data;
        state.total = action.payload.total;
      }
    );
    builder.addCase(getRealOrFakeUser.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      getCoinPlanHistory.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getCoinPlanHistory.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.userCoinHistory = action.payload.data;
        state.userWalletData = action.payload.data;
      }
    );

    builder.addCase(getCoinPlanHistory.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(
      getCallHistory.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getCallHistory.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.userCallHistory = action.payload.data;
        state.totalCallHistory = action.payload.total;
        state.totalDuration = action.payload.totalDuration ?? 0;

      }
    );

    builder.addCase(getCallHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });



    builder.addCase(
      getGiftHistory.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getGiftHistory.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.userGiftHistory = action.payload.data;
        state.totalUserGiftHistory = action.payload.total;
      }
    );

    builder.addCase(getGiftHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });


    builder.addCase(
      getVipPlanPurchaseHistory.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getVipPlanPurchaseHistory.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.userVipPlanHistory = action.payload.data;
        state.totalVipPlanHistory = action?.payload?.total;
      }
    );

    builder.addCase(getVipPlanPurchaseHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      getCoinPlanPurchaseHistory.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getCoinPlanPurchaseHistory.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.userCoinPlanPurchaseHistory = action.payload.data;
        state.totalCoinPlanPurchase = action?.payload?.total;
      }
    );

    builder.addCase(getCoinPlanPurchaseHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });




    builder.addCase(getUserProfile.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userProfile = action?.payload?.user;
    });

    builder.addCase(getUserAppointment.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getUserAppointment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.booking = action?.payload?.data;
      state.total = action?.payload?.total;
    });

    builder.addCase(getUserAppointment.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getUserProfile.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getUserFollowingList.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getUserFollowingList.fulfilled, (state, action) => {

      state.isLoading = false;
      state.userFollowingList = action?.payload?.followingList;
      state.totalFollowingList = action?.payload?.total;
    });

    builder.addCase(getHostBlockList.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getHostBlockList.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getHostBlockList.fulfilled, (state, action) => {

      state.isLoading = false;
      state.hostBlockList = action?.payload?.blockedHosts ?? [];
      state.totalHostBlockList =
        action?.payload?.total ?? action?.payload?.totalHostBlock ?? 0;
    });

    builder.addCase(getUserFollowingList.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(blockuser.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(blockuser.fulfilled, (state: any, action: any) => {
      if (action?.payload?.status) {

        const blockuserIndx = action?.payload?.data;
        const userIndx = state.user.findIndex(
          (user: any) => user?._id === blockuserIndx?._id
        );
        if (userIndx !== -1) {

          state.user[userIndx] = {
            ...state.user[userIndx],
            ...action.payload.data,
          };

          setToast("success", action?.payload?.message)
        } else {
          DangerRight(action?.payload?.message)
        }

      }
      state.isLoading = false;
    });

    builder.addCase(blockuser.rejected, (state, action) => {
      state.isLoading = false;
    })
    builder.addCase(updateUserCoin.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateUserCoin.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;

      // Optional: update local user data if needed
      const updatedUser = action?.payload?.data;
      if (updatedUser?._id) {
        const userIndex = state.user.findIndex((u) => u._id === updatedUser._id);
        if (userIndex !== -1) {
          state.user[userIndex] = { ...state.user[userIndex], ...updatedUser };
        }
      }
    });

    builder.addCase(updateUserCoin.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { clearUserFollowerList, clearHostUserBlockList } = userSlice.actions;

export default userSlice.reducer;
