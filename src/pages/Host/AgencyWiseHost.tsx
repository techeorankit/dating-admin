import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Pagination from "@/extra/Pagination";
import Searching from "@/extra/Searching";
import Table from "@/extra/Table";
import { getAgencyWiseHost } from "@/store/agencySlice";
import { RootStore } from "@/store/store";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { openDialog } from "@/store/dialogSlice";
import { blockonlinebusyHost } from "@/store/hostSlice";

import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import noImg from "@/assets/images/noImg.png";
import { getImageUrl } from "@/utils/getImageUrl";
import { MdContentCopy, MdTransgender } from "react-icons/md";
import { IoMale } from "react-icons/io5";
import { IoFemale } from "react-icons/io5";
import { usePermission } from "@/context/PermissionContext";
import { formatCoins } from "@/utils/number";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconBell, IconHistory, IconInfoCircle } from "@tabler/icons-react";

const AgencyWiseHost = () => {
  const { can } = usePermission();
  const router = useRouter();
  const { agencyWiseHost, totalagencyWiseHost } = useSelector(
    (state: RootStore) => state.agency
  );

  const agencyData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("agencyData") || "null")
      : null;
  

  const agencyPaginationKey = useMemo(
    () => `agency-wise-host:${String(router?.query?.id ?? "")}`,
    [router?.query?.id]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: agencyPaginationKey,
    defaultRowsPerPage: 10,
  });
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
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

    const payload = {
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      search,
      agencyId: router?.query?.id,
      sortBy,
      sortOrder,
    };

    if (isBlock !== undefined) (payload as any).isBlock = isBlock;
    if (isOnline !== undefined) (payload as any).isOnline = isOnline;
    if (isBusy !== undefined) (payload as any).isBusy = isBusy;
    if (isLive !== undefined) (payload as any).isLive = isLive;
    if (countryFilter) (payload as any).country = countryFilter;

    if (router?.query?.id) {
      dispatch(getAgencyWiseHost(payload));
    }
  }, [
    page,
    rowsPerPage,
    startDate,
    endDate,
    search,
    router?.query?.id,
    statusFilter,
    countryFilter,
    sortBy,
    sortOrder,
  ]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalagencyWiseHost);
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const agencyWiseHostTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Host",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image
          ? row.image.replace(/\\/g, "/")
          : row.image;

        const handleClick = () => {
          router.push({
            pathname: "/Host/HostInfoPage",
            query: { id: row?._id },
          });
        };

        return (
          <div style={{ cursor: "pointer" }} onClick={handleClick}>
            <div className="d-flex px-2 py-1 ">
              <div>
                <img
                  src={
                    getImageUrl(row?.image)
                  }
                  alt="Image"
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
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `/images/male.png`;
                  }}
                />
              </div>
              <div className="d-flex flex-column justify-content-center text-start ms-3 text-nowrap">
                <p className="mb-0 text-sm text-capitalize maintext">
                  {row?.name || "-"}
                </p>
                <div className="d-flex align-items-center">
                  <p className="text-capitalize fw-normal mb-0 " style={{ fontSize: "12px", color: "gray" }}>
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
      Header: "Identity Proof Type",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.identityProofType || "-"}
        </span>
      ),
    },

    {
      Header: "Impression",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded = expanded[index] || false;
        const impressionText = String(row?.impression || ""); // Convert to string
        const previewText = impressionText.substring(0, 15); // First 30 chars

        return (
          <span className="text-capitalize fw-normal padding-left-2px text-nowrap">
            {isExpanded ? impressionText : previewText || "-"}
            {impressionText.length > 10 && (
              <span
                onClick={() => toggleReview(index)}
                className="text-primary bg-none"
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                {isExpanded && impressionText.length > 10
                  ? " Read less"
                  : " Read more..."}
              </span>
            )}
          </span>
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
                  height={40}
                  width={40}
                  alt={`${countryName} Flag`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50px",
                    border: "1px solid #ccc",
                    width: "40px",
                    height: "40px",
                  }}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/india.png`;
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
      Header: "Net Available Earning",
      body: "netAvailableEarnings",
      sorting: { type: "server" },
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {formatCoins(
            row?.netAvailableEarnings ??
            row?.netEarning ??
            row?.netAvailableEarning ??
            0
          )}
        </span>
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
      body: "createdAt",
      sorting: { type: "server" },
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formattedDateTime = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        return (
          <span className="text-nowrap text-normal">{formattedDateTime}</span>
        );
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

    ...(can("Host", "Edit")
      ? [
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
  ];

  return (
    <div>
      <p
        className="text-theme"
        style={{
          color: "rgb(64, 64, 64)",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        {`${agencyData?.name}'s Host`}
      </p>
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
            data={agencyWiseHost}
            setData={setData}
            column={agencyWiseHostTable}
            serverSearching={handleFilterData}
            placeholder={"Find Name/UniqueID..."}
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
              { value: "notBusy", label: "Not Busy" },
              { value: "live", label: "Live" },
              { value: "notLive", label: "Not Live" },
            ]}
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
      </div>
      <Table
        data={agencyWiseHost}
        mapData={agencyWiseHostTable}
        PerPage={rowsPerPage}
        Page={page}
        type={"server"}
        onChildValue={handleSort}
        sortColumn={sortBy}
        sortOrder={sortOrder}
      />
      <Pagination
        type={"server"}
        serverPage={page}
        setServerPage={setPage}
        serverPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalData={totalagencyWiseHost}
      />
    </div>
  );
};

AgencyWiseHost.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AgencyWiseHost;
