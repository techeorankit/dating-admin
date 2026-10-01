import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface LanguageRow {
  _id?: string;
  languageTitle?: string;
  languageCode?: string;
  localLanguageTitle?: string;
  isActive?: boolean;
  isDefault?: boolean;
  languageIcon?: string;
  errorCount?: number;
  errors?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface LanguageState {
  languages: LanguageRow[];
  total: number;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: LanguageState = {
  languages: [],
  total: 0,
  isLoading: false,
  isSkeleton: false,
};

export const getLanguages = createAsyncThunk(
  "language/getLanguages",
  async (payload: { start: number; limit: number; search?: string }) => {
    const q = encodeURIComponent(payload.search?.trim() || "");
    return apiInstanceFetch.get(
      `api/admin/language/getLanguages?start=${payload.start}&limit=${payload.limit}&search=${q}`
    );
  }
);

export const createSingleLanguage = createAsyncThunk(
  "language/createSingleLanguage",
  async (formData: FormData) => {
    return apiInstanceFetch.post(
      "api/admin/language/createSingleLanguage",
      formData
    );
  }
);

export const updateSingleLanguage = createAsyncThunk(
  "language/updateSingleLanguage",
  async (formData: FormData) => {
    return apiInstanceFetch.patch(
      "api/admin/language/updateSingleLanguage",
      formData
    );
  }
);

export const toggleTheSwitch = createAsyncThunk(
  "language/toggleTheSwitch",
  async (payload: { languageCode: string; toggleType: 1 | 2 }) => {
    const { languageCode, toggleType } = payload;
    return apiInstanceFetch.patch(
      `api/admin/language/toggleTheSwitch?languageCode=${encodeURIComponent(
        languageCode
      )}&toggleType=${toggleType}`,
      {}
    );
  }
);

export const deleteTheLanguage = createAsyncThunk(
  "language/deleteTheLanguage",
  async (languageCode: string) => {
    return apiInstanceFetch.delete(
      `api/admin/language/deleteTheLanguage?languageCode=${encodeURIComponent(
        languageCode
      )}`
    );
  }
);

export const uploadMultipleTranslations = createAsyncThunk(
  "language/uploadMultipleTranslations",
  async (formData: FormData) => {
    return apiInstanceFetch.post(
      "api/admin/translation/uploadMultipleTranslations",
      formData
    );
  }
);

export const getSingleLanguageTranslations = createAsyncThunk(
  "language/getSingleLanguageTranslations",
  async (payload: { languageCode: string; module: "app" | "web" }) => {
    const { languageCode, module } = payload;
    return apiInstanceFetch.get(
      `api/admin/translation/getSingleLanguageTranslations?languageCode=${encodeURIComponent(
        languageCode
      )}&module=${module}`
    );
  }
);

export const updateTranslationsOfSingleLanguage = createAsyncThunk(
  "language/updateTranslationsOfSingleLanguage",
  async (payload: {
    languageCode: string;
    module: "app" | "web";
    translations: Record<string, string>;
  }) => {
    return apiInstanceFetch.patch(
      "api/admin/translation/updateTranslationsOfSingleLanguage",
      payload
    );
  }
);

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getLanguages.pending, (state) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getLanguages.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        const raw = action.payload?.data ?? action.payload?.languages ?? [];
        state.languages = Array.isArray(raw) ? raw : [];
        // state.total =
        //   action.payload?.total ??
        //   action.payload?.count ??
        //   state.languages.length;
        state.total = 0;
      }
    );
    builder.addCase(getLanguages.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(createSingleLanguage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createSingleLanguage.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Language created successfully");
        } else {
          DangerRight(
            action.payload?.data?.message ||
              action.payload?.message ||
              "Failed to create language"
          );
        }
      }
    );
    builder.addCase(createSingleLanguage.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateSingleLanguage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateSingleLanguage.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Language updated successfully");
        } else {
          DangerRight(
            action.payload?.data?.message ||
              action.payload?.message ||
              "Failed to update language"
          );
        }
      }
    );
    builder.addCase(updateSingleLanguage.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(
      toggleTheSwitch.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Updated");
        }
        else {
          DangerRight(
              action.payload?.message ||
              "Failed to update language"
          );
        }
      }
    );

    builder.addCase(
      deleteTheLanguage.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Language deleted");
        }
      }
    );

    builder.addCase(
      uploadMultipleTranslations.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Translations uploaded");
        }
        else {
          DangerRight(
            action.payload?.message ||
              "Failed to upload translations"
          );
        }
      }
    );

    builder.addCase(
      updateTranslationsOfSingleLanguage.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload?.status !== false) {
          Success(action.payload?.message || "Translations saved");
        }
      }
    );
  },
});

export default languageSlice.reducer;
