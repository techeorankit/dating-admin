import React, { useEffect, useRef, useState } from "react";
import "@/app/settings.css";
import RootLayout from "@/component/layout/Layout";
import Title from "@/extra/Title";
import AdminSetting from "@/component/setting/AdminSetting";
import PaymetSetting from "@/component/setting/PaymentSetting";
import WithdrawSetting from "@/component/setting/WithdrawSetting";
import CurrencySetting from "@/component/setting/CurrencySetting";
import DocumentType from "./DocumentType";
import Other from "./Other";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";
import { usePermission } from "@/context/PermissionContext";

const Setting = () => {

  const [type, setType] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { canSee } = usePermission();

  useEffect(() => {
    const storedType = localStorage.getItem("planType") || "Setting";
    if (storedType) setType(storedType);
  }, []);

  useEffect(() => {
    if (type) {
      localStorage.setItem("planType", type);
    }
  }, [type]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [type]);

  useEffect(() => {
    routerChange("/Setting", "planType", router);
  }, []);

  useEffect(() => {
    if (!canSee("Setting")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  const isActive = (tab: string) => type === tab || (tab === "Setting" && type === null);

  const showToolbarSubmit =
    type === null ||
    type === "Setting" ||
    type === "PaymetSetting" ||
    type === "WithdrawSetting";

  const submitFormId =
    type === "WithdrawSetting" ? "settings-withdraw-form" : "settings-tab-form";

  return (
    <div className="settings-shell">
        <div className="settings-toolbar settings-toolbar-sticky">
          <header className="settings-page-header">
            <Title
              name="Setting"
              description="Manage your application configuration and preferences."
              display="none"
              bottom="0"
            />
          </header>

          <div className="settings-toolbar-row settings-toolbar-row--tabs">
            <nav className="settings-nav" aria-label="Settings sections">
              <button
                type="button"
                className={`settings-nav-link ${isActive("Setting") ? "active" : ""}`}
                onClick={() => setType("Setting")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-settings-3-line settings-nav-icon" aria-hidden />
                  Setting
                </span>
              </button>

              <button
                type="button"
                className={`settings-nav-link ${type === "PaymetSetting" ? "active" : ""}`}
                onClick={() => setType("PaymetSetting")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-bank-card-line settings-nav-icon" aria-hidden />
                  Payment Setting
                </span>
              </button>

              <button
                type="button"
                className={`settings-nav-link ${type === "WithdrawSetting" ? "active" : ""}`}
                onClick={() => setType("WithdrawSetting")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-wallet-line settings-nav-icon" aria-hidden />
                  Withdraw Setting
                </span>
              </button>

              <button
                type="button"
                className={`settings-nav-link ${type === "CurrencySetting" ? "active" : ""}`}
                onClick={() => setType("CurrencySetting")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-money-dollar-circle-line settings-nav-icon" aria-hidden />
                  Currency Setting
                </span>
              </button>

              <button
                type="button"
                className={`settings-nav-link ${type === "DocumentType" ? "active" : ""}`}
                onClick={() => setType("DocumentType")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-file-shield-line settings-nav-icon" aria-hidden />
                  Identity Proof
                </span>
              </button>

              <button
                type="button"
                className={`settings-nav-link ${type === "Other" ? "active" : ""}`}
                onClick={() => setType("Other")}
              >
                <span className="settings-nav-link-inner">
                  <i className="ri-apps-2-line settings-nav-icon" aria-hidden />
                  Other
                </span>
              </button>
            </nav>
          </div>

          {showToolbarSubmit && (
            <div className="settings-toolbar-row settings-toolbar-row--actions">
              <div className="settings-toolbar-actions">
                <button
                  type="submit"
                  form={submitFormId}
                  className="settings-submit-btn settings-toolbar-submit fw-bold"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      <div className="settings-shell-body" ref={bodyRef}>
        <div className="settings-page">
          <div className="settings-layout">
            <div className="settings-tab-panel">
              {(type === "Setting" || type === null) && <AdminSetting />}
              {type === "PaymetSetting" && <PaymetSetting />}
              {type === "WithdrawSetting" && <WithdrawSetting />}
              {type === "CurrencySetting" && <CurrencySetting />}
              {type === "DocumentType" && <DocumentType />}
              {type === "Other" && <Other />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Setting.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Setting;
