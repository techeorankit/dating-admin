"use client";
import { useEffect } from "react";
import { Providers } from "@/Provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/scss/custom/custom.css";
import "../assets/scss/default/default.css";
import "../assets/scss/style/style.css";
import "../assets/scss/dateRange.css";
import axios from "axios";
import { baseURL, key } from "@/utils/config";
import AuthCheck from "./AuthCheck";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PermissionProvider } from "@/context/PermissionContext";
import { PaginationRouteTracker } from "@/hooks/usePersistedPagination";
import SessionIntegrityGuard from "@/component/SessionIntegrityGuard";
import AuthReady from "@/component/AuthReady";
import { assertSessionIntegrityOrLogout } from "@/utils/sessionIntegrity";
import { getAuthToken } from "@/utils/authToken";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const id = axios.interceptors.request.use(
      (config) => {
        if (!assertSessionIntegrityOrLogout()) {
          return Promise.reject(new axios.Cancel("SESSION_INTEGRITY"));
        }
        const token = getAuthToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );
    return () => axios.interceptors.request.eject(id);
  }, []);

  const getLayout = Component.getLayout || ((page) => page);
  axios.defaults.baseURL = baseURL;
  axios.defaults.headers.common["key"] = key;

  return getLayout(
    <Providers>
      <AuthReady>
        <SessionIntegrityGuard>
          <PermissionProvider>
            <PaginationRouteTracker />
            <AuthCheck>
              <ToastContainer />
              <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                <Component {...pageProps} />
              </SkeletonTheme>
            </AuthCheck>
          </PermissionProvider>
        </SessionIntegrityGuard>
      </AuthReady>
    </Providers>
  );
}
