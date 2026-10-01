import image from "@/assets/images/bannerImage.png";
import ImpressionDialog from "@/component/impression/ImpressionDialog";
import RootLayout from "@/component/layout/Layout";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { openDialog } from "@/store/dialogSlice";
import { deleteImpression, getImpression } from "@/store/impressionSlice";
import { RootStore } from "@/store/store";

import { useRouter } from "next/router";
import { usePermission } from "@/context/PermissionContext";
import CommonDialog from "@/utils/CommonDialog";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const Impression = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const { can, canSee } = usePermission();

  const { impression, total } = useSelector(
    (state: RootStore) => state.impression
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "impression:list",
    defaultRowsPerPage: 10,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
    };
    dispatch(getImpression(payload));
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    if (!canSee("Host Tags")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), total);
  };

  const handleDelete = (id: any) => {
    
    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteImpression(selectedId));
      setShowDialog(false);
    }
  };

  const showImpressionActions =
    can("Host Tags", "Edit") || can("Host Tags", "Delete");

  const impressionTable = [
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
        const formattedDateTime = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        return <span className="text-nowrap text-normal">{formattedDateTime}</span>;
      },
    },

    {
      Header: "Updated At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.updatedAt);
        const formattedDate = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        return <span className="text-nowrap text-normal">{formattedDate}</span>;
      },
    },

    ...(showImpressionActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => {
            const actions: Array<TableActionIconAction | undefined> = [
              can("Host Tags", "Edit")
                ? {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  color: "#666666",
                  onClick: () => {
                    dispatch(openDialog({ type: "impression", data: row }));
                  },
                }
                : undefined,
              can("Host Tags", "Delete")
                ? {
                  id: "delete",
                  label: "Delete",
                  icon: IconTrash,
                  color: "#EF4444",
                  onClick: () => handleDelete(row?._id),
                }
                : undefined,
            ];

            const filteredActions = actions.filter(
              (action): action is TableActionIconAction =>
                action !== undefined
            );

            return (
              <div className="d-flex justify-content-center">
                <TableActionIcons
                  size={22}
                  gap={8}
                  actions={filteredActions}
                />
              </div>
            );
          },
        },
      ]
      : []),
  ];

  return (
    <>
      {dialogueType === "impression" && <ImpressionDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="row">
        <div className="col-12 col-lg-6 col-md-6 col-sm-12 giftcategoryclass fw-600">
          <Title name="Host Tags" />
        </div>
        <div className="col-lg-6 col-sm-12 new-fake-btn d-flex justify-content-end align-items-center">
          <div className="dashboardHeader primeHeader mb-3 p-0"></div>

          <div className="betBox">
            {can("Host Tags", "Create") && (
              <Button
                className={`bg-button p-10 text-white m10-bottom text-nowrap`}
                bIcon={`/images/bannerImage.png`}
                text="Add Host Tags"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "impression" }));
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div>
        <Table
          data={impression}
          mapData={impressionTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
          shimmer={<ImpressionShimmer />}
        />
        <div style={{padding: "25px 0px"}}>
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={total}
          />
        </div>
      </div>
    </>
  );
};

Impression.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default Impression;
