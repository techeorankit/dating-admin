import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import { openDialog, openMessageDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import image from "@/assets/images/bannerImage.png";
import messageSvg from "@/assets/images/message-regular.svg";
import { RootStore } from "@/store/store";
import AgencyDialog from "@/component/agency/AgencyDialog";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { baseURL } from "@/utils/config";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { blockUnblockAgency } from "@/store/agencySlice";
import { useRouter } from "next/router";
import male from "@/assets/images/male.png";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import HostDialog from "./HostDialog";
import {
  blockonlinebusyHost,
  deleteHost,
  getRealOrFakeHost,
  getMessage,
} from "@/store/hostSlice";
import Image from "next/image";
import { warning } from "@/utils/Alert";
import CommonDialog from "@/utils/CommonDialog";
import MessageDialog from "./MessageDialog";
import FakeHostShimmer from "../Shimmer/FakeHostShimmer";
import { getImageUrl } from "@/utils/getImageUrl";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import { IoFemale, IoMale } from "react-icons/io5";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";

export const FakeHost = ({ type }: any) => {
  const dispatch = useDispatch();
  const { can } = usePermission();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const { fakeHost, totalFakeHost }: any = useSelector(
    (state: RootStore) => state.host
  );
  const router = useRouter();
  const paginationKey = useMemo(() => `host:fake:${type}`, [type]);
  const { page, setPage, rowsPerPage, changeRowsPerPage, setRowsPerPage } =
    usePersistedPagination({
      storageKey: paginationKey,
      defaultRowsPerPage: 10,
      // Fake Host is a tab inside the `/Host` page; keep pagination persistence
      // in sessionStorage only (URL syncing can cause back-navigation mismatches).
      syncWithUrl: false,
    });
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  

  const showHostActions = can("Host", "Edit") || can("Host", "Delete");

  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const flagImages =
    fakeHost
      ?.map((fakeHost: any) => fakeHost?.countryFlagImage?.toUpperCase())
      .filter(Boolean) || [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldReset = sessionStorage.getItem("admin:resetPaginationByFakeHostTab") === "1";
    if (!shouldReset) return;

    // Consume the flag once so "Info -> back" keeps the previous page.
    sessionStorage.setItem("admin:resetPaginationByFakeHostTab", "0");
    setPage(1);
    setRowsPerPage(10);
  }, [setPage, setRowsPerPage]);

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      search,
      type: 2,
    };
    if (type === "fake_host") {
      dispatch(getRealOrFakeHost(payload));
    }
  }, [page, rowsPerPage, startDate, endDate, search, type]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleInfo = (row: any) => {
    router.push({
      pathname: "/Host/HostInfoPage",
      query: { id: row?._id, type: "fakeHost" },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalFakeHost);
  };

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteHost(selectedId));
      setShowDialog(false);
    }
  };
  const handleDelete = (id: any) => {
    

    setSelectedId(id);
    setShowDialog(true);
  };

  const agencyTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    // {
    //   Header: "Unique Id",
    //   Cell: ({ row }: { row: any }) => (
    //     <span className="text-capitalize fw-normal">
    //       {row?.uniqueId || "-"}
    //     </span>
    //   ),
    // },

    {
      Header: "Host",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image
          ? row.image.replace(/\\/g, "/")
          : "";

        return (
          <div style={{ cursor: "pointer" }} onClick={() => handleInfo(row)}>
            <div className="d-flex px-2 py-1">
              <div>
                <img
                  src={getImageUrl(row?.image)}
                  alt="Image"
                  loading="eager"
                  draggable="false"
                  style={{
                    borderRadius: "50px",
                    objectFit: "cover",
                    height: "50px",
                    width: "50px",
                  }}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/male.png`;
                  }}
                  height={70}
                  width={70}
                />
              </div>
              <div className="d-flex flex-column justify-content-center text-start ms-3">
                <p className="mb-0 text-sm text-capitalize maintext"
                  style={{ fontWeight: "500", fontSize: "14px" }}>
                  {row?.name || "-"}
                </p>
                <div className="d-flex align-items-center">
                  <p className="text-capitalize fw-normal">
                    {row?.uniqueId || "-"}
                  </p>
                  <button
                    className="btn btn-sm p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyId(row?.uniqueId);
                    }}
                    style={{ fontSize: "10px", lineHeight: "1" }}
                    title="Copy Unique ID"
                  >
                    <MdContentCopy size={14} color="gray" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">{row?.email || "-"}</span>
      ),
    },

    {
      Header: "Gender",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          {row?.gender === "male" && <IoMale size={22} color="gray" />}
          {row?.gender === "female" && <IoFemale size={22} color="gray" />}
          <span className="text-capitalize fw-normal">
            {row?.gender || "-"}
          </span>
        </div>
      ),
    },

    {
      Header: "Impression",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded = expanded[index] || false;
        const impressionText = String(row?.impression || ""); // Convert to string
        const previewText = impressionText.substring(0, 30); // First 30 chars

        return (
          <div
            className="text-capitalize padding-left-2px"
            style={{ width: "350px" }}
          >
            {isExpanded ? impressionText : previewText || "-"}
            {/* {impressionText.length > 10 && (
              <span
                onClick={() => toggleReview(index)}
                className="text-primary bg-none"
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                {isExpanded && impressionText.length > 10
                  ? " Read less"
                  : " Read more..."}
              </span>
            )} */}
          </div>
        );
      },
    },

    {
      Header: "Online",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isOnline ? "Yes" : "No"}
        </span>
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

    ...(can("Host", "Edit")
      ? [
        {
          Header: "Block",
          body: "isBlock",
          Cell: ({ row }: { row: any }) => (
            <ToggleSwitch
              value={row?.isBlock}
              onClick={() => {
                const id: any = row?._id;
                const payload = {
                  hostId: id,
                  type: "isBlock",
                };
                
                dispatch(blockonlinebusyHost(payload));
              }}
            />
          ),
        },
      ]
      : []),

    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <TableActionIcons
          size={22}
          gap={8}
          actions={[
            {
              id: "info",
              label: "Info",
              title: "Info",
              icon: IconInfoCircle,
              color: "#666666",
              onClick: () => handleInfo(row),
            },
          ]}
        />
      ),
    },

    ...(showHostActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => {
            const actions: Array<TableActionIconAction | undefined> = [
              can("Host", "Edit")
                ? {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  color: "#666666",
                  onClick: () => {
                    dispatch(openDialog({ type: "fakeHost", data: row }));
                  },
                }
                : undefined,
              can("Host", "Delete")
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
              <div className="d-flex mx-auto" style={{ justifyContent: "center" }}>
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
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="d-flex justify-content-end  gap-3 align-items-center">
        {/* <div
          className="title text-capitalized fw-600 "
          style={{ color: "#404040", fontSize: "20px" }}
        ></div> */}
        {/* <div className="betBox">
          <Button
            className={`bg-main p-10 text-white m10-bottom `}
            bIcon={image}
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
            className={`bg-primary p-10 text-white m10-bottom `}
            bIcon={image}
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
        </div> */}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
          direction={"start"}
        />
        <div className="col-6 mt-3">
          <Searching
            type={`server`}
            data={fakeHost}
            setData={setData}
            column={agencyTable}
            serverSearching={handleFilterData}
            placeholder={"Search by Host Name/Unique ID"}
          />
        </div>
      </div>

      <div className="mt-1">
        <div>
          <Table
            data={fakeHost}
            mapData={agencyTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"server"}
            shimmer={<FakeHostShimmer />}
          />
        </div>
        <div
          style={{
            padding: "25px 0px",
          }}
        >
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalFakeHost}
          />
        </div>
      </div>
    </>
  );
};
