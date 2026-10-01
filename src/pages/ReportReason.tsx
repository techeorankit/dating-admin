import { basePath } from "@/utils/config";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { openDialog } from "@/store/dialogSlice";
import {
  deleteReportReason,
  getReportReasons,
} from "@/store/reportReasonSlice";
import { RootStore } from "@/store/store";

import { usePermission } from "@/context/PermissionContext";
import CommonDialog from "@/utils/CommonDialog";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import ReportReasonDialog from "@/component/reportReason/ReportReasonDialog";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import ReportReasonShimmer from "@/component/Shimmer/ReportReasonShimmer";

const ReportReason = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  
  const { can, canSee } = usePermission();
  const { items, total } = useSelector(
    (state: RootStore) => state.reportReason
  );

  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "report-reason",
    defaultRowsPerPage: 10,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!canSee("Report Reason")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  useEffect(() => {
    dispatch(getReportReasons() as any);
  }, [dispatch]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), items.length);
  };

  const handleDelete = (id: string) => {
    
    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      dispatch(deleteReportReason(selectedId) as any);
      setShowDialog(false);
    }
  };

  const showActions =
    can("Report Reason", "Edit") || can("Report Reason", "Delete");

  const reportReasonTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Title",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize maintext">{row?.title || "-"}</span>
      ),
    },
    ...(showActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => {
            const actions: Array<TableActionIconAction | undefined> = [
              can("Report Reason", "Edit")
                ? {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  color: "#666666",
                  onClick: () => {
                    
                    dispatch(
                      openDialog({
                        type: "reportReason",
                        data: row,
                      }) as any
                    );
                  },
                }
                : undefined,
              can("Report Reason", "Delete")
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
              <div className="action-button">
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
      {dialogueType === "reportReason" && <ReportReasonDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="row d-flex align-items-center" style={{ marginBottom: 0 }}>
        <div className="col-12 col-lg-6 col-md-6 col-sm-12 fs-20 fw-600">
          <Title name="Report Reasons" />
        </div>
        <div className="col-lg-6 col-sm-12 new-fake-btn d-flex justify-content-end align-items-center">
          <div className="dashboardHeader primeHeader mb-3 p-0"></div>
          <div className="betBox">
            {can("Report Reason", "Create") && (
              <Button
                className="bg-button p-10 text-white m10-bottom text-nowrap"
                bIcon={`${basePath}/images/bannerImage.png`}
                text="Add Report Reason"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "reportReason" }) as any);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Table
          data={items}
          mapData={reportReasonTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"client"}
          shimmer={<ReportReasonShimmer />}
        />
        <div style={{ padding: "25px 0px" }}>
        <Pagination
          type={"client"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={items.length}
        />
        </div>
      </div>
    </>
  );
};

ReportReason.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default ReportReason;

