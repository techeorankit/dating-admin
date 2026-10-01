"use client";
import { basePath } from "@/utils/config";

import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { jwtDecode } from "jwt-decode";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setToast } from "@/utils/toastServices";
import { SetDevKey, setToken } from "@/utils/setAuthAxios";
import { getAuthToken, getAuthUid, ensureAuthToken, setInMemoryCredential } from "@/utils/authToken";
import { key } from "@/utils/config";
import { STORAGE_KEYS } from "@/utils/permissions";
import {
  clearAdminPanelSessionStorage,
  persistSessionIntegritySnapshot,
} from "@/utils/sessionIntegrity";
import axios from "axios";
import { DangerRight, Success } from "@/api/toastServices";
import CryptoJS from "crypto-js";
import { deleteUser } from "firebase/auth";

interface SubAdmin {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  roleId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
}

interface SubAdminState {
  subAdmins: SubAdmin[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

interface UserState {
  isAuth: boolean;
  admin: any;
  countryData: any[];
  isLoading: boolean;
  isSkeleton?: boolean;
  subAdmin: SubAdminState;
  token: string | null;
  uid: string | null;
}

const initialSubAdminState: SubAdminState = {
  subAdmins: [],
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

const initialState: UserState = {
  isAuth: false,
  admin: {},
  isLoading: false,
  countryData: [],
  subAdmin: initialSubAdminState,
  token: null,
  uid: null,
};

interface AllUsersPayload {
  adminId: string;
  start?: number;
  limit?: number;
  startDate?: string;
  data: any;
  endDate?: string;
  payload?: any;
  type?: string;
}

export const signUpAdmin = createAsyncThunk(
  "admin/admin/registerAdmin",
  async (payload: { payload: any; userCredential: any }) => {
    try {
      const res = await apiInstanceFetch.post(
        "api/admin/admin/registerAdmin",
        payload.payload
      );
      if (!res?.status) {
        deleteUser(payload.userCredential);
      }

      return res;
    } catch (error) {
      deleteUser(payload.userCredential);
      return error;
    }
  }
);

export const login = createAsyncThunk(
  "api/admin/admin/validateAdminLogin",
  async (payload: any) => {
    const token = getAuthToken();
    const uid = getAuthUid() || sessionStorage.getItem("uid");
    return apiInstanceFetch.post(
      "api/admin/admin/validateAdminLogin",
      payload,

      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-uid": uid,
        },
      }
    );
  }
);

export const adminProfileGet = createAsyncThunk(
  "api/admin/admin/retrieveAdminProfile",
  async (payload: AllUsersPayload | undefined) => {
    const token = await ensureAuthToken();
    const uid = getAuthUid() || sessionStorage.getItem("uid");
    return axios.get(`api/admin/admin/retrieveAdminProfile`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "x-admin-uid": uid || "",
      },
    });
  }
);

export const adminProfileUpdate: any = createAsyncThunk(
  "api/admin/admin/modifyAdminProfile",
  async (payload: AllUsersPayload | undefined) => {
    const token = await ensureAuthToken();
    const uid = getAuthUid() || sessionStorage.getItem("uid");
    return axios.patch(`api/admin/admin/modifyAdminProfile`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "x-admin-uid": uid || "",
      },
    });
  }
);

export const updateAdminPassword: any = createAsyncThunk(
  "api/admin/admin/modifyPassword",
  async (payload: AllUsersPayload | undefined) => {
    const token = await ensureAuthToken();
    const uid = getAuthUid() || sessionStorage.getItem("uid");
    return axios.patch(`api/admin/admin/modifyPassword`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "x-admin-uid": uid || "",
      },
    });
  }
);

// Sub-admin / staff thunks (merged from subAdminSlice)
export const trackSubAdmins = createAsyncThunk(
  "api/admin/subAdmin/trackSubAdmins",
  async (payload: { start?: number; limit?: number; search?: string } | undefined) => {
    const start = payload?.start ?? 1;
    const limit = payload?.limit ?? 10;
    const params = new URLSearchParams();
    params.append("start", String(start));
    params.append("limit", String(limit));
    if (payload?.search) params.append("search", payload.search);

    return apiInstanceFetch.get(
      `api/admin/subAdmin/trackSubAdmins?${params.toString()}`
    );
  }
);

export const enlistSubAdmin = createAsyncThunk(
  "api/admin/subAdmin/enlistSubAdmin",
  async (payload: {
    name: string;
    email: string;
    password: string;
    roleId: string;
  }) => {
    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      roleId: payload.roleId,
    };
    return apiInstanceFetch.post("api/admin/subAdmin/enlistSubAdmin", body);
  }
);

export const polishSubAdmin = createAsyncThunk(
  "api/admin/subAdmin/polishSubAdmin",
  async (payload: {
    subAdminId: string;
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
  }) => {
    const body: any = {
      subAdminId: payload.subAdminId,
      name: payload.name,
      email: payload.email,
      roleId: payload.roleId,
    };
    if (payload.password) {
      body.password = payload.password;
    }
    return apiInstanceFetch.patch("api/admin/subAdmin/polishSubAdmin", body);
  }
);

export const regulateSubAdminState = createAsyncThunk(
  "api/admin/subAdmin/regulateSubAdminState",
  async (subAdminId: string) => {
    return apiInstanceFetch.patch(
      `api/admin/subAdmin/regulateSubAdminState?subAdminId=${subAdminId}`
    );
  }
);

export const expungeSubAdmin = createAsyncThunk(
  "api/admin/subAdmin/expungeSubAdmin",
  async (subAdminId: string) => {
    return apiInstanceFetch.delete(
      `api/admin/subAdmin/expungeSubAdmin?subAdminId=${subAdminId}`
    );
  }
);



const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminToken: (
      state: any,
      action: PayloadAction<{ token: string | null; uid?: string | null } | string | null>
    ) => {
      if (typeof action.payload === "string" || action.payload === null) {
        state.token = action.payload;
      } else if (action.payload) {
        state.token = action.payload.token;
        if (action.payload.uid !== undefined) {
          state.uid = action.payload.uid;
        }
      }
    },
    logoutApi(state: any) {
      clearAdminPanelSessionStorage();
      state.admin = {};
      state.isAuth = false;
      state.token = null;
      state.uid = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder.addCase(
      signUpAdmin.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      signUpAdmin.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        // console.log('action.payload', action.payload)
        if (action.payload.status) {
          setToast("success", "Admin Sign Up Successfully");
          setTimeout(() => {
            window.location.href = `${basePath}/`;
          }, 5000);
        } else {
          setToast("error", action.payload.message);
        }
      }
    );
    builder.addCase(
      signUpAdmin.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload.message);
      }
    );

    builder.addCase(login.pending, (state: any, action: PayloadAction<any>) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state: any, action: any) => {

      if (action.payload && action?.payload?.status !== false) {
        const token: any = getAuthToken();
        const uid: any = getAuthUid();
        state.token = token;
        state.uid = uid;
        setToast("success", "Login Successfully");
        const decodedToken: any = jwtDecode(token);
        state.isAuth = true;

        // Derive loginType purely from the role field in the API response
        const resData = action.payload.data?.data || action.payload.data || action.payload?.staff || action.payload?.subAdmin || decodedToken;
        const userType = (resData?.userType || decodedToken?.userType || "").toLowerCase();

        if (userType === "subadmin") {
          const staff = resData;
          sessionStorage.removeItem("admin");
          const permissions = staff.permissions || [];
          sessionStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(permissions));
          sessionStorage.setItem(STORAGE_KEYS.loginType, "STAFF");
        } else {
          sessionStorage.removeItem("staff");
          sessionStorage.setItem(STORAGE_KEYS.permissions, "[]");
          sessionStorage.setItem(STORAGE_KEYS.loginType, "ADMIN");
          state.admin = decodedToken;
        }

        persistSessionIntegritySnapshot();

        setToken(getAuthToken() ?? undefined);
        SetDevKey(key);

        const encrypted = CryptoJS.AES.encrypt(
          action?.meta?.arg?.password,
          key
        ).toString();
        setInMemoryCredential(encrypted);
        setTimeout(() => {
          window.location.href = `${basePath}/dashboard`;
        }, 500);
        state.isLoading = false;
      } else {
        DangerRight(action.payload?.data?.message || action?.payload?.message);
      }
    });
    builder.addCase(
      login.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      adminProfileGet.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );
    builder.addCase(
      adminProfileGet.fulfilled,
      (state: any, action: PayloadAction<any>) => {

        state.isSkeleton = false;
        state.admin = {
          ...state.admin,
          _id: action.payload?.data?.data?._id,
          flag: action.payload?.data?.data?.flag,
          name: action.payload?.data?.data?.name,
          email: action.payload?.data?.data?.email,
          image: action.payload?.data?.data?.image,
          password: action.payload?.data?.data?.password,
        };
      }
    );
    builder.addCase(
      adminProfileGet.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      adminProfileUpdate.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      adminProfileUpdate.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data?.status === true) {
          const prevEmail = state.admin?.email;
          const updatedEmail = action.payload.data.data.email;

          state.admin = action.payload.data.data;
          setToast("success", "Admin Profile Update Successful");
          if (prevEmail && updatedEmail && prevEmail !== updatedEmail) {
            setTimeout(() => {
              window.location.href = `${basePath}/`;
            }, 1000); // Add delay for user to see toast message
          }
        } else {
          setToast("error", action.payload.data.message);
        }
      }
    );

    builder.addCase(
      adminProfileUpdate.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      updateAdminPassword.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      updateAdminPassword.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data?.status === true) {
          state.admin = action.payload.data?.data;
          setToast("success", "Admin Password Update Successful");

          window.location.href = `${basePath}/`;
        } else {
          setToast("error", action.payload.data.message);
        }
      }
    );
    builder.addCase(
      updateAdminPassword.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    // Sub-admin / staff extra reducers (merged from subAdminSlice)
    builder.addCase(trackSubAdmins.pending, (state: any) => {
      state.subAdmin.isSkeleton = true;
      state.isSkeleton = true;
    });
    builder.addCase(
      trackSubAdmins.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.subAdmin.isSkeleton = false;
        state.isSkeleton = false;
        state.subAdmin.subAdmins = action.payload?.data || [];
        state.subAdmin.total = action.payload?.total ?? 0;
      }
    );
    builder.addCase(trackSubAdmins.rejected, (state: any) => {
      state.subAdmin.isSkeleton = false;
      state.isSkeleton = false;
    });

    builder.addCase(enlistSubAdmin.pending, (state: any) => {
      state.subAdmin.isLoading = true;
    });
    builder.addCase(
      enlistSubAdmin.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.subAdmin.isLoading = false;

        if (action.payload?.status) {


          if (action.payload?.data) {
            state.subAdmin.subAdmins.unshift(action.payload.data);
          }
          Success(
            action.payload?.message || "Sub admin created successfully"
          );
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(enlistSubAdmin.rejected, (state: any) => {
      state.subAdmin.isLoading = false;
    });

    builder.addCase(polishSubAdmin.pending, (state: any) => {
      state.subAdmin.isLoading = true;
    });
    builder.addCase(
      polishSubAdmin.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.subAdmin.isLoading = false;
        if (action.payload?.status) {
          const updated = action.payload?.data;
          const idx = state.subAdmin.subAdmins.findIndex(
            (s: SubAdmin) => s._id === updated?._id
          );
          if (idx !== -1 && updated) {
            state.subAdmin.subAdmins[idx] = {
              ...state.subAdmin.subAdmins[idx],
              ...updated,
            };
          }
          Success(action.payload?.message || "Sub admin updated successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(polishSubAdmin.rejected, (state: any) => {
      state.subAdmin.isLoading = false;
    });

    builder.addCase(regulateSubAdminState.pending, (state: any) => {
      state.subAdmin.isLoading = true;
    });
    builder.addCase(
      regulateSubAdminState.fulfilled,
      (
        state: any,
        action: PayloadAction<any, string, { arg: string }>
      ) => {
        state.subAdmin.isLoading = false;
        if (action.payload?.status) {
          const updated = action.payload?.data;
          const targetId = (updated && updated._id) || action.meta.arg;

          const idx = state.subAdmin.subAdmins.findIndex(
            (s: SubAdmin) => s._id === targetId
          );
          if (idx !== -1) {
            if (updated) {
              state.subAdmin.subAdmins[idx] = {
                ...state.subAdmin.subAdmins[idx],
                ...updated,
              };
            } else {
              const current = state.subAdmin.subAdmins[idx];
              state.subAdmin.subAdmins[idx] = {
                ...current,
                isActive: !current.isActive,
              };
            }
          }

          Success(
            action.payload?.message ||
            "Sub admin status updated successfully"
          );
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(regulateSubAdminState.rejected, (state: any) => {
      state.subAdmin.isLoading = false;
    });

    builder.addCase(expungeSubAdmin.pending, (state: any) => {
      state.subAdmin.isLoading = true;
    });
    builder.addCase(
      expungeSubAdmin.fulfilled,
      (
        state: any,
        action: PayloadAction<any, string, { arg: string }>
      ) => {
        state.subAdmin.isLoading = false;
        if (action.payload?.status) {
          const deletedId = action.meta.arg;
          state.subAdmin.subAdmins = state.subAdmin.subAdmins.filter(
            (s: SubAdmin) => s._id !== deletedId
          );
          Success(action.payload?.message || "Sub admin deleted successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(expungeSubAdmin.rejected, (state: any) => {
      state.subAdmin.isLoading = false;
    });


  }
});

export const { logoutApi, setLoading, setAdminToken } = adminSlice.actions;
export default adminSlice.reducer;
