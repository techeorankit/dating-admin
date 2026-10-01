export const baseURL: string = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/").replace(/\/?$/, "/");
// URL prefix the panel is served under (e.g. "/admin"); Next's basePath does not rewrite raw asset paths or window.location.
export const basePath: string = (process.env.NEXT_PUBLIC_APP_BASE_PATH || "").replace(/\/+$/, "");
export const key: string = process.env.NEXT_PUBLIC_API_KEY || "";
export const projectName: string = process.env.NEXT_PUBLIC_PROJECT_NAME || "Batting";
export const apiKey: string = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
export const authDomain: string = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "";
export const projectId: string = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
export const storageBucket: string = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "";
export const messagingSenderId: string = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "";
export const appId: string = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "";
export const measurementId: string = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "";