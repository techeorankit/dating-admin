import { ExInput, Textarea } from "@/extra/Input";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { getDefaultCurrency, getSetting, handleSetting, updateSetting } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { isSkeleton } from "@/utils/allSelector";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import coin from "@/assets/images/coin.png";
import InfoTooltip from "@/extra/InfoTooltip";
import {
  agoracontent,
  appActiveContent,
  appSettingContent,
  autoCallMessageContent,
  callChargeContent,
  chatSettingContent,
  coinSettingContent,
  deeplinkSettingContent,
  emailSettingContent,
  fakeDataContent,
  firebaseNotificationContent,
  loginBonusContent,
  screenLoadContent,
  supportPhoneNumberContent,
} from "@/extra/infoContent";
import { setToast } from "@/utils/toastServices";

type Settings = {
  [key: string]: any;
};

interface ErrorState {
  privacyPolicyLinkText: string;
  tncText: any;
  taxText: any;
  loginBonus: any;
  firebaseKeyText: string;
  minWithdrawText: string;
  zegoAppId: string;
  agoraAppId: string;
  agoraAppCertificate: string;
  minCoinsToConvert: string;
  adminCommissionRate: string;
  maxFreeChatMessages: string;
  chatInteractionRate: string;
  maleRandomCallRate: string;
  femalRandomCallRate: string;
  generalRadomCallRate: string;
  audioPrivateCallRate: string;
  videoPrivateCallRate: string;
  messageInitiatedAt: string;
  callInitiatedAt: string;
  isAutoCallEnabled: string;
  isAutoMessageEnabled: string;
  androidAppVersion: string;
  iosAppVersion: string;
  androidAppLink: string;
  iosAppLink: string;
  androidAssetLinks: string;
  appleAppSiteAssociation: string;
  supportPhoneNumber: string;
}

const AdminSetting = () => {
  const roleSkeleton = useSelector(isSkeleton);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);


  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);

  const [privacyPolicyLinkText, setPrivacyPolicyLinkText] = useState<any>();
  const [tncText, setTncText] = useState<any>();
  const [loginBonus, setLoginBonus] = useState<any>();
  const [firebaseKeyText, setFirebaseKeyText] = useState<any>();
  const [minWithdrawText, setmMinWithdrawText] = useState<any>();
  const [agoraAppId, setAgoraAppId] = useState<any>("");
  const [agoraAppCertificate, setAgoraAppCertificate] = useState<any>("");
  const [minCoinsToConvert, setMinCoinsToConvert] = useState<any>();
  const [isUnderMaintenance, setIsUnderMaintenance] = useState<boolean>(false);
  const [chatInteractionRate, setChatInteractionRate] = useState("");
  const [maxFreeChatMessages, setMaxFreeChatMessages] = useState("");
  const [adminCommissionRate, setAdminCommissionRate] = useState("");

  const [maleRandomCallRate, setMaleRandomCallRate] = useState("");
  const [femalRandomCallRate, setFemaleRandomCallRate] = useState("");
  const [generalRadomCallRate, setGeneralRadomCallRate] = useState("");
  const [audioPrivateCallRate, setAudioPrivateCallRate] = useState("");
  const [videoPrivateCallRate, setVideoPrivateCallRate] = useState("");

  const [androidAppVersion, setAndroidAppVersion] = useState<any>("");
  const [iosAppVersion, setIosAppVersion] = useState<any>("");
  const [androidAppLink, setAndroidAppLink] = useState<any>("");
  const [iosAppLink, setIosAppLink] = useState<any>("");

  const [resendApiKey, setResendApiKey] = useState<string>("");
  const [androidAssetLinks, setAndroidAssetLinks] = useState<string>("");
  const [appleAppSiteAssociation, setAppleAppSiteAssociation] = useState<string>("");

  const [supportPhoneNumber, setSupportPhoneNumber] = useState<string>("");

  const [messageInitiatedAt, setMessageInitiatedAt] = useState("");
  const [callInitiatedAt, setCallInitiatedAt] = useState("");

  const [isAppActive, setIsAppActive] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [isAutoCallEnabled, setIsAutoCallEnabled] = useState(false);
  const [isAutoMessageEnabled, setIsAutoMessageEnabled] = useState(false);

  const [data, setData] = useState<any>();
  const [initialData, setInitialData] = useState<any>({});

  const [error, setError] = useState<any>({
    privacyPolicyLinkText: "",
    tncText: "",
    taxText: "",
    loginBonus: "",
    firebaseKey: "",
    minWithdrawText: "",
    geminiKey: "",
    agoraAppId: "",
    agoraAppCertificate: "",
    minCoinsToConvert: "",
    adminCommissionRate: "",
    maxFreeChatMessages: "",
    chatInteractionRate: "",
    maleRandomCallRate: "",
    femalRandomCallRate: "",
    generalRadomCallRate: "",
    audioPrivateCallRate: "",
    videoPrivateCallRate: "",
    isAutoRefreshEnabled: "",
    isAutoCallEnabled: "",
    isAutoMessageEnabled: "",
    androidAppVersion: "",
    iosAppVersion: "",
    androidAppLink: "",
    iosAppLink: "",
    messageInitiatedAt: "",
    callInitiatedAt: "",
    androidAssetLinks: "",
    appleAppSiteAssociation: "",
    supportPhoneNumber: "",
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, [dispatch]);

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    setPrivacyPolicyLinkText(setting?.privacyPolicyLink);
    setTncText(setting?.termsOfUsePolicyLink);
    setLoginBonus(setting?.loginBonus);
    setFirebaseKeyText(JSON.stringify(setting?.privateKey));
    setmMinWithdrawText(setting?.minWithdrawalRequestedAmount);
    setAgoraAppId(setting?.agoraAppId);
    setAgoraAppCertificate(setting?.agoraAppCertificate);
    setIsUnderMaintenance(setting?.isDemoData);
    setMinCoinsToConvert(setting?.minCoinsToConvert);
    setAdminCommissionRate(setting?.adminCommissionRate);
    setMaxFreeChatMessages(setting?.maxFreeChatMessages);
    setChatInteractionRate(setting?.chatInteractionRate);
    setMaleRandomCallRate(setting?.maleRandomCallRate);
    setFemaleRandomCallRate(setting?.femaleRandomCallRate);
    setGeneralRadomCallRate(setting?.generalRandomCallRate);
    setAudioPrivateCallRate(setting?.audioPrivateCallRate);
    setVideoPrivateCallRate(setting?.videoPrivateCallRate);

    setAndroidAppVersion(setting?.androidAppVersion);
    setIosAppVersion(setting?.iosAppVersion);
    setAndroidAppLink(setting?.androidAppLink);
    setIosAppLink(setting?.iosAppLink);

    setResendApiKey(setting?.resendApiKey || "");

    if (setting?.androidAssetLinks) {
      setAndroidAssetLinks(
        typeof setting.androidAssetLinks === "string"
          ? setting.androidAssetLinks
          : JSON.stringify(setting.androidAssetLinks, null, 2)
      );
    } else {
      setAndroidAssetLinks("");
    }

    if (setting?.appleAppSiteAssociation) {
      setAppleAppSiteAssociation(
        typeof setting.appleAppSiteAssociation === "string"
          ? setting.appleAppSiteAssociation
          : JSON.stringify(setting.appleAppSiteAssociation, null, 2)
      );
    } else {
      setAppleAppSiteAssociation("");
    }

    setSupportPhoneNumber(setting?.supportPhoneNumber || "");

    setMessageInitiatedAt(setting?.messageInitiatedAt);
    setCallInitiatedAt(setting?.callInitiatedAt);

    setIsAppActive(setting?.isAppEnabled);
    setIsAutoRefreshEnabled(setting?.isAutoRefreshEnabled);
    setIsAutoCallEnabled(setting?.isAutoCallEnabled);
    setIsAutoMessageEnabled(setting?.isAutoMessageEnabled);

    setInitialData({ ...setting });
  }, [setting]);

  const handleSettingSwitch: any = (id: any, type: any) => {
    
    const payload = {
      settingId: id,
      type: type,
    };
    dispatch(handleSetting(payload));
  };

  const getUpdatedFields = () => {
    const updated: Partial<Settings> = {};
    const baseSetting: any = initialData && Object.keys(initialData || {}).length > 0 ? initialData : setting;

    const normalizeNumber = (v: any) => {
      if (v === null || v === undefined) return v;
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (!trimmed) return v;
        const n = Number(trimmed);
        return Number.isNaN(n) ? v : n;
      }
      return v;
    };

    const stableStringify = (value: any): string => {
      if (value === null || value === undefined) return JSON.stringify(value);
      if (typeof value !== "object") return JSON.stringify(value);
      if (Array.isArray(value)) return `[${value.map((x) => stableStringify(x)).join(",")}]`;

      const keys = Object.keys(value).sort();
      return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
    };

    const tryNormalizeJson = (v: any): any => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        try {
          return JSON.parse(trimmed);
        } catch {
          return v; // keep raw if invalid JSON
        }
      }
      return v; // already an object/array/etc.
    };

    const jsonEqual = (current: any, original: any) => {
      const a = tryNormalizeJson(current);
      const b = tryNormalizeJson(original);

      if (a === undefined && b === undefined) return true;
      const aIsObjectLike = a !== null && typeof a === "object";
      const bIsObjectLike = b !== null && typeof b === "object";
      if (aIsObjectLike && bIsObjectLike) return stableStringify(a) === stableStringify(b);
      return a === b;
    };

    const scalarEqual = (current: any, original: any) => {
      // Treat empty string and undefined/null as "same" to avoid false updates.
      const aEmpty = current === "" || current === undefined || current === null;
      const bEmpty = original === "" || original === undefined || original === null;
      if (aEmpty && bEmpty) return true;

      const an = normalizeNumber(current);
      const bn = normalizeNumber(original);
      const anIsNumber = typeof an === "number" && !Number.isNaN(an);
      const bnIsNumber = typeof bn === "number" && !Number.isNaN(bn);
      if (anIsNumber && bnIsNumber) return an === bn;

      return current === original;
    };

    const numericLikeKeys = new Set([
      "loginBonus",
      "minCoinsToConvert",
      "adminCommissionRate",
      "maxFreeChatMessages",
      "chatInteractionRate",
      "audioPrivateCallRate",
      "videoPrivateCallRate",
      "maleRandomCallRate",
      "femaleRandomCallRate",
      "generalRandomCallRate",
      "messageInitiatedAt",
      "callInitiatedAt",
    ]);

    const fields: any = {
      privacyPolicyLink: privacyPolicyLinkText,
      loginBonus: parseInt(loginBonus),
      privateKey: firebaseKeyText,
      agoraAppId,
      agoraAppCertificate,
      minCoinsToConvert,
      adminCommissionRate,
      maxFreeChatMessages,
      chatInteractionRate,
      audioPrivateCallRate,
      videoPrivateCallRate,
      maleRandomCallRate,
      femaleRandomCallRate: femalRandomCallRate,
      generalRandomCallRate: generalRadomCallRate,
      messageInitiatedAt,
      callInitiatedAt,
      androidAppVersion,
      iosAppVersion,
      androidAppLink,
      iosAppLink,
      resendApiKey,
      androidAssetLinks,
      appleAppSiteAssociation,
      supportPhoneNumber,
    };

    Object.keys(fields).forEach((key) => {
      if (key === "privateKey") {
        const currentValue = fields.privateKey;
        const originalValue = baseSetting?.privateKey;
        if (!jsonEqual(currentValue, originalValue)) {
          updated.privateKey = fields.privateKey;
        }
      } else if (key === "androidAssetLinks") {
        const currentRaw = androidAssetLinks;
        const originalValue = baseSetting?.androidAssetLinks;

        if (!jsonEqual(currentRaw, originalValue)) {
          try {
            updated.androidAssetLinks = JSON.parse(currentRaw);
          } catch {
            // Keep as string if the user entered invalid JSON (or cleared it).
            updated.androidAssetLinks = currentRaw;
          }
        }
      } else if (key === "appleAppSiteAssociation") {
        const currentRaw = appleAppSiteAssociation;
        const originalValue = baseSetting?.appleAppSiteAssociation;

        if (!jsonEqual(currentRaw, originalValue)) {
          try {
            updated.appleAppSiteAssociation = JSON.parse(currentRaw);
          } catch {
            updated.appleAppSiteAssociation = currentRaw;
          }
        }
      } else {
        const currentValue = fields[key];
        const originalValue = baseSetting?.[key];

        const equals = numericLikeKeys.has(key) ? scalarEqual(currentValue, originalValue) : scalarEqual(currentValue, originalValue);
        // scalarEqual already normalizes numeric strings vs numbers, so we just reuse it.
        if (!equals) {
          (updated as any)[key] = currentValue;
        }
      }
    });

    return updated;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    if (
      !privacyPolicyLinkText ||
      !tncText ||
      !loginBonus ||
      !firebaseKeyText ||
      !minCoinsToConvert ||
      !agoraAppId ||
      !agoraAppCertificate ||
      !adminCommissionRate ||
      !maxFreeChatMessages ||
      !chatInteractionRate ||
      !maleRandomCallRate ||
      !femalRandomCallRate ||
      !generalRadomCallRate ||
      !audioPrivateCallRate ||
      !videoPrivateCallRate ||
      !messageInitiatedAt ||
      !callInitiatedAt ||
      !supportPhoneNumber
    ) {
      {
        let error = {} as ErrorState;
        if (!privacyPolicyLinkText) error.privacyPolicyLinkText = "privacyPolicyLink Is Required !";
        if (!tncText) error.tncText = "Terms and Condition Is Required !";
        if (!loginBonus) error.loginBonus = "LoginBonus Is Required !";
        if (!firebaseKeyText) error.firebaseKeyText = "FirbaseKey Is Required !";
        if (!agoraAppId) error.agoraAppId = "AgoraappId Is Required !";
        if (!agoraAppCertificate) error.agoraAppCertificate = "AgoraApp SignIn Is Required !";
        if (!minCoinsToConvert) error.minCoinsToConvert = "Minimum Coins For Withdrawal is Required !";

        if (!adminCommissionRate) error.adminCommissionRate = "Admin Commission Rate is Required !";

        if (!maxFreeChatMessages) error.maxFreeChatMessages = "Maximum Free Chat Message is Required !";

        if (!chatInteractionRate) error.chatInteractionRate = "Chat Interaction Rate is Required !";

        if (!maleRandomCallRate) error.maleRandomCallRate = "Male Radom Call Rate is Required !";

        if (!femalRandomCallRate) error.femalRandomCallRate = "Female Radnom Call Rate is Required !";

        if (!generalRadomCallRate) error.generalRadomCallRate = "Genral Radnom Call Rate is Required !";

        if (!audioPrivateCallRate) error.audioPrivateCallRate = "Audio Private Call Rate is Required !";

        if (!videoPrivateCallRate) error.videoPrivateCallRate = "Video Private Call Rate is Required !";

        if (!messageInitiatedAt) error.messageInitiatedAt = "Message Initiat Time Is Required !";
        if (!callInitiatedAt) error.callInitiatedAt = "Call Initiat Time Is Required !";
        if (!supportPhoneNumber) error.supportPhoneNumber = "Support phone number is required!";

        return setError({ ...error });
      }
    } else {
      const updatedFields = getUpdatedFields();

      if (Object.keys(updatedFields).length === 0) {
        setToast("info", "No changes found");
        return;
      }

      const payload = {
        settingId: data?._id,
        settingDataSubmit: updatedFields,
      };

      dispatch(updateSetting(payload));
    }
  };

  const handleReset = () => {
    
    setPrivacyPolicyLinkText(initialData?.privacyPolicyLink);
    setTncText(initialData?.termsOfUsePolicyLink);
    setLoginBonus(initialData?.loginBonus);
    setFirebaseKeyText(JSON.stringify(initialData?.privateKey));
    setmMinWithdrawText(initialData?.minWithdrawalRequestedAmount);
    setAgoraAppId(initialData?.agoraAppId);
    setAgoraAppCertificate(initialData?.agoraAppCertificate);
    setIsUnderMaintenance(initialData?.isDemoData);
    setMinCoinsToConvert(initialData?.minCoinsToConvert);
    setAdminCommissionRate(initialData?.adminCommissionRate);
    setMaxFreeChatMessages(initialData?.maxFreeChatMessages);
    setChatInteractionRate(initialData?.chatInteractionRate);
    setMaleRandomCallRate(initialData?.maleRandomCallRate);
    setFemaleRandomCallRate(initialData?.femaleRandomCallRate);
    setGeneralRadomCallRate(initialData?.generalRandomCallRate);
    setAudioPrivateCallRate(initialData?.audioPrivateCallRate);
    setVideoPrivateCallRate(initialData?.videoPrivateCallRate);
    setMessageInitiatedAt(initialData?.messageInitiatedAt);
    setCallInitiatedAt(initialData?.callInitiatedAt);
    setIsAppActive(initialData?.isAppEnabled);
    setIsAutoRefreshEnabled(initialData?.isAutoRefreshEnabled);
    setAndroidAppVersion(initialData?.androidAppVersion);
    setIosAppVersion(initialData?.iosAppVersion);
    setAndroidAppLink(initialData?.androidAppLink);
    setIosAppLink(initialData?.iosAppLink);
    setResendApiKey(initialData?.resendApiKey || "");
    setAndroidAssetLinks(initialData?.androidAssetLinks || "");
    setAppleAppSiteAssociation(initialData?.appleAppSiteAssociation || "");
    setSupportPhoneNumber(initialData?.supportPhoneNumber || "");
  };

  return (
    <>
      <div className="mainSetting">
        <form onSubmit={handleSubmit} id="settings-tab-form">
          <div className="settingBox row">
            <div className="col-12 col-md-6 mt-3 ">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Fake Data Setting</h4>
                  <InfoTooltip title={"Fake Data"} content={fakeDataContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                <div className="setting-box-toggle-row d-flex justify-content-between align-items-start">
                  {roleSkeleton === true ? (
                    <>
                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "60%",
                          marginLeft: "15px",
                        }}
                      ></div>

                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "7%",
                          borderRadius: "20px",
                        }}
                      ></div>
                    </>
                  ) : (
                    <>
                      <div className="setting-box-label">
                        Show fake data in app{" "}
                        <span className="setting-box-label-hint">(Enable/Disable)</span>
                      </div>

                      <div>
                        <ToggleSwitch
                          onClick={() => {
                            
                            handleSettingSwitch(setting?._id, "isDemoData");
                          }}
                          value={isUnderMaintenance}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">App Active Setting</h4>
                  <InfoTooltip title={"App Active"} content={appActiveContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                <div
                  className="d-flex justify-content-between align-items-start"
                  style={{
                    paddingRight: "20px",
                  }}
                >
                  {roleSkeleton === true ? (
                    <>
                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "60%",
                          marginLeft: "15px",
                        }}
                      ></div>

                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "7%",
                          borderRadius: "20px",
                        }}
                      ></div>
                    </>
                  ) : (
                    <>
                      <p className="isfake">
                        Show app as active{" "}
                        <span className="" style={{ fontSize: "12px" }}>
                          (Enable/Disable)
                        </span>
                      </p>

                      <div>
                        <ToggleSwitch
                          onClick={() => {
                            
                            handleSettingSwitch(setting?._id, "isAppEnabled");
                          }}
                          value={isAppActive}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Screen Load Behavior Setting</h4>
                  <InfoTooltip title={"Screen Load"} content={screenLoadContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                <div className="setting-box-toggle-row d-flex justify-content-between align-items-start">
                  {roleSkeleton === true ? (
                    <>
                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "60%",
                          marginLeft: "15px",
                        }}
                      ></div>

                      <div
                        className="skeleton mb-4"
                        style={{
                          height: "24px",
                          width: "7%",
                          borderRadius: "20px",
                        }}
                      ></div>
                    </>
                  ) : (
                    <>
                      <div className="setting-box-label">
                        Automatically reload data on screen in app{" "}
                        <span className="setting-box-label-hint">(Enable/Disable)</span>
                      </div>

                      <div>
                        <ToggleSwitch
                          onClick={() => {
                            
                            handleSettingSwitch(setting?._id, "isAutoRefreshEnabled");
                          }}
                          value={isAutoRefreshEnabled}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader d-flex align-items-center gap-2">
                    <span>
                      Login Bonus Setting{" "}
                      <img
                        src="/images/coin.webp"
                        alt="coin"
                        style={{ width: 20, height: 20, verticalAlign: "middle" }}
                      />
                    </span>
                  </h4>
                  <InfoTooltip title={"Login Bonus"} content={loginBonusContent} />
                </div>
                {roleSkeleton ? (
                  <div className="mb-4">
                    {/* Label skeleton */}
                    <div
                      className="skeleton mb-2"
                      style={{
                        height: "16px",
                        width: "30%",
                        marginLeft: "15px",
                      }}
                    ></div>

                    {/* Input skeleton */}
                    <div
                      className="skeleton"
                      style={{
                        height: "40px",
                        width: "97%",
                        borderRadius: "8px",
                        marginLeft: "10px",
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="setting-box-body">
                    <div className="col-12 mt-2">
                      <ExInput
                        type={`text`}
                        id={`loginBonus`}
                        name={`loginBonus`}
                        // label={`Login Bonus`}
                        placeholder={`Login Bonus`}
                        errorMessage={error.loginBonus && error.loginBonus}
                        value={loginBonus}
                        onChange={(e: any) => {
                          setLoginBonus(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              loginBonus: `Commision Is Required`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              loginBonus: `login bonus can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              loginBonus: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3 ">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Call Charge Setting</h4>
                  <InfoTooltip title={"Call Charge"} content={callChargeContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />

                {roleSkeleton ? (
                  <div className="setting-box-body">
                    <div className="skeleton mb-2" style={{ height: 16, width: "45%" }} />
                    <div className="setting-random-call-row mb-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i}>
                          <div className="skeleton mb-2" style={{ height: 14, width: "50%" }} />
                          <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 8 }} />
                        </div>
                      ))}
                    </div>
                    <div className="skeleton mb-2" style={{ height: 16, width: "45%", marginTop: 8 }} />
                    <div className="setting-private-call-row">
                      {[...Array(2)].map((_, i) => (
                        <div key={i}>
                          <div className="skeleton mb-2" style={{ height: 14, width: "50%" }} />
                          <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 8 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-coin-label-row mt-2">
                      <span className="setting-box-label">
                        Random Call Charge{" "}
                        <img
                          src="/images/coin.webp"
                          alt="coin"
                          style={{ width: 20, height: 20, verticalAlign: "middle" }}
                        />
                      </span>
                    </div>
                    <div className="setting-random-call-row">
                      <ExInput
                        type={`number`}
                        id={`maleRandomCallRate`}
                        name={`maleRandomCallRate`}
                        label={`Male`}
                        placeholder={`Male`}
                        errorMessage={error.maleRandomCallRate && error.maleRandomCallRate}
                        value={maleRandomCallRate}
                        onChange={(e: any) => {
                          setMaleRandomCallRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              maleRandomCallRate: `Male Random Call Rate is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              maleRandomCallRate: `Male Random Call Rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              maleRandomCallRate: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`number`}
                        id={`femalRandomCallRate`}
                        name={`femalRandomCallRate`}
                        label={`Female`}
                        placeholder={`Female`}
                        errorMessage={error.femalRandomCallRate && error.femalRandomCallRate}
                        value={femalRandomCallRate}
                        onChange={(e: any) => {
                          setFemaleRandomCallRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              femalRandomCallRate: `Female Random Call Rate is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              femalRandomCallRate: `Female Random Call Rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              femalRandomCallRate: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`number`}
                        id={`both`}
                        name={`both`}
                        label={`Both`}
                        placeholder={`Both`}
                        errorMessage={error.generalRadomCallRate && error.generalRadomCallRate}
                        value={generalRadomCallRate}
                        onChange={(e: any) => {
                          setGeneralRadomCallRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              generalRadomCallRate: `General Radom Call Rate is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              generalRadomCallRate: `General Random Call Rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              generalRadomCallRate: "",
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="setting-coin-label-row setting-coin-label-row--spaced">
                      <span className="setting-box-label">
                        Private Call Charge{" "}
                        <img
                          src="/images/coin.webp"
                          alt="coin"
                          style={{ width: 20, height: 20, verticalAlign: "middle" }}
                        />
                      </span>
                    </div>
                    <div className="setting-private-call-row">
                      <ExInput
                        type={`text`}
                        id={`audio`}
                        name={`audio`}
                        label={`Audio`}
                        placeholder={`Audio`}
                        errorMessage={error.audioPrivateCallRate && error.audioPrivateCallRate}
                        value={audioPrivateCallRate}
                        onChange={(e: any) => {
                          setAudioPrivateCallRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              audioPrivateCallRate: `Audio Private Call Rate Is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              audioPrivateCallRate: `Audio Private Call Rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              audioPrivateCallRate: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`video`}
                        name={`video`}
                        label={`Video`}
                        placeholder={`Video`}
                        errorMessage={error.videoPrivateCallRate && error.videoPrivateCallRate}
                        value={videoPrivateCallRate}
                        onChange={(e: any) => {
                          setVideoPrivateCallRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              videoPrivateCallRate: `Video Private Call Rate Is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              videoPrivateCallRate: `Video Private Call Rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              videoPrivateCallRate: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3 ">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Chat Setting</h4>
                  <InfoTooltip title={"Chat Setting"} content={chatSettingContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        {/* Label skeleton */}
                        <div
                          className="skeleton mb-3"
                          style={{
                            height: "24px",
                            width: "40%",
                            marginLeft: "15px",
                          }}
                        ></div>

                        {/* Input skeleton */}
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            width: "97%",
                            borderRadius: "8px",
                            marginLeft: "10px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-fields-stack mt-2">
                      <ExInput
                        type={`number`}
                        id={`maxfreechatmsg`}
                        name={`maxfreechatmsg`}
                        label={`Maximum Free Chat Message (User)`}
                        placeholder={`Maximum Free Chat Message (User)`}
                        errorMessage={error.maxFreeChatMessages && error.maxFreeChatMessages}
                        value={maxFreeChatMessages}
                        onChange={(e: any) => {
                          setMaxFreeChatMessages(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              maxFreeChatMessages: `Maximum Free Chat Message is required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              maxFreeChatMessages: `Max free chat message can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              maxFreeChatMessages: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`number`}
                        id={`chatInteractionRate`}
                        name={`chatInteractionRate`}
                        label={
                          <span className="setting-box-label">
                            Chat Interaction Rate{" "}
                            <img
                              src="/images/coin.webp"
                              alt="coin"
                              style={{
                                width: 20,
                                height: 20,
                                verticalAlign: "middle",
                              }}
                            />
                          </span>
                        }
                        placeholder={`Chat Interaction Rate`}
                        errorMessage={error.chatInteractionRate && error.chatInteractionRate}
                        value={chatInteractionRate}
                        onChange={(e: any) => {
                          setChatInteractionRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              chatInteractionRate: `Chat Interaction Rate Is Required !`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              chatInteractionRate: `chat interaction rate can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              chatInteractionRate: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3 ">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Coin Setting</h4>
                  <InfoTooltip title={"Coin Setting"} content={coinSettingContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    <div className="row align-items-center mb-4" style={{ marginLeft: "5px" }}>
                      <div className="col-5">
                        <div className="skeleton mb-2" style={{ height: "18px", width: "80%" }}></div>
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                            width: "100%",
                          }}
                        ></div>
                      </div>

                      {/* Equal symbol spacing */}
                      <div className="col-1 d-flex justify-content-center">
                        <div style={{ fontSize: "24px", opacity: 0.4 }}>=</div>
                      </div>

                      <div className="col-5">
                        <div className="skeleton mb-2" style={{ height: "18px", width: "80%" }}></div>
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                            width: "100%",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Admin Commission Charge */}
                    <div className="mt-2 mb-2">
                      <div
                        className="skeleton mb-2"
                        style={{
                          height: "18px",
                          width: "60%",
                          marginLeft: "10px",
                        }}
                      ></div>
                      <div
                        className="skeleton"
                        style={{
                          height: "40px",
                          width: "97%",
                          borderRadius: "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="row">
                      <div className="col-6 d-flex align-items-center mt-2">
                        <ExInput
                          type={`text`}
                          id={`amount`}
                          name={`amount`}
                          label={`Amount (${defaultCurrency?.symbol})`}
                          placeholder={`Amount`}
                          errorMessage={error.agoraAppId && error.agoraAppId}
                          readOnly={true}
                          value={`1 `}
                        />
                        <span
                          className="d-block mt-4"
                          style={{
                            marginLeft: "20px",
                          }}
                        >
                          =
                        </span>
                      </div>

                      <div
                        className="col-6 mt-2"
                        style={{
                          paddingLeft: "0px",
                        }}
                      >
                        <ExInput
                          type={`number`}
                          id={`coin`}
                          name={`coin`}
                          label={`Coin (how many coins for withdrawal)`}
                          placeholder={`Coin (how many coins for withdrawal)`}
                          errorMessage={error.minCoinsToConvert && error.minCoinsToConvert}
                          value={minCoinsToConvert}
                          onChange={(e: any) => {
                            setMinCoinsToConvert(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                minCoinsToConvert: `Minimum Coin For Withdrawal Is Required`,
                              });
                            } else if (e.target.value <= 0) {
                              return setError({
                                ...error,
                                minCoinsToConvert: `Minimum coin for withdrawal can not less than 0`,
                              });
                            } else {
                              return setError({
                                ...error,
                                minCoinsToConvert: "",
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <ExInput
                        type={`number`}
                        id={`admincommissioncharge`}
                        name={`admincommissioncharge`}
                        label={`Admin Commission Charge (%)`}
                        placeholder={`Admin Commission Charge (%)`}
                        errorMessage={error.adminCommissionRate && error.adminCommissionRate}
                        value={adminCommissionRate}
                        onChange={(e: any) => {
                          setAdminCommissionRate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              adminCommissionRate: `Admin Commission Charge is Required !`,
                            });
                          } else if (e.target.value > 100) {
                            return setError({
                              ...error,
                              adminCommissionRate: `Admin Commission Charge can not greater than 100`,
                            });
                          } else if (e.target.value <= 0) {
                            return setError({
                              ...error,
                              adminCommissionRate: `Admin Commission Charge can not less than 0`,
                            });
                          } else {
                            return setError({
                              ...error,
                              adminCommissionRate: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Firebase Notification Setting</h4>
                  <InfoTooltip title={"Firebase Notification"} content={firebaseNotificationContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    <div
                      className="skeleton mb-2"
                      style={{
                        height: "16px",
                        width: "30%",
                        marginLeft: "15px",
                      }}
                    ></div>

                    {/* Simulated Textarea */}
                    <div
                      className="skeleton mb-2"
                      style={{
                        height: "180px",
                        width: "98%",
                        borderRadius: "8px",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    ></div>
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="col-12 mt-2">
                      <Textarea
                        row={9}
                        type={`text`}
                        id={`firebaseKey`}
                        name={`firebaseKey`}
                        label={`Private key JSON`}
                        placeholder={`Enter firebaseKey`}
                        errorMessage={error.firebaseKeyText && error.firebaseKeyText}
                        // value={firebaseKeyText}
                        value={firebaseKeyText}
                        onChange={(e: any) => {
                          setFirebaseKeyText(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              firebaseKeyText: `Private Key Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              firebaseKeyText: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Agora Setting</h4>
                  <InfoTooltip title={"Agora"} content={agoracontent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        {/* Label skeleton */}
                        <div
                          className="skeleton mb-2"
                          style={{
                            height: "16px",
                            width: "30%",
                            marginLeft: "15px",
                          }}
                        ></div>

                        {/* Input skeleton */}
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            width: "97%",
                            borderRadius: "8px",
                            marginLeft: "10px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-fields-stack mt-2">
                      <ExInput
                        type={`text`}
                        id={`agoraAppId`}
                        name={`agoraAppId`}
                        label={`Agoraapp id`}
                        placeholder={`Agora AppId`}
                        errorMessage={error.agoraAppId && error.agoraAppId}
                        value={agoraAppId}
                        onChange={(e: any) => {
                          setAgoraAppId(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              agoraAppId: `AgoraappId Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              agoraAppId: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`agoraAppCertificate`}
                        name={`agoraAppCertificate`}
                        label={`Agoraapp certificate`}
                        placeholder={`Agoraapp certificate`}
                        errorMessage={error.agoraAppCertificate && error.agoraAppCertificate}
                        value={agoraAppCertificate}
                        onChange={(e: any) => {
                          setAgoraAppCertificate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              agoraAppCertificate: `AgoraApp SignIn Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              agoraAppCertificate: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Auto Call & Message Setting</h4>
                  <InfoTooltip title={"Auto Call & Message"} content={autoCallMessageContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        {/* Label skeleton */}
                        <div
                          className="skeleton mb-2"
                          style={{
                            height: "16px",
                            width: "30%",
                            marginLeft: "15px",
                          }}
                        ></div>

                        {/* Input skeleton */}
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            width: "97%",
                            borderRadius: "8px",
                            marginLeft: "10px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-box-toggle-row d-flex justify-content-between align-items-start">
                      <div className="setting-box-label mt-2">
                        Auto Call Enabled{" "}
                        <span className="setting-box-label-hint">(Enable/Disable)</span>
                      </div>
                      <div >
                        <ToggleSwitch
                          onClick={() => {
                            
                            handleSettingSwitch(setting?._id, "isAutoCallEnabled");
                          }}
                          value={isAutoCallEnabled}
                        />
                      </div>
                    </div>
                    <div className="setting-box-toggle-row d-flex justify-content-between align-items-start">
                      <div className="setting-box-label">
                        Auto Message Enabled{" "}
                        <span className="setting-box-label-hint">(Enable/Disable)</span>
                      </div>
                      <div>
                        <ToggleSwitch
                          onClick={() => {
                            
                            handleSettingSwitch(setting?._id, "isAutoMessageEnabled");
                          }}
                          value={isAutoMessageEnabled}
                        />
                      </div>
                    </div>
                    <div className="setting-fields-stack">
                      <ExInput
                        type={`text`}
                        id={`messageInitiatedAt`}
                        name={`messageInitiatedAt`}
                        label={`Message Initiat Time (In Minutes)`}
                        placeholder={`Message Initiat`}
                        errorMessage={error.messageInitiatedAt && error.messageInitiatedAt}
                        value={messageInitiatedAt}
                        onChange={(e: any) => {
                          setMessageInitiatedAt(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              messageInitiatedAt: `Message Initiat Time Is Required !`,
                            });
                          } else {
                            return setError({
                              ...error,
                              messageInitiatedAt: "",
                            });
                          }
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`callInitiatedAt`}
                        name={`callInitiatedAt`}
                        label={`Call Initiat Time (In Minutes)`}
                        placeholder={`Call Initiat`}
                        errorMessage={error.callInitiatedAt && error.callInitiatedAt}
                        value={callInitiatedAt}
                        onChange={(e: any) => {
                          setCallInitiatedAt(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              callInitiatedAt: `Call Initiat Time Is Required !`,
                            });
                          } else {
                            return setError({
                              ...error,
                              callInitiatedAt: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Support Phone Number Setting</h4>
                  <InfoTooltip title={"Support Phone Number"} content={supportPhoneNumberContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <div className="mb-4">
                    <div
                      className="skeleton mb-2"
                      style={{
                        height: "16px",
                        width: "30%",
                        marginLeft: "15px",
                      }}
                    ></div>
                    <div
                      className="skeleton"
                      style={{
                        height: "40px",
                        width: "97%",
                        borderRadius: "8px",
                        marginLeft: "10px",
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="setting-box-body">
                    <div className="col-12 mt-2">
                      <ExInput
                        type={`tel`}
                        id={`supportPhoneNumber`}
                        name={`supportPhoneNumber`}
                        label={`Support Phone Number`}
                        placeholder={`Enter support phone number`}
                        errorMessage={error.supportPhoneNumber && error.supportPhoneNumber}
                        value={supportPhoneNumber}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          setSupportPhoneNumber(value);
                          if (!value) {
                            return setError({
                              ...error,
                              supportPhoneNumber: "Support phone number is required!",
                            });
                          }

                          const phoneRegex = /^\+?\d{7,15}$/;
                          if (!phoneRegex.test(value)) {
                            return setError({
                              ...error,
                              supportPhoneNumber: "Enter a valid phone number (7-15 digits, optional +).",
                            });
                          }

                          return setError({
                            ...error,
                            supportPhoneNumber: "",
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Email setting</h4>
                  <InfoTooltip title={"Email setting"} content={emailSettingContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <div className="mb-4">
                    <div
                      className="skeleton mb-2"
                      style={{
                        height: "16px",
                        width: "30%",
                        marginLeft: "15px",
                      }}
                    ></div>
                    <div
                      className="skeleton"
                      style={{
                        height: "40px",
                        width: "97%",
                        borderRadius: "8px",
                        marginLeft: "10px",
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="setting-box-body">
                    <div className="col-12 mt-2">
                      <ExInput
                        type={`text`}
                        id={`resendApiKey`}
                        name={`resendApiKey`}
                        label={`Resend API key`}
                        placeholder={`Enter Resend API key`}
                        value={resendApiKey}
                        onChange={(e: any) => setResendApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">App Setting</h4>
                  <InfoTooltip title={"App Setting"} content={appSettingContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        {/* Label skeleton */}
                        <div
                          className="skeleton mb-2"
                          style={{
                            height: "16px",
                            width: "30%",
                            marginLeft: "15px",
                          }}
                        ></div>

                        {/* Input skeleton */}
                        <div
                          className="skeleton"
                          style={{
                            height: "40px",
                            width: "97%",
                            borderRadius: "8px",
                            marginLeft: "10px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-fields-stack mt-2">
                      <ExInput
                        type={`text`}
                        id={`androidAppVersion`}
                        name={`androidAppVersion`}
                        label={`Android App Version`}
                        placeholder={`Android App Version`}
                        errorMessage={error.androidAppVersion && error.androidAppVersion}
                        value={androidAppVersion}
                        onChange={(e: any) => {
                          setAndroidAppVersion(e.target.value);
                          // Not required: clear validation message when empty.
                          return setError({
                            ...error,
                            androidAppVersion: "",
                          });
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`iosAppVersion,`}
                        name={`iosAppVersion,`}
                        label={`IOS App Version`}
                        placeholder={`IOS App Version`}
                        errorMessage={error.iosAppVersion && error.iosAppVersion}
                        value={iosAppVersion}
                        onChange={(e: any) => {
                          setIosAppVersion(e.target.value);
                          // Not required: clear validation message when empty.
                          return setError({
                            ...error,
                            iosAppVersion: "",
                          });
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`androidAppLink,`}
                        name={`androidAppLink,`}
                        label={`Android App Link`}
                        placeholder={`Android App Link`}
                        errorMessage={error.androidAppLink && error.androidAppLink}
                        value={androidAppLink}
                        onChange={(e: any) => {
                          setAndroidAppLink(e.target.value);
                          // Not required: clear validation message when empty.
                          return setError({
                            ...error,
                            androidAppLink: "",
                          });
                        }}
                      />
                      <ExInput
                        type={`text`}
                        id={`iosAppLink,`}
                        name={`iosAppVersion,`}
                        label={`IOS App Link`}
                        placeholder={`IOS App Link`}
                        errorMessage={error.iosAppLink && error.iosAppLink}
                        value={iosAppLink}
                        onChange={(e: any) => {
                          setIosAppLink(e.target.value);
                          // Not required: clear validation message when empty.
                          return setError({
                            ...error,
                            iosAppLink: "",
                          });
                        }}
                      />
                    </div>

                  </div>
                )}
              </div>
            </div>


            {/* <div className="col-12 col-md-6 mt-3">
              <div className="settingBoxOuter">
                <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
                  <h4 className="settingboxheader">Deeplink setting</h4>
                  <InfoTooltip title={"Deeplink setting"} content={deeplinkSettingContent} />
                </div>
                <hr style={{ width: "95%", margin: "5px 9px" }} />
                {roleSkeleton ? (
                  <>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        <div
                          className="skeleton mb-2"
                          style={{
                            height: "16px",
                            width: "30%",
                            marginLeft: "15px",
                          }}
                        ></div>
                        <div
                          className="skeleton"
                          style={{
                            height: "140px",
                            width: "97%",
                            borderRadius: "8px",
                            marginLeft: "10px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="setting-box-body">
                    <div className="setting-fields-stack mt-2">
                      <Textarea
                        row={6}
                        type={`text`}
                        id={`androidAssetLinks`}
                        name={`androidAssetLinks`}
                        label={`Android Asset Links (JSON array)`}
                        placeholder={`Enter android asset links JSON array`}
                        value={androidAssetLinks}
                        errorMessage={error.androidAssetLinks && error.androidAssetLinks}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          setAndroidAssetLinks(value);
                          if (!value) {
                            return setError({
                              ...error,
                              androidAssetLinks: "",
                            });
                          }
                          try {
                            const parsed = JSON.parse(value);
                            if (!Array.isArray(parsed)) {
                              return setError({
                                ...error,
                                androidAssetLinks: "Value must be a JSON array.",
                              });
                            }
                            return setError({
                              ...error,
                              androidAssetLinks: "",
                            });
                          } catch {
                            return setError({
                              ...error,
                              androidAssetLinks: "Invalid JSON.",
                            });
                          }
                        }}
                      />
                      <Textarea
                        row={6}
                        type={`text`}
                        id={`appleAppSiteAssociation`}
                        name={`appleAppSiteAssociation`}
                        label={`Apple App Site Association (JSON object)`}
                        placeholder={`Enter apple app site association JSON object`}
                        value={appleAppSiteAssociation}
                        errorMessage={error.appleAppSiteAssociation && error.appleAppSiteAssociation}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          setAppleAppSiteAssociation(value);
                          if (!value) {
                            return setError({
                              ...error,
                              appleAppSiteAssociation: "",
                            });
                          }
                          try {
                            const parsed = JSON.parse(value);
                            if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
                              return setError({
                                ...error,
                                appleAppSiteAssociation: "Value must be a JSON object.",
                              });
                            }
                            return setError({
                              ...error,
                              appleAppSiteAssociation: "",
                            });
                          } catch {
                            return setError({
                              ...error,
                              appleAppSiteAssociation: "Invalid JSON.",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div> */}

          </div>
        </form>
      </div>
    </>
  );
};

export default AdminSetting;
