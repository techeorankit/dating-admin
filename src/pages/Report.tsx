import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import TableActionIcons from "@/component/common/TableActionIcons";
import CommonDialog from "@/utils/CommonDialog";
import { RootStore, useAppDispatch } from "@/store/store";
import { usePermission } from "@/context/PermissionContext";

import { IconTrash , IconCircleCheck } from "@tabler/icons-react";
import {
  deleteUserHostReport,
  getUserHostReports,
  solveUserHostReport,
  UserHostReport,
} from "@/store/reportSlice";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import { getImageUrl } from "@/utils/getImageUrl";
import { baseURL } from "@/utils/config";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import Title from "@/extra/Title";
import ReportShimmer from "@/component/Shimmer/ReportShimmer";

const Report = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { can, canSee } = usePermission();

  const { items, total } = useSelector((state: RootStore) => state.report);
  

  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "report:user-host",
    defaultRowsPerPage: 10,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<UserHostReport | null>(
    null
  );
  const [expandedReason, setExpandedReason] = useState<{
    [id: string]: boolean;
  }>({});

  const toggleReason = (id: string) => {
    setExpandedReason((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    if (!canSee("Report")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  useEffect(() => {
    const payload = {
      search,
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      status: statusFilter,
    };
    dispatch(getUserHostReports(payload) as any);
  }, [dispatch, search, page, rowsPerPage, startDate, endDate, statusFilter]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), total);
  };

  const handleOpenDelete = (report: UserHostReport) => {
    
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedReport) {
      dispatch(deleteUserHostReport(selectedReport._id) as any);
      setShowDeleteDialog(false);
    }
  };

  const handleSolve = (report: UserHostReport) => {
    
    if (report.status === 2) return;

    dispatch(
      solveUserHostReport({
        reportId: report._id,
        targetId: report.targetId,
        reporterId: report.reporterId,
      }) as any
    );
  };

  // No client-side pagination anymore

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Pending";
      case 2:
        return "Solved";
      default:
        return "-";
    }
  };

  const showActions = can("Report", "Edit") || can("Report", "Delete");

  const reportTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Reporter",
      Cell: ({ row }: { row: UserHostReport }) => {
        const rawImagePath = row?.reporterImage || "";
        const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

        const imageUrl = normalizedImagePath.includes("storage")
          ? baseURL + normalizedImagePath
          : normalizedImagePath;

        return (
          <div className="d-flex px-2 py-1" style={{ width: "250px" }}>
            <div>
              <img
                src={getImageUrl(imageUrl) || `/images/male.png`}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
                referrerPolicy="no-referrer"
                alt="Reporter"
                loading="eager"
                draggable="false"
                style={{
                  borderRadius: "50px",
                  objectFit: "cover",
                  height: "50px",
                  width: "50px",
                }}
                height={70}
                width={70}
              />
            </div>
            <div
              style={{ width: "100px" }}
              className="d-flex flex-column justify-content-center text-start ms-3 text-nowrap"
            >
              <p className="mb-0 text-sm text-capitalize text-normal maintext" style={{ fontWeight: "500", fontSize: "14px" }}>
                {row?.reporterName || "-"}
              </p>
              <p
                className="text-capitalize  mb-0" style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}

              >
                {row?.reporterUniqueId || "-"}
              </p>
              <p
                className="text-capitalize fw-normal mb-0"
                style={{ fontSize: "12px", color: "#888" }}
              >
                {row?.reporterRole || "-"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Target",
      Cell: ({ row }: { row: UserHostReport }) => {
        const rawImagePath = row?.targetImage || "";
        const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

        const imageUrl = normalizedImagePath.includes("storage")
          ? baseURL + normalizedImagePath
          : normalizedImagePath;

        return (
          <div className="d-flex px-2 py-1" style={{ width: "250px" }}>
            <div>
              <img
                src={getImageUrl(imageUrl) || `/images/male.png`}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
                referrerPolicy="no-referrer"
                alt="Target"
                loading="eager"
                draggable="false"
                style={{
                  borderRadius: "50px",
                  objectFit: "cover",
                  height: "50px",
                  width: "50px",
                }}
                height={70}
                width={70}
              />
            </div>
            <div
              style={{ width: "100px" }}
              className="d-flex flex-column justify-content-center text-start ms-3 text-nowrap"
            >
              <p className="mb-0 text-sm text-capitalize text-normal maintext" style={{ fontWeight: "500", fontSize: "14px" }}>
                {row?.targetName || "-"}
              </p>
              <p
                className="text-capitalize  mb-0" style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}

              >
                {row?.targetUniqueId || "-"}
              </p>
              <p
                className="text-capitalize fw-normal mb-0"
                style={{ fontSize: "12px", color: "#888" }}
              >
                {row?.targetRole || "-"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Reason",
      Cell: ({ row }: { row: UserHostReport }) => {
        const id = row?._id || "";
        const reasonText = String(row?.reason || "-");
        const isExpanded = id ? expandedReason[id] : false;
        const previewText = reasonText.substring(0, 60);

        return (
          <span className="text-capitalize fw-normal">
            {isExpanded ? reasonText : previewText}
            {reasonText.length > 60 && (
              <span
                onClick={() => id && toggleReason(id)}
                className="text-primary bg-none"
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                {isExpanded ? " Read less" : " Read more..."}
              </span>
            )}
          </span>
        );
      },
    },
    {
      Header: "Status",
      Cell: ({ row }: { row: UserHostReport }) => {
        const label = getStatusLabel(row?.status);
        const isPending = row?.status === 1;
        return (
          <span
            className="text-capitalize fw-normal"
            style={{
              color: isPending ? "#F39C12" : "#2ECC71",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: UserHostReport }) => {
        const date = new Date(row?.createdAt);
        const formattedDate = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        return <span className="text-nowrap text-normal">{formattedDate}</span>;
      },
    },
    {
      Header: "Updated At",
      Cell: ({ row }: { row: UserHostReport }) => {
        const date = new Date(row?.updatedAt);
        const formattedDate = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        return <span className="text-nowrap text-normal">{formattedDate}</span>;
      },
    },
    ...(showActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: UserHostReport }) => (
            <div className="d-flex justify-content-center mx-auto gap-2">
              {can("Report", "Edit") && (
                // <button
                //   className="me-2"
                //   onClick={() => handleSolve(row)}
                //   disabled={row.status === 2}
                //   style={{
                //     backgroundColor:
                //       row.status === 2 ? "#E0E0E0" : "#D6FFD7",
                //     borderRadius: "8px",
                //     padding: "8px",
                //     cursor: row.status === 2 ? "not-allowed" : "pointer",
                //   }}
                // >
                //   <svg
                //     width="22"
                //     height="22"
                //     viewBox="0 0 30 30"
                //     fill="none"
                //     xmlns="http://www.w3.org/2000/svg"
                //     style={{ opacity: row.status === 2 ? 0.5 : 1 }}
                //   >
                //     <path
                //       d="M15 27.5C21.9036 27.5 27.5 21.9036 27.5 15C27.5 8.09644 21.9036 2.5 15 2.5C8.09644 2.5 2.5 8.09644 2.5 15C2.5 21.9036 8.09644 27.5 15 27.5Z"
                //       stroke={row.status === 2 ? "#9E9E9E" : "#09C50C"}
                //       strokeWidth="2"
                //     />
                //     <path
                //       d="M10.625 15.625L13.125 18.125L19.375 11.875"
                //       stroke={row.status === 2 ? "#9E9E9E" : "#09C50C"}
                //       strokeWidth="2"
                //       strokeLinecap="round"
                //       strokeLinejoin="round"
                //     />
                //   </svg>
                // </button>
                 <TableActionIcons
                  size={22}
                  gap={8}
                  actions={[
                    {
                      id: "solve",
                      label: "Solve",
                      icon: IconCircleCheck,
                      color: "#04FF0A",
                      onClick: () => handleSolve(row),
                      disabled: row.status === 2,
                    },
                  ]}
                />
              )}
              {can("Report", "Delete") && (
                <TableActionIcons
                  size={22}
                  gap={8}
                  actions={[
                    {
                      id: "delete",
                      label: "Delete",
                      icon: IconTrash,
                      color: "#EF4444",
                      onClick: () => handleOpenDelete(row),
                    },
                  ]}
                />
              )}
            </div>
          ),
        },
      ]
      : []),
  ];

  return (
    <>
      <CommonDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <Title name="Report" />
      <div className="d-flex justify-content-between align-items-center">
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
          direction={"start"}
        />
        <div className="col-6 mt-2">
          <Searching
            type={`server`}
            data={items}
            setData={() => { }}
            column={reportTable}
            serverSearching={(filteredData: any) => {
              setPage(1);
              if (typeof filteredData === "string") {
                setSearch(filteredData);
              }
            }}
            placeholder={"Search by Name/Unique ID"}
            filterOptions={[
              { value: "All", label: "All" },
              { value: "1", label: "Pending" },
              { value: "2", label: "Solved" },
            ]}
            filterValue={statusFilter}
            onFilterChange={(value: string) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-2">
        <Table
          data={items}
          mapData={reportTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
          shimmer={<ReportShimmer />}
        />
        <div style={{ padding: "25px 0px" }}>
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

Report.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Report;

