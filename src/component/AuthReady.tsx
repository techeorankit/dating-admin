"use client";

import { useEffect, useState } from "react";
import {
  awaitAuthReady,
} from "@/utils/authToken";

interface AuthReadyProps {
  children: React.ReactNode;
}

/**
 * Blocks child render until Firebase auth state is ready and memory JWT is synced,
 * preventing API calls from racing ahead of token restoration on refresh.
 */
export default function AuthReady({ children }: AuthReadyProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    awaitAuthReady().then(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
