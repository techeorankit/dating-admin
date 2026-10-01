// firebaseConfig.js
import { apiKey, appId, authDomain, measurementId, messagingSenderId, projectId, storageBucket } from "@/utils/config";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId
  };

  const missingConfig = Object.entries(firebaseConfig)
    .filter(([name, value]) => name !== "measurementId" && !value)
    .map(([name]) => name);

  if (missingConfig.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missingConfig.join(", ")}. Set the NEXT_PUBLIC_FIREBASE_* values in admin/.env.local.`
    );
  }
  
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
  export const auth = getAuth(app);
  export const storage = getStorage(app);
