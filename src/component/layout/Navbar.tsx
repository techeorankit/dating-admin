import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useSelector } from "react-redux";
import NotificationDialog from "../user/NotificationDialogue";
import { adminProfileGet } from "@/store/adminSlice";
import { getDefaultCurrency, getSetting } from "@/store/settingSlice";
import { baseURL } from "@/utils/config";
import { getAuthUser } from "@/utils/auth";
import { useIsStaffLogin } from "@/hooks/useIsStaffLogin";

const Navbar = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState<{ name?: string; image?: string }>(
    {}
  );
  const { admin } = useSelector((state: RootStore) => state?.admin);
  const adminDataInitialized = useRef(false); // Ref to track initialization

  const dispatch = useAppDispatch();

  const isStaffLogin = useIsStaffLogin();

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  useEffect(() => {
    const { isAuth } = getAuthUser();
    if (!isAuth) return;
    dispatch(adminProfileGet());
    // dispatch(getSetting());
    // dispatch(getDefaultCurrency());
  }, [dispatch]);

  useEffect(() => {
    setAdminData(admin?.image);
  }, [dispatch]);

  const handleNotify = (id: any) => {
    dispatch(
      openDialog({ type: "notification", data: { id, type: "Alluser" } })
    );
  };

  const enterFullscreen = () => {
    document.body.requestFullscreen();
  };

  return (
    <div className="mainNavbar">
      <div className="navBar">
        <div className="innerNavbar betBox">
          {dialogueType == "notification" && <NotificationDialog />}
          <div className="leftNav d-flex align-items-center">
            <i
              className={`${`ri-bar-chart-horizontal-line`} cursor-pointer fs-20 navToggle`}
            ></i>
            <a onClick={enterFullscreen} className="ms-3 text-white cursor">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9F5AFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="feather feather-maximize"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </a>
          </div>

          <div className="rightNav">
            <div className="adminProfile d-flex align-items-center cursor-pointer">
              {!isStaffLogin && (
                <button
                  type="button"
                  className="text-white fs-25 m20-right navbarNotifyBtn"
                  onClick={() => handleNotify(admin?._id)}
                  style={{ background: "transparent" }}
                >
                  <img
                    src={`/images/notification.svg`}
                    alt=""
                    className="navbarNotifyIcon"
                  />
                </button>
              )}
              <Link
                href="/adminProfile"
                className="navbarProfileLink d-flex align-items-center text-decoration-none flex-shrink-0"
                style={{ backgroundColor: "inherit" }}
              >
                <div className="adminPic">
                  <img
                    src={
                      admin?.image ? baseURL + admin?.image : `/images/male.png`
                    }
                    alt=""
                    className="cursor navbarProfileImg"
                    onError={(e) => {
                      e.currentTarget.src = "/images/male.png";
                    }}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
