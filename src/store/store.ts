"use client";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from './persistStorage';
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import adminSlice from "./adminSlice";
import dashboardSlice from "./dashboardSlice";
import settingSlice from "./settingSlice";
import notificationSlice from "./notificationSlice";
import dialogSlice from "./dialogSlice";
import hostRequestSlice from "./hostRequestSlice"
import giftSlice from "./giftSlice";
import impressionSlice from "./impressionSlice";
import coinPlanSlice from "./coinPlanSlice";
import vipPlanSlice from "./vipPlanSlice";
import dailyCheckInRewardSlice from "./dailyCheckInRewardSlice";
import userSlice from "./userSlice";
import agencySlice from "./agencySlice";
import hostSlice from "./hostSlice"
import withdrawalSlice from "./withdrawalSlice"
import roleSlice from "./roleSlice";
import reportReasonSlice from "./reportReasonSlice";
import reportSlice from "./reportSlice";
import languageSlice from "./languageSlice";


// Add persist config for admin slice — no auth fields persisted
const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: [] as string[],
};

const persistedAdminReducer = persistReducer(adminPersistConfig, adminSlice);

export function makeStore() {
  return configureStore({
    reducer: {
      admin: persistedAdminReducer,
      hostRequest: hostRequestSlice,
      user: userSlice,
      dashboard: dashboardSlice,
      gift: giftSlice,
      setting: settingSlice,
      notification: notificationSlice,
      dialogue: dialogSlice,
      impression: impressionSlice,
      coinPlan: coinPlanSlice,
      vipPlan: vipPlanSlice,
      dailyReward: dailyCheckInRewardSlice,
      agency: agencySlice,
      withdrawal: withdrawalSlice,
      host: hostSlice,
      role: roleSlice,
      reportReason: reportReasonSlice,
      report: reportSlice,
      language: languageSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
}
import { setStoreRef } from "@/utils/authToken";

export const store = makeStore();
setStoreRef(store);
export const persistor = persistStore(store);

export type RootStore = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<any> = useSelector;
