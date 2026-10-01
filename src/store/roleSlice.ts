import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface RolePermission {
  module: string;
  actions: string[];
}

export interface Role {
  _id?: string;
  name: string;
  permissions: RolePermission[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RoleState {
  roles: Role[];
  eligibleRoles: Role[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: RoleState = {
  roles: [],
  eligibleRoles: [],
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

interface ListPayload {
  start?: number;
  limit?: number;
  search?: string;
}

interface ModifyRolePayload {
  roleId: string;
  name: string;
  permissions: RolePermission[];
}

export const getRoles = createAsyncThunk(
  "api/admin/role/surveyRoles",
  async (payload: ListPayload | undefined) => {
    const start = payload?.start ?? 1;
    const limit = payload?.limit ?? 10;
    const params = new URLSearchParams();
    params.append("start", String(start));
    params.append("limit", String(limit));
    if (payload?.search) params.append("search", payload.search);

    return apiInstanceFetch.get(
      `api/admin/role/surveyRoles?${params.toString()}`
    );
  }
);

export const createRole = createAsyncThunk(
  "api/admin/role/appointRole",
  async (payload: { name: string; permissions: RolePermission[] }) => {
    return apiInstanceFetch.post("api/admin/role/appointRole", payload);
  }
);

export const updateRole = createAsyncThunk(
  "api/admin/role/customizeRole",
  async (payload: ModifyRolePayload) => {
    return apiInstanceFetch.patch("api/admin/role/customizeRole", payload);
  }
);

export const deleteRole = createAsyncThunk(
  "api/admin/role/obliterateRole",
  async (roleId: string) => {
    return apiInstanceFetch.delete(
      `api/admin/role/obliterateRole?roleId=${roleId}`
    );
  }
);

export const getEligibleRoleList = createAsyncThunk(
  "api/admin/role/eligibleRoleList",
  async () => {
    return apiInstanceFetch.get("api/admin/role/eligibleRoleList");
  }
);

export const toggleRoleState = createAsyncThunk(
  "api/admin/role/moderateRoleState",
  async (roleId: string) => {
    return apiInstanceFetch.patch(
      `api/admin/role/moderateRoleState?roleId=${roleId}`
    );
  }
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRoles.pending, (state) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getRoles.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.roles = action.payload?.data || [];
        state.total = action.payload?.total ?? 0;
      }
    );
    builder.addCase(getRoles.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(createRole.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createRole.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          if (action.payload?.data) {
            state.roles.unshift(action.payload.data);
          }
          Success(action.payload?.message || "Role created successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(createRole.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateRole.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateRole.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const updated = action.payload?.data;
          const idx = state.roles.findIndex((r) => r._id === updated?._id);
          if (idx !== -1 && updated) {
            state.roles[idx] = {
              ...state.roles[idx],
              ...updated,
            };
          }
          Success(action.payload?.message || "Role updated successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(updateRole.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deleteRole.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      deleteRole.fulfilled,
      (state, action: PayloadAction<any, string, { arg: string }>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const deletedId = action.meta.arg;
          state.roles = state.roles.filter((r) => r._id !== deletedId);
          Success(action.payload?.message || "Role deleted successfully");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(deleteRole.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(getEligibleRoleList.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getEligibleRoleList.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.eligibleRoles = action.payload?.data || [];
      }
    );
    builder.addCase(getEligibleRoleList.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(toggleRoleState.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      toggleRoleState.fulfilled,
      (state, action: PayloadAction<any, string, { arg: string }>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const updated = action.payload?.data;
          const idx = state.roles.findIndex((r) => r._id === updated?._id);
          if (idx !== -1 && updated) {
            state.roles[idx] = {
              ...state.roles[idx],
              ...updated,
            };
          }
          Success(action.payload?.message || "Role status updated");
        } else {
          DangerRight(
            action.payload?.data?.message || action.payload?.message
          );
        }
      }
    );
    builder.addCase(toggleRoleState.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default roleSlice.reducer;

