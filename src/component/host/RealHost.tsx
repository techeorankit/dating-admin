import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { RootStore } from "@/store/store";
import { warning, warningForAccept } from "@/utils/Alert";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import ToggleSwitch from "@/extra/TogggleSwitch";
import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import {
  blockonlinebusyHost,
  blockRealHost,
  blockUnblockHost,
  getRealOrFakeHost,
} from "@/store/hostSlice";
import Image from "next/image";
import { getCountryCodeFromEmoji, copyId } from "@/utils/Common";
import india from "@/assets/images/india.png";
import HostShimmer from "../Shimmer/HostShimmer";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { MdContentCopy } from "react-icons/md";
import { IoMale } from "react-icons/io5";
import { IoFemale } from "react-icons/io5";
import { usePermission } from "@/context/PermissionContext";
import HostDialog from "./HostDialog";
import TableActionIcons from "@/component/common/TableActionIcons";
import {
  IconBell,
  IconEdit,
  IconHistory,
  IconInfoCircle,
} from "@tabler/icons-react";

interface SuggestedServiceData {
  _id: string;
  doctor: string;
  name: string;
  gender: string;
  email: string;
  age: number;
  dob: any;
  description: string;
  country: string;
  impression: string;
}

export const RealHost = (props: any) => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const router = useRouter();
  const { can } = usePermission();
  
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const showHostActions = can("Host", "Edit");

  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "host:real",
    defaultRowsPerPage: 10,
  });
  const { host, total } = useSelector((state: RootStore) => state.host);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    let isBlock: boolean | undefined;
    let isOnline: boolean | undefined;
    let isBusy: boolean | undefined;
    let isLive: boolean | undefined;

    switch (statusFilter) {
      case "block":
        isBlock = true;
        break;
      case "unblock":
        isBlock = false;
        break;
      case "online":
        isOnline = true;
        break;
      case "offline":
        isOnline = false;
        break;
      case "busy":
        isBusy = true;
        break;
      case "notBusy":
        isBusy = false;
        break;
      case "live":
        isLive = true;
        break;
      case "notLive":
        isLive = false;
        break;
      default:
        break;
    }

    const payload: any = {
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      search,
      type: 1,
    };

    if (isBlock !== undefined) payload.isBlock = isBlock;
    if (isOnline !== undefined) payload.isOnline = isOnline;
    if (isBusy !== undefined) payload.isBusy = isBusy;
    if (isLive !== undefined) payload.isLive = isLive;
    if (countryFilter) payload.country = countryFilter;

    dispatch(getRealOrFakeHost(payload));
  }, [page, rowsPerPage, startDate, endDate, search, statusFilter, countryFilter]);

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), total);
  };

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleInfo = (row: any) => {
    router.push({
      pathname: "/Host/HostInfoPage",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleRedirect = (row: any) => {
    router.push({
      pathname: "/Host/HostHistoryPage",
      query: { id: row?._id, type: "host" },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleNotify = (row: any) => {
    dispatch(
      openDialog({
        type: "notification",
        data: { id: row?._id, type: "host", name: row?.name },
      })
    );
  };

  const userTable = [
    {
      Header: "No",
      cellStyle: { paddingLeft: "10px !important" },
      Cell: ({ index }: { index: any }) => (
        <p> {(page - 1) * rowsPerPage + parseInt(index) + 1}</p>
      ),
    },
    {
      Header: "Agency",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.agencyId?.image
          ? row.agencyId?.image.replace(/\\/g, "/")
          : "";
        return (
          <div className="d-flex justify-content-end align-items-center">
            <div style={{ width: "100px", textAlign: "center" }}>
              <img
                src={
                  getImageUrl(row?.agencyId?.image)
                }
                alt="Image"
                width="60"
                height="60"
                style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
              />
            </div>
            <div style={{ width: "200px", textAlign: "start" }}>
              <p
                className="text-capitalize text-nowrap maintext font-normal"
                style={{ fontWeight: "500" }}
              >
                {row?.agencyId?.name
                  ? row?.agencyId?.name
                  : row?.agency?.name || "-"}
              </p>
              <div className="d-flex align-items-center">
                <p
                  className="text-capitalize cursorPointer text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}
                >
                  {row?.agencyId?.agencyCode || "-"}
                </p>
                <button
                  className="btn btn-sm p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyId(row?.agencyId?.agencyCode);
                  }}
                  style={{ fontSize: "10px", lineHeight: "1" }}
                  title="Copy Unique ID"
                >
                  <MdContentCopy size={14} color="gray" />
                </button>
              </div>
            </div>
          </div>
        );
      },
    },

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
                    e.target.error = null;
                    e.target.src = `/images/male.png`;
                  }}
                  height={70}
                  width={70}
                />
              </div>
              <div className="d-flex flex-column justify-content-center text-start ms-3 text-nowrap">
                <p
                  className="mb-0 text-capitalize maintext"
                  style={{ fontWeight: "500", fontSize: "14px" }}
                >
                  {row?.name || "-"}
                </p>
                <div className="d-flex align-items-center">
                  <p
                    className="mb-0 text-capitalize"
                    style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}
                  >
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
      Header: "User",
      accessor: "User",
      Cell: ({ row }: { row: any }) => {
        // Define updatedImagePath before returning JSX
        const updatedImagePath = row?.userId?.image
          ? row.userId?.image.replace(/\\/g, "/")
          : "";

        const handleClick = () => {
          router.push({
            pathname: "/User/UserInfoPage",
            query: { id: row?.userId?._id },
          });
        };
        return (
          <div
            className="d-flex justify-content-end align-items-center cursor-pointer"
            onClick={handleClick}
          >
            {/* Image Section */}
            <div style={{ width: "60px", textAlign: "center" }}>
              <img
                src={getImageUrl(row?.userId?.image) || "/images/male.png"}
                alt="Image"
                width="60"
                height="60"
                style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
              />
            </div>

            {/* Product Name */}
            <div style={{ width: "200px", textAlign: "start" }}>
              <p
                className="text-capitalize ms-3 cursorPointer text-nowrap maintext"
                style={{ fontWeight: "500", fontSize: "14px" }}
              >
                {row?.userId?.name || "-"}
              </p>
              <div className="d-flex align-items-center ms-3">
                <p
                  className="mb-0 me-2 text-capitalize text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}
                >
                  {row?.userId?.uniqueId || "-"}
                </p>
                <button
                  className="btn btn-sm p-1"
                  onClick={(e) => { e.stopPropagation(); copyId(row?.userId?.uniqueId); }}
                  style={{ fontSize: "10px", lineHeight: "1" }}
                  title="Copy Unique ID"
                >
                  <MdContentCopy size={14} color="gray" />
                </button>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.country || "-";
        const emoji = row?.countryFlagImage; // e.g., "🇮🇳"

        const countryCode = getCountryCodeFromEmoji(emoji); // "in"

        const flagImageUrl = countryCode
          ? `https://flagcdn.com/w80/${countryCode}.png`
          : null;

        return (
          <div className="d-flex justify-content-end align-items-center gap-3">
            {flagImageUrl && (
              <div style={{ width: "70px", textAlign: "end" }}>
                <img
                  src={getImageUrl(flagImageUrl)}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/india.png`;
                  }}
                  height={40}
                  width={40}
                  alt={`${countryName} Flag`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
            <div style={{ width: "100px", textAlign: "start" }}>
              <span className="text-capitalize text-nowrap">{countryName}</span>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Followers",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.totalFollowers || 0}
        </span>
      ),
    },

    {
      Header: "Gender",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          {row?.gender === "male" && <IoMale size={22} color="gray" />}
          {row?.gender === "female" && <IoFemale size={22} color="gray" />}
          <span className="text-capitalize fw-normal">{row?.gender || "-"}</span>
        </div>
      ),
    },

    {
      Header: "Identity Proof Type",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.identityProofType || "-"}
        </span>
      ),
    },

    {
      Header: "Impression",
      Cell: ({ row, index }: { row: SuggestedServiceData; index: any }) => {
        const isExpanded = expanded[index] || false;
        const impressionText = String(row?.impression || ""); // Convert to string
        const previewText = impressionText.substring(0, 15); // First 30 chars

        return (
          <div
            className="text-capitalize fw-normal padding-left-2px"
            style={{ width: "250px" }}
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
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex align-items-center justify-content-start gap-2">
          <img src="/images/coin.webp" alt="Coin" height={20} width={20} />
          <span className="text-capitalize fw-normal">
            {formatCoins(row?.coin)}
          </span>
        </div>
      ),
    },

    {
      Header: "Online",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isOnline === true ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Busy",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isBusy === true ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Live",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isLive === true ? "Yes" : "No"}
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
                
                dispatch(blockRealHost(payload));
              }}
            />
          ),
        },
        {
          Header: "Noification",
          body: "",
          Cell: ({ row }: { row: any }) => (
            <TableActionIcons
              size={22}
              gap={8}
              actions={[
                {
                  id: "notification",
                  label: "Notification",
                  icon: IconBell,
                  color: "#f59e0b",
                  onClick: () => handleNotify(row),
                },
              ]}
            />
          ),
        },
      ]
      : []),

    {
      Header: "Info",
      Cell: ({ row }: { row: SuggestedServiceData }) => {
        return (
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
        );
      },
    },

    {
      Header: "History",
      body: "",
      Cell: ({ row }: { row: any }) => (
        <TableActionIcons
          size={22}
          gap={8}
          actions={[
            {
              id: "history",
              label: "History",
              icon: IconHistory,
              color: "#ef4444",
              onClick: () => handleRedirect(row),
            },
          ]}
        />
      ),
    },
    ...(showHostActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => (
            <TableActionIcons
              size={22}
              gap={8}
              actions={[
                {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  color: "#666666",
                  onClick: () => {
                    
                    dispatch(openDialog({ type: "host", data: row }));
                  },
                },
              ]}
            />
          ),
        },
      ]
      : []),
  ];
  return (
    <div className="mainCategory">
      {dialogueType === "host" && <HostDialog />}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
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
            data={host}
            setData={setData}
            column={userTable}
            serverSearching={handleFilterData}
            placeholder={"Search by Host Name/Unique ID"}
            countryValue={countryFilter}
            onCountryChange={(value: string) => {
              setCountryFilter(value);
              setPage(1);
            }}
            filterOptions={[
              { value: "all", label: "All" },
              { value: "block", label: "Blocked" },
              { value: "unblock", label: "Unblocked" },
              { value: "online", label: "Online" },
              { value: "offline", label: "Offline" },
              { value: "busy", label: "Busy" },
              { value: "live", label: "Live" },
            ]}
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
      </div>

      <div className="mt-1">
        <div>
          <Table
            data={host}
            mapData={userTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"server"}
            shimmer={<HostShimmer />}
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
            totalData={total}
          />
        </div>
      </div>
    </div>
  );
};
