import { FakeHost } from "@/component/host/FakeHost";
import { RealHost } from "@/component/host/RealHost";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Title from "@/extra/Title";
import { routerChange } from "@/utils/Common";
import { hostTypes, userTypes } from "@/utils/extra";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import image from "@/assets/images/bannerImage.png";
import { getMessage } from "@/store/hostSlice";
import { openDialog, openMessageDialog } from "@/store/dialogSlice";
import MessageDialog from "@/component/host/MessageDialog";
import HostDialog from "@/component/host/HostDialog";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { usePermission } from "@/context/PermissionContext";

const Host = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();
  const { canSee, can } = usePermission();

  useEffect(() => {
    const storedType = localStorage.getItem("hostTypeData") || "real_host";
    if (storedType) setType(storedType);
  }, []);

  useEffect(() => {
    if (!canSee("Host")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  useEffect(() => {
    if (type) {
      localStorage.setItem("hostTypeData", type);
    }
  }, [type]);

  useEffect(() => {
    routerChange("/Host", "hostTypeData", router);
  }, []);

  return (
    <>
      <Title name="Host" />
      <div className="d-flex flex-column flex-md-row justify-content-between">
        <div className="my-2 host_width mt-2">
          {hostTypes.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`${type === item.value ? "activeBtn" : "disabledBtn"} ${index !== 0 ? "ms-1" : ""
                }`}
              onClick={() => {
                const nextType = item.value;
                // If user explicitly clicks the Fake Host tab, reset pagination to defaults.
                // When user navigates to "Info" and comes back, we don't set this flag,
                // so the previously selected page can be restored.
                if (typeof window !== "undefined" && nextType === "fake_host") {
                  sessionStorage.setItem(
                    "admin:resetPaginationByFakeHostTab",
                    "1"
                  );
                }
                setType(nextType);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {
          type === "fake_host" && (
            <div className="d-flex gap-2">
              {can("Host", "Create") && (
                <>
                  <div className="betBox">
                    <Button
                      className={`bg-main p-10 text-white m10-bottom `}
                      bIcon={`/images/bannerImage.png`}
                      text="Add Male Message"
                      onClick={async () => {
                        const data = await dispatch(getMessage({ gender: 1 }));
                        dispatch(
                          openMessageDialog({
                            type: "messageHost",
                            gender: "male",
                            data: data?.payload?.data?.message.toString(),
                          })
                        );
                      }}
                    />
                    {dialogueType === "messageHost" && <MessageDialog />}
                  </div>
                  <div className="betBox">
                    <Button
                      className={`b p-10 text-white m10-bottom `}
                      style={{ backgroundColor: "#EC4899" }}
                      bIcon={`/images/bannerImage.png`}
                      text="Add Female Message"
                      onClick={async () => {
                        const data = await dispatch(getMessage({ gender: 2 }));
                        dispatch(
                          openMessageDialog({
                            type: "messageHost",
                            gender: "female",
                            data: data?.payload?.data?.message.toString(),
                          })
                        );
                      }}
                    />
                    {dialogueType === "messageHost" && <MessageDialog />}
                  </div>
                  <div className="betBox">
                    <Button
                      className={`bg-button p-10 text-white m10-bottom `}
                      bIcon={`/images/bannerImage.png`}
                      text="Add Fake Host"
                      onClick={() => {
                        dispatch(openDialog({ type: "fakeHost" }));
                      }}
                    />
                  </div>
                </>
              )}
              {dialogueType === "fakeHost" && <HostDialog />}
            </div>
          )
        }
      </div>

      {type === "real_host" && <RealHost type={type} />}

      {type === "fake_host" && <FakeHost type={type} />}
    </>
  );
};

Host.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Host;
