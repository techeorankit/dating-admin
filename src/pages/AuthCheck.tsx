import { useEffect } from "react";
import { useRouter } from "next/router";
import { isAuthenticated } from "@/utils/auth";

/** Routes accessible without an authenticated session */
const PUBLIC_ROUTES = ["/", "/Login", "/Registration", "/ForgotPassword", "/not-authorized"];

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = (props) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = router.pathname;
    if (PUBLIC_ROUTES.includes(path)) return;

    if (!isAuthenticated()) {
      router.push("/");
    }
  }, [router, router.pathname]);

  return <>{props.children}</>;
};

export default AuthCheck;
