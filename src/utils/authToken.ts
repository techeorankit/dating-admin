/**
 * Redux-backed Firebase ID token store.
 * JWT is never written to localStorage or sessionStorage — Firebase IndexedDB
 * is the credential source of truth; on page refresh, Firebase restores credentials
 * and populates the Redux state.
 */
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/component/lib/firebaseConfig";
import { setToken } from "@/utils/setAuthAxios";

let memoryToken: string | null = null;
let memoryUid: string | null = null;
let memoryCredential: string | null = null;
let listenerInitialized = false;
let authInitialized = false;
let authReadyPromise: Promise<void> | null = null;
let storeRef: any = null;

export function setStoreRef(store: any): void {
  storeRef = store;
}

function getStore(): any {
  if (!storeRef) {
    try {
      const { store } = require("@/store/store");
      storeRef = store;
    } catch {
      // Store not initialized yet
    }
  }
  return storeRef;
}

function dispatchReduxToken(token: string | null, uid?: string | null): void {
  const store = getStore();
  if (store) {
    try {
      store.dispatch({
        type: "admin/setAdminToken",
        payload: { token, uid: uid ?? memoryUid },
      });
    } catch {
      // Avoid dispatching if Redux is executing a reducer
    }
  }
}

export function getAuthToken(): string | null {
  if (memoryToken !== null && memoryToken !== undefined) {
    return memoryToken;
  }
  const store = getStore();
  if (store) {
    try {
      const reduxToken = store.getState()?.admin?.token;
      if (reduxToken !== undefined && reduxToken !== null) {
        memoryToken = reduxToken;
        return reduxToken;
      }
    } catch {
      // Cannot call store.getState() while reducer is executing
    }
  }
  return memoryToken;
}

export function getAuthUid(): string | null {
  if (memoryUid !== null && memoryUid !== undefined) {
    return memoryUid;
  }
  const store = getStore();
  if (store) {
    try {
      const reduxUid = store.getState()?.admin?.uid;
      if (reduxUid !== undefined && reduxUid !== null) {
        memoryUid = reduxUid;
        return reduxUid;
      }
    } catch {
      // Cannot call store.getState() while reducer is executing
    }
  }
  return memoryUid;
}

/** Set token in memory & Redux state. */
export function setAuthToken(token: string | null, uid?: string | null): void {
  memoryToken = token;
  if (uid !== undefined) {
    memoryUid = uid;
  }
  setToken(token ?? undefined);
  dispatchReduxToken(token, uid);
}

export function setInMemoryCredential(val: string | null): void {
  memoryCredential = val;
}

export function getInMemoryCredential(): string | null {
  return memoryCredential;
}

export function clearAuthToken(): void {
  memoryToken = null;
  memoryUid = null;
  memoryCredential = null;
  setToken(undefined);
  dispatchReduxToken(null, null);
}

/**
 * Remove legacy JWT from sessionStorage after Firebase has restored credentials.
 */
function removeLegacySessionToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
}

async function syncTokenFromUser(user: User | null): Promise<void> {
  if (!user) {
    clearAuthToken();
    return;
  }
  const uid = user.uid;
  const token = await user.getIdToken();
  setAuthToken(token, uid);
}

/**
 * Register Firebase onIdTokenChanged to keep Redux & memory JWT fresh.
 * Initial sync is handled by awaitAuthReady() to avoid a race where a null-user
 * callback clears the token after it was just populated.
 */
export function initFirebaseAuthListener(): void {
  if (listenerInitialized || typeof window === "undefined") return;
  listenerInitialized = true;

  onIdTokenChanged(auth, async (user) => {
    if (!authInitialized) return;
    await syncTokenFromUser(user);
    if (user) {
      removeLegacySessionToken();
    }
  });
}

/**
 * Wait until Firebase auth state is settled and the Redux JWT is synced.
 */
export function awaitAuthReady(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      initFirebaseAuthListener();
      await auth.authStateReady();
      await syncTokenFromUser(auth.currentUser);
      authInitialized = true;
      if (auth.currentUser) {
        removeLegacySessionToken();
      }
    })();
  }
  return authReadyPromise;
}

/**
 * Returns a fresh JWT when a Firebase user exists (used when memory/redux token is empty).
 */
export async function ensureAuthToken(): Promise<string | null> {
  await awaitAuthReady();
  const token = getAuthToken();
  if (token) return token;
  if (auth.currentUser) {
    await syncTokenFromUser(auth.currentUser);
    return getAuthToken();
  }
  return null;
}
