import GiftCategoryDialog from "@/component/giftCategory/GiftCategoryDialog";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { openDialog } from "@/store/dialogSlice";
import { deleteGiftCategory, getGiftCategory } from "@/store/giftSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import image from "@/assets/images/bannerImage.png";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import Image from "next/image";
import CommonDialog from "@/utils/CommonDialog";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";

interface BannerData {
  _id: string;
  image: string;
  isActive: false;
}

const GiftCategory = () => {
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { can, canSee } = usePermission();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { giftCategory, totalGiftCategory } = useSelector(
    (state: RootStore) => state.gift
  );
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [data, setData] = useState<any[]>([]);
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "gift-category",
    defaultRowsPerPage: 10,
  });

  useEffect(() => {
    const payload: any = {
      start: page,
      limit: rowsPerPage,
    };
    dispatch(getGiftCategory(payload));
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (!canSee("Gift Category")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalGiftCategory);
  };

  const bannerTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize maintext" style={{ fontWeight: "500", fontSize: "14px" }}>{row?.name || "-"}</span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formattedDate = isNaN(date.getTime())
          ? "-"
          : date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        return <span>{formattedDate}</span>;
      },
    },

    {
      Header: "Updated At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.updatedAt);
        const formattedDate = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          });
        return <span>{formattedDate}</span>;
      },
    },

    ...(can("Gift Category", "Edit") || can("Gift Category", "Delete")
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: BannerData }) => (
            <div className="d-flex justify-content-center mx-auto">
              <TableActionIcons
                size={22}
                gap={8}
                actions={[
                  can("Gift Category", "Edit")
                    ? {
                      id: "edit",
                      label: "Edit",
                      icon: IconEdit,
                      color: "#666666",
                      onClick: () => {
                        dispatch(
                          openDialog({ type: "giftCategory", data: row })
                        );
                      },
                    }
                    : undefined,
                  can("Gift Category", "Delete")
                    ? {
                      id: "delete",
                      label: "Delete",
                      icon: IconTrash,
                      color: "#EF4444",
                      onClick: () => handleDelete(row?._id),
                    }
                    : undefined,
                ].filter((action) => action !== undefined) as TableActionIconAction[]}
              />
            </div>
          ),
        },
      ]
      : []),
  ];

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteGiftCategory(selectedId));
      setShowDialog(false);
    }
  };
  const handleDelete = (id: any) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  return (
    <>
      {dialogueType === "giftCategory" && <GiftCategoryDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />
      <div className={`userTable`}>
        <div className="d-flex justify-content-between align-items-center">
          <Title name="Gift Category" />

          <div className="betBox">
            {can("Gift Category", "Create") && (
              <Button
                className={`bg-button p-10 text-white `}
                bIcon={`/images/bannerImage.png`}
                text="Gift Category"
                onClick={() => {
                  dispatch(openDialog({ type: "giftCategory" }));
                }}
              />
            )}
          </div>
        </div>
        <div className="mt-2">
          <div style={{ maxHeight: "1000px", overflowY: "auto" }}>
            <Table
              style={{ width: "100%" }}
              data={giftCategory}
              mapData={bannerTable}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={<ImpressionShimmer />}
            />
          </div>

          <div style={{padding: "25px 0px"}}>
            <Pagination
              type={"server"}
              serverPage={page}
              setServerPage={setPage}
              serverPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalData={totalGiftCategory}
            />
          </div>
        </div>
      </div>
    </>
  );
};
GiftCategory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default GiftCategory;
