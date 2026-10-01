"use-client";
import RootLayout from "../component/layout/Layout";
import React, { useEffect } from "react";
import { RootStore, useAppSelector } from "../store/store";
import GiftShow from "@/component/gift/GiftShow";
import AddSvgaDialogue from "@/component/gift/AddSvgaDialogue";
import CreateGift from "@/component/gift/CreateGift";
import Title from "@/extra/Title";
import { usePermission } from "@/context/PermissionContext";
import { useRouter } from "next/router";

const GiftPage = () => {
  const { dialogueType } = useAppSelector(
    (state: RootStore) => state.dialogue
  );
  const { canSee } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!canSee("Gift")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  return (
    <>
      <div className="userPage">
        <Title name="Gift" />
        <div
          style={{
            display: `${dialogueType === "hostSettleMent"
                ? "none"
                : dialogueType === "hostHistory"
                  ? "none"
                  : dialogueType === "fakeUserAdd"
                    ? "none"
                    : dialogueType === "fakeUser"
                      ? "none"
                      : dialogueType === "hostReport"
                        ? "none"
                        : "block"
              }`,
          }}
        >
          <GiftShow />
          {dialogueType === "svgaGift" && <AddSvgaDialogue />}
          {dialogueType === "imageGift" && <CreateGift />}
        </div>
      </div>
    </>
  );
};

GiftPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default GiftPage;
