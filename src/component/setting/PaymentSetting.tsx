import InfoTooltip from "@/extra/InfoTooltip";
import { razorpayContent, flutterWaveContent, stripeContent, googlePlayContent, paystackContent, cashfreeContent, paypalContent, nowPaymentContent } from "@/extra/infoContent";
import { ExInput } from "@/extra/Input";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { getSetting, handleSetting, updateSetting } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { isSkeleton } from "@/utils/allSelector";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PaymentRestrictionsDialog from "./PaymentRestrictionsDialog";

interface ErrorState {
  razorPaySecretKeyText: string;
  razorPayIdText: string;
  stripeSecretKeyText: string;
  stripePublishableKeyText: string;
  flutterWaveKeyText: string;
  paystackSecretKeyText: string;
  paystackPublishableKeyText: string;
  cashfreeSecretKeyText: string;
  cashfreeIdText: string;

  paypalSecretKeyText: string;
  paypalIdText: string;
  nowPaymentApiKeyText: string;
  nowPaymentSandboxKeyText: string;
  nowPaymentPayCurrencyText: string;
}

const PaymetSetting = () => {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const roleSkeleton = useSelector(isSkeleton);

  const [razorPaySecretKeyText, setrazorPaySecretKeyText] = useState<any>("");
  const [razorPayIdText, setRazorPayIdText] = useState<any>("");
  const [paypalIdText, setPaypalIdText] = useState<any>("");
  const [cashfreeIdText, setCashfreeIdText] = useState<any>("");
  const [stripeSecretKeyText, setStripeSecretKeyText] = useState<any>("");
  const [stripePublishableKeyText, setstripePublishableKeyText] = useState<any>("");
  const [flutterWaveKeyText, setFlutterWaveKeyText] = useState<any>("");
  const [paystackSecretKeyText, setPaystackSecretKeyText] = useState<any>("");
  const [paystackPublishableKeyText, setPaystackPublishableKeyText] = useState<any>("");
  const [cashfreeSecretKeyText, setCashfreeSecretKeyText] = useState<any>("");
  const [cashfreeClientSecretKeyText, setCashfreeClientSecretKeyText] = useState<any>("");
  const [paypalSecretKeyText, setPaypalSecretKeyText] = useState<any>("");
  const [nowPaymentApiKeyText, setNowPaymentApiKeyText] = useState<any>("");
  const [nowPaymentSandboxKeyText, setNowPaymentSandboxKeyText] = useState<any>("");
  const [nowPaymentPayCurrencyText, setNowPaymentPayCurrencyText] = useState<any>("");

  const [data, setData] = useState<any>();
  const [settingId, setSettingId] = useState<any>();

  const [isRazorPay, setIsRazorPay] = useState<boolean>(false);
  const [isFlutterWave, setIsFlutterWave] = useState<boolean>(false);
  const [isflutterWaveEnabled, setIsFlutterWaveEnabled] = useState<boolean>(false);
  const [googlePlayEnabled, setGooglePlayEnabled] = useState<boolean>(false);
  const [isStripePay, setIsStripe] = useState<boolean>(false);
  const [isPaystackAndroid, setIsPaystackAndroid] = useState<boolean>(false);
  const [isPaystackIos, setIsPaystackIos] = useState<boolean>(false);
  const [isCashfreeAndroid, setIsCashfreeAndroid] = useState<boolean>(false);
  const [isCashfreeIos, setIsCashfreeIos] = useState<boolean>(false);
  const [isPaypalAndroid, setIsPaypalAndroid] = useState<boolean>(false);
  const [isPaypalIos, setIsPaypalIos] = useState<boolean>(false);
  const [isRazorpayIos, setIsRazorpayIos] = useState<boolean>(false);
  const [isStripeIos, setIsStripeIos] = useState<boolean>(false);
  const [isGooglePayIos, setIsGooglePayIos] = useState<boolean>(false);
  const [isNowPaymentAndroid, setIsNowPaymentAndroid] = useState<boolean>(false);
  const [isNowPaymentIos, setIsNowPaymentIos] = useState<boolean>(false);
  const [isNowPaymentTest, setIsNowPaymentTest] = useState<boolean>(false);

  const [error, setError] = useState<any>({});
  const [initialData, setInitialData] = useState<any>({});

  const [isCheckedOnce, setIsCheckedOnce] = useState(false);
  const [isPaymentAllowed, setIsPaymentAllowed] = useState<boolean | null>(null);
  const [paymentRestrictionOpen, setPaymentRestrictionOpen] = useState(false);
  const paymentAuthInFlight = useRef(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    if (setting && setting._id) {
      setSettingId(setting._id);
      setrazorPaySecretKeyText(setting?.razorpaySecretKey);
      setRazorPayIdText(setting?.razorpayId);
      setStripeSecretKeyText(setting?.stripeSecretKey);
      setstripePublishableKeyText(setting?.stripePublishableKey);
      setFlutterWaveKeyText(setting?.flutterwaveId);
      setIsRazorPay(setting?.razorpayEnabled);
      setIsFlutterWave(setting?.flutterwaveEnabled);
      setIsStripe(setting?.stripeEnabled);
      setGooglePlayEnabled(setting?.googlePlayEnabled);
      setPaystackSecretKeyText(setting?.paystackSecretKey);
      setPaystackPublishableKeyText(setting?.paystackPublicKey);
      setIsPaystackAndroid(setting?.paystackAndroidEnabled);
      setIsPaystackIos(setting?.paystackIosEnabled);
      setCashfreeSecretKeyText(setting?.cashfreeSecretKey);
      setCashfreeIdText(setting?.cashfreeClientId);
      setIsCashfreeAndroid(setting?.cashfreeAndroidEnabled);
      setIsCashfreeIos(setting?.cashfreeIosEnabled);
      setPaypalSecretKeyText(setting?.paypalSecretKey);
      setPaypalIdText(setting?.paypalClientId);
      setIsPaypalAndroid(setting?.paypalAndroidEnabled);
      setIsPaypalIos(setting?.paypalIosEnabled);
      setCashfreeClientSecretKeyText(setting?.cashfreeClientSecret);
      setIsFlutterWaveEnabled(setting?.flutterwaveIosEnabled);
      setIsRazorpayIos(setting?.razorpayIosEnabled);
      setIsStripeIos(setting?.stripeIosEnabled);
      setIsGooglePayIos(setting?.googlePayIosEnabled);
      setNowPaymentApiKeyText(setting?.apiKey);
      setNowPaymentSandboxKeyText(setting?.sandboxKey);
      setNowPaymentPayCurrencyText(setting?.payCurrency);
      setIsNowPaymentAndroid(setting?.nowPaymentAndroidEnabled);
      setIsNowPaymentIos(setting?.nowPaymentIosEnabled);
      setIsNowPaymentTest(setting?.isTest);

      setInitialData({
        razorpaySecretKey: setting?.razorpaySecretKey,
        razorpayId: setting?.razorpayId,
        stripeSecretKey: setting?.stripeSecretKey,
        stripePublishableKey: setting?.stripePublishableKey,
        flutterwaveId: setting?.flutterwaveId,
        paystackSecretKey: setting?.paystackSecretKey,
        paystackPublicKey: setting?.paystackPublicKey,
        paypalSecretKey: setting?.paypalSecretKey,
        paypalClientId: setting?.paypalClientId,
        cashfreeClientId: setting?.cashfreeClientId,
        cashfreeClientSecret: setting?.cashfreeClientSecret,
        apiKey: setting?.apiKey,
        sandboxKey: setting?.sandboxKey,
        payCurrency: setting?.payCurrency,
      });
    }
  }, [setting]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const settingDataSubmit: any = {};

    if (razorPaySecretKeyText !== initialData.razorpaySecretKey) {
      settingDataSubmit.razorpaySecretKey = razorPaySecretKeyText;
    }
    if (razorPayIdText !== initialData.razorpayId) {
      settingDataSubmit.razorpayId = razorPayIdText;
    }
    if (stripeSecretKeyText !== initialData.stripeSecretKey) {
      settingDataSubmit.stripeSecretKey = stripeSecretKeyText;
    }
    if (stripePublishableKeyText !== initialData.stripePublishableKey) {
      settingDataSubmit.stripePublishableKey = stripePublishableKeyText;
    }
    if (flutterWaveKeyText !== initialData.flutterwaveId) {
      settingDataSubmit.flutterwaveId = flutterWaveKeyText;
    }
    if (paystackSecretKeyText !== initialData.paystackSecretKey) {
      settingDataSubmit.paystackSecretKey = paystackSecretKeyText;
    }
    if (paystackPublishableKeyText !== initialData.paystackPublicKey) {
      settingDataSubmit.paystackPublicKey = paystackPublishableKeyText;
    }
    if (paypalSecretKeyText !== initialData.paypalSecretKey) {
      settingDataSubmit.paypalSecretKey = paypalSecretKeyText;
    }
    if (paypalIdText !== initialData.paypalClientId) {
      settingDataSubmit.paypalClientId = paypalIdText;
    }
    if (cashfreeIdText !== initialData.cashfreeClientId) {
      settingDataSubmit.cashfreeClientId = cashfreeIdText;
    }
    if (cashfreeClientSecretKeyText !== initialData.cashfreeClientSecret) {
      settingDataSubmit.cashfreeClientSecret = cashfreeClientSecretKeyText;
    }
    if (nowPaymentApiKeyText !== initialData.apiKey) {
      settingDataSubmit.apiKey = nowPaymentApiKeyText;
    }
    if (nowPaymentSandboxKeyText !== initialData.sandboxKey) {
      settingDataSubmit.sandboxKey = nowPaymentSandboxKeyText;
    }
    if (nowPaymentPayCurrencyText !== initialData.payCurrency) {
      settingDataSubmit.payCurrency = nowPaymentPayCurrencyText;
    }

    const payload = {
      settingDataSubmit,
      settingId: data?._id,
    };
    dispatch(updateSetting(payload));
  };

  const handleSettingSwitch = (type: string) => {
    const payload = { settingId: settingId, type };
    dispatch(handleSetting(payload));
  };

  const handlePaymentToggle = async (type: string) => {
    try {
      handleSettingSwitch(type);
    } catch {
      // optional error handling
    } finally {
      paymentAuthInFlight.current = false;
    }
  };

  return (
    <div className="mainSetting">
      <form onSubmit={handleSubmit} id="settings-tab-form">
        <div className="settingBox row">
          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader">Razor Pay Setting</h4>
                <InfoTooltip title={"Razor Pay"} content={razorpayContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <>
                  {[{ type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
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
                          height: item.type === "toggle" ? "24px" : "40px",
                          width: item.type === "toggle" ? "50px" : "97%",
                          borderRadius: item.type === "toggle" ? "12px" : "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="setting-box-body">
                    <div className="col-12 mt-2">
                      <ExInput
                        type={`text`}
                        id={`razorSecretKey`}
                        name={`razorSecretKey`}
                        label={`Razorpay secret key`}
                        placeholder={`Razorpay Secret Key`}
                        errorMessage={error.razorPaySecretKeyText && error.razorPaySecretKeyText}
                        value={razorPaySecretKeyText}
                        onChange={(e: any) => {
                          setrazorPaySecretKeyText(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              razorPaySecretKeyText: `RazorPay Secret Key Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              razorPaySecretKeyText: "",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="col-12 ">
                      <ExInput
                        type={`text`}
                        id={`razorPayId`}
                        name={`razorPayId`}
                        label={` Razorpay id`}
                        placeholder={` RazorPay Id`}
                        errorMessage={error.razorPayIdText && error.razorPayIdText}
                        value={razorPayIdText}
                        onChange={(e: any) => {
                          setRazorPayIdText(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              razorPayIdText: `RazorPay is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              razorPayIdText: "",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="payment-toggle-stack">
                      <div className="payment-toggle-row">
                        <div className="payment-toggle-label">
                          Razorpay active <span className="payment-toggle-hint">(Enable/Disable)</span>
                        </div>
                        <ToggleSwitch style={{ fontSize: "12px" }} onClick={() => handlePaymentToggle("razorpayEnabled")} value={isRazorPay} />
                      </div>
                      <div className="payment-toggle-row">
                        <div className="payment-toggle-label">
                          Razorpay ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                        </div>
                        <ToggleSwitch onClick={() => handlePaymentToggle("razorpayIosEnabled")} value={isRazorpayIos} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader ">Stripe Pay Setting</h4>
                <InfoTooltip title={"Stripe Pay"} content={stripeContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <>
                  {[{ type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
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
                          height: item.type === "toggle" ? "24px" : "40px",
                          width: item.type === "toggle" ? "50px" : "97%",
                          borderRadius: item.type === "toggle" ? "12px" : "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`stripeSecretKey`}
                      name={`stripeSecretKey`}
                      label={`Stripe secret key`}
                      placeholder={`Stripe Secret Key`}
                      errorMessage={error.stripeSecretKeyText && error.stripeSecretKeyText}
                      value={stripeSecretKeyText}
                      onChange={(e: any) => {
                        setStripeSecretKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            stripeSecretKeyText: `StripePay SecretKey is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            stripeSecretKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`stripePublishableKey`}
                      name={`stripePublishableKey`}
                      label={` Stripe publishable key`}
                      placeholder={` Stripe Publishable Key`}
                      errorMessage={error.stripePublishableKeyText && error.stripePublishableKeyText}
                      value={stripePublishableKeyText}
                      onChange={(e: any) => {
                        setstripePublishableKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            stripePublishableKeyText: `Stripe Pay Publishable Key is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            stripePublishableKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Stripepay active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("stripeEnabled")} value={isStripePay} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Stripe Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("stripeIosEnabled")} value={isStripeIos} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader "> Paystack Setting</h4>
                <InfoTooltip title={"Paystack Pay"} content={paystackContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <>
                  {[{ type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
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
                          height: item.type === "toggle" ? "24px" : "40px",
                          width: item.type === "toggle" ? "50px" : "97%",
                          borderRadius: item.type === "toggle" ? "12px" : "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`paystackSecretKey`}
                      name={`paystackSecretKey`}
                      label={`Paystack secret key`}
                      placeholder={`Stripe Secret Key`}
                      errorMessage={error.paystackSecretKeyText && error.paystackSecretKeyText}
                      value={paystackSecretKeyText}
                      onChange={(e: any) => {
                        setPaystackSecretKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            paystackSecretKeyText: `StripePay SecretKey is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            paystackSecretKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`paystackPublishableKey`}
                      name={`paystackPublishableKey`}
                      label={` Paystack publishable key`}
                      placeholder={` Paystack Publishable Key`}
                      errorMessage={error.paystackPublishableKeyText && error.paystackPublishableKeyText}
                      value={paystackPublishableKeyText}
                      onChange={(e: any) => {
                        setPaystackPublishableKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            paystackPublishableKeyText: `Paystack Publishable Key is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            paystackPublishableKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  {/* toggle button  */}

                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Paystack Android active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("paystackAndroidEnabled")} value={isPaystackAndroid} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Paystack Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("paystackIosEnabled")} value={isPaystackIos} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader "> Cashfree Setting</h4>
                <InfoTooltip title={"Cashfree Pay"} content={cashfreeContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <div className="setting-box-body">
                  <div className="mb-3">
                    <div className="skeleton mb-2" style={{ height: 14, width: "40%" }} />
                    <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 8 }} />
                  </div>
                  <div className="mb-3">
                    <div className="skeleton mb-2" style={{ height: 14, width: "40%" }} />
                    <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 8 }} />
                  </div>
                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`cashfreeclientSecret`}
                      name={`cashfreeclientSecret`}
                      label={`Cashfree Client secret key`}
                      placeholder={`Cashfree Client secret key`}
                      errorMessage={error.cashfreeClientSecretKeyText && error.cashfreeClientSecretKeyText}
                      value={cashfreeClientSecretKeyText}
                      onChange={(e: any) => {
                        setCashfreeClientSecretKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            cashfreeClientSecretKeyText: `Cashfree SecretKey is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            cashfreeClientSecretKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`CashfreeId`}
                      name={`CashfreeId`}
                      label={`Cashfree Client Id`}
                      placeholder={` Cashfree ClientIdId`}
                      errorMessage={error.cashfreeIdText && error.cashfreeIdText}
                      value={cashfreeIdText}
                      onChange={(e: any) => {
                        setCashfreeIdText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            cashfreeIdText: `Paypal is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            cashfreeIdText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Cashfree Android active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("cashfreeAndroidEnabled")} value={isCashfreeAndroid} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Cashfree Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("cashfreeIosEnabled")} value={isCashfreeIos} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader "> Paypal Setting</h4>
                <InfoTooltip title={"Paypal Pay"} content={paypalContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <>
                  {[{ type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
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
                          height: item.type === "toggle" ? "24px" : "40px",
                          width: item.type === "toggle" ? "50px" : "97%",
                          borderRadius: item.type === "toggle" ? "12px" : "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`paypalSecretKey`}
                      name={`paypalSecretKey`}
                      label={`Paypal secret key`}
                      placeholder={`Paypal Secret Key`}
                      errorMessage={error.paypalSecretKeyText && error.paypalSecretKeyText}
                      value={paypalSecretKeyText}
                      onChange={(e: any) => {
                        setPaypalSecretKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            paypalSecretKeyText: `Paypal SecretKey is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            paypalSecretKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`paypalId`}
                      name={`paypalId`}
                      label={` Paypal id`}
                      placeholder={` Paypal Id`}
                      errorMessage={error.paypalIdText && error.paypalIdText}
                      value={paypalIdText}
                      onChange={(e: any) => {
                        setPaypalIdText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            paypalIdText: `Paypal is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            paypalIdText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  {/* toggle button  */}

                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Paypal Android active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("paypalAndroidEnabled")} value={isPaypalAndroid} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Paypal Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("paypalIosEnabled")} value={isPaypalIos} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader">Flutter Wave Setting</h4>
                <InfoTooltip title={"Flutter Wave"} content={flutterWaveContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>

              {roleSkeleton ? (
                <div className="setting-box-body">
                  <div className="mb-3">
                    <div className="skeleton mb-2" style={{ height: 14, width: "35%" }} />
                    <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 8 }} />
                  </div>
                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`flutterWaveId`}
                      name={`flutterWaveId`}
                      label={`Flutterwave Id`}
                      placeholder={`FlutterWave Id`}
                      errorMessage={error.flutterWaveKeyText && error.flutterWaveKeyText}
                      value={flutterWaveKeyText}
                      onChange={(e: any) => {
                        setFlutterWaveKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            flutterWaveKeyText: `FlutterWave Id is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            flutterWaveKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Flutterwave active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("flutterwaveEnabled")} value={isFlutterWave} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        FlutterWave Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("flutterwaveIosEnabled")} value={isflutterWaveEnabled} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-12 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader">Google Play Setting</h4>
                <InfoTooltip title={"Google Play"} content={googlePlayContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }} />
              {roleSkeleton === true ? (
                <div className="setting-box-body">
                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="skeleton" style={{ height: 16, width: "55%" }} />
                      <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 12 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="setting-box-body">
                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Google Play <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("googlePlayEnabled")} value={googlePlayEnabled} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Google Play Ios Active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("googlePayIosEnabled")} value={isGooglePayIos} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2 ">
                <h4 className="settingboxheader">NOW Payment Setting</h4>
                <InfoTooltip title={"NOW Payment"} content={nowPaymentContent} />
              </div>
              <hr style={{ width: "95%", margin: "5px 9px" }}></hr>
              {roleSkeleton ? (
                <>
                  {[{ type: "input" }, { type: "input" }, { type: "input" }, { type: "toggle" }].map((item, index) => (
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
                          height: item.type === "toggle" ? "24px" : "40px",
                          width: item.type === "toggle" ? "50px" : "97%",
                          borderRadius: item.type === "toggle" ? "12px" : "8px",
                          marginLeft: "10px",
                        }}
                      ></div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="setting-box-body">
                  <div className="col-12 mt-2">
                    <ExInput
                      type={`text`}
                      id={`nowPaymentApiKey`}
                      name={`nowPaymentApiKey`}
                      label={`API Key`}
                      placeholder={`API KEY`}
                      errorMessage={error.nowPaymentApiKeyText && error.nowPaymentApiKeyText}
                      value={nowPaymentApiKeyText}
                      onChange={(e: any) => {
                        setNowPaymentApiKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            nowPaymentApiKeyText: `API Key is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            nowPaymentApiKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`nowPaymentSandboxKey`}
                      name={`nowPaymentSandboxKey`}
                      label={`Sandbox Key`}
                      placeholder={`SANDBOX KEY`}
                      errorMessage={error.nowPaymentSandboxKeyText && error.nowPaymentSandboxKeyText}
                      value={nowPaymentSandboxKeyText}
                      onChange={(e: any) => {
                        setNowPaymentSandboxKeyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            nowPaymentSandboxKeyText: `Sandbox Key is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            nowPaymentSandboxKeyText: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`nowPaymentPayCurrency`}
                      name={`nowPaymentPayCurrency`}
                      label={`Pay Currency`}
                      placeholder={`Pay Currency`}
                      errorMessage={error.nowPaymentPayCurrencyText && error.nowPaymentPayCurrencyText}
                      value={nowPaymentPayCurrencyText}
                      onChange={(e: any) => {
                        setNowPaymentPayCurrencyText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            nowPaymentPayCurrencyText: `Pay Currency is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            nowPaymentPayCurrencyText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="payment-toggle-stack">
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        NOW Payment Android active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("nowPaymentAndroidEnabled")} value={isNowPaymentAndroid} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        NOW Payment Ios active <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("nowPaymentIosEnabled")} value={isNowPaymentIos} />
                    </div>
                    <div className="payment-toggle-row">
                      <div className="payment-toggle-label">
                        Test Mode <span className="payment-toggle-hint">(Enable/Disable)</span>
                      </div>
                      <ToggleSwitch onClick={() => handlePaymentToggle("isTest")} value={isNowPaymentTest} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      <PaymentRestrictionsDialog open={paymentRestrictionOpen} onClose={() => setPaymentRestrictionOpen(false)} />
    </div>
  );
};

export default PaymetSetting;
