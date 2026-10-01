import { basePath } from "@/utils/config";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { getHostRequest, hostRequestUpdate } from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { warning, warningForAccept } from "@/utils/Alert";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { blockuser, getRealOrFakeUser } from "@/store/userSlice";
import ToggleSwitch from "@/extra/TogggleSwitch";
import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import Title from "@/extra/Title";
import coin from "@/assets/images/coin.png";
import NotificationDialog from "@/component/user/NotificationDialogue";
import Image from "next/image";
import { getCountryCodeFromEmoji, copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import india from "@/assets/images/india.png";
import { isSkeleton } from "@/utils/allSelector";
import UserShimmer from "@/component/Shimmer/UserShimmer";
import AgencyDialog from "@/component/agency/AgencyDialog";
import CoinUpdateDialog from "@/component/coinPlan/CoinUpdateDialog";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { usePermission } from "@/context/PermissionContext";
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

const User = (props: any) => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const router = useRouter();
  
  const { can, canSee } = usePermission();
  const roleSkeleton = useSelector(isSkeleton);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "user:list",
    defaultRowsPerPage: 10,
  });
  const { user, total } = useSelector((state: RootStore) => state.user);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    const payloadFilters: any = {};

    switch (statusFilter) {
      case "vip":
        payloadFilters.isVip = true;
        break;
      case "notVip":
        payloadFilters.isVip = false;
        break;
      case "block":
        payloadFilters.isBlock = true;
        break;
      case "unblock":
        payloadFilters.isBlock = false;
        break;
      case "online":
        payloadFilters.isOnline = true;
        break;
      case "offline":
        payloadFilters.isOnline = false;
        break;
      case "busy":
        payloadFilters.isBusy = true;
        break;
      case "notBusy":
        payloadFilters.isBusy = false;
        break;
      case "host":
        payloadFilters.isHost = true;
        break;
      case "notHost":
        payloadFilters.isHost = false;
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
      ...(countryFilter ? { country: countryFilter } : {}),
      ...payloadFilters,
    };
    dispatch(getRealOrFakeUser(payload));
  }, [page, rowsPerPage, startDate, endDate, search, statusFilter, countryFilter, dispatch]);

  useEffect(() => {
    if (!canSee("User")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

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
      pathname: "/User/UserInfoPage",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("userData", JSON.stringify(row));
  };

  const handleRedirect = (row: any) => {
    router.push({
      pathname: "/User/CoinPlanHistoryPage",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("userData", JSON.stringify(row));
  };

  const handleNotify = (row: any) => {
    dispatch(
      openDialog({
        type: "notification",
        data: { id: row?._id, type: "user", name: row?.name },
      })
    );
  };

  const handleEdit = (row: any) => {
    dispatch(openDialog({ type: "Coin", data: { id: row?._id, type: "Coin", coin: row?.coin } }));
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "User",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const rawImagePath = row?.image || "";
        const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

        const imageUrl = normalizedImagePath.includes("storage")
          ? baseURL + normalizedImagePath
          : normalizedImagePath;

        return (
          <div style={{ cursor: "pointer" }} onClick={() => handleInfo(row)}>
            <div className="d-flex px-2 py-1" style={{ width: "250px" }}>
              <div>
                <img
                  src={getImageUrl(row?.image) || `${basePath}/images/male.png`}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `${basePath}/images/male.png`;
                  }}
                  referrerPolicy="no-referrer"
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
                />
              </div>
              <div
                style={{ width: "100px" }}
                className="d-flex flex-column justify-content-center text-start ms-3 text-nowrap"
              >
                <p className=" maintext text-capitalize"
                  style={{ fontWeight: "500" }}>
                  {row?.name || "-"}
                </p>
                <div className="d-flex align-items-center">
                  <p
                    className="text-capitalize fw-normal mb-0"
                    style={{ fontSize: "12px", color: "gray" }}
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
                <p
                  className="text-capitalize fw-normal"
                  style={{ fontSize: "12px", color: "gray" }}
                >
                  {row?.loginType === 1
                    ? "Apple"
                    : row?.loginType === 2
                      ? "Google"
                      : row?.loginType === 3
                        ? "Quick"
                        : "-"}
                </p>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span
          className="text-capitalize fw-normal"
          style={{
            maxWidth: "180px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={row?.email || "-"}
        >
          {row?.email || "-"}
        </span>
      ),
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
                    e.target.src = `${basePath}/images/india.png`;
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
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          <div style={{ width: "30px" }}>
            <img src={`${basePath}/images/coin.webp`} height={20} width={20} />
          </div>
          <div style={{ width: "50px", textAlign: "start" }}>
            <span className="text-capitalize fw-normal">{formatCoins(row?.coin)}</span>
          </div>
        </div>
      ),
    },

    {
      Header: "Recharge Coin",
      Cell: ({ row }: { row: any }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          <div style={{ width: "30px" }}>
            <img src={`${basePath}/images/coin.webp`} height={20} width={20} />
          </div>
          <div style={{ width: "50px", textAlign: "start" }}>
            <span className="text-capitalize fw-normal">{formatCoins(row?.rechargedCoins)}</span>
          </div>
        </div>
      ),
    },

    {
      Header: "Following",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.totalFollowings || 0}
        </span>
      ),
    },

    {
      Header: "Online Status",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isOnline === true ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Host Status",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isHost === true ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Vip Status",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.isVip === true ? "Yes" : "No"}
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
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          });

        return <span className="text-nowrap text-normal">{formattedDateTime}</span>;
      },
    },
    {
      Header: "Last Login",
      Cell: ({ row }: { row: any }) => {
        if (!row?.lastlogin) {
          return <span className="text-nowrap text-normal">-</span>;
        }

        const date = new Date(row.lastlogin);
        const formattedDateTime = isNaN(date.getTime())
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

        return (
          <span className="text-nowrap text-normal">{formattedDateTime}</span>
        );
      },
    },


    ...(can("User", "Edit")
      ? [
        {
          Header: "Block",
          body: "isBlock",
          Cell: ({ row }: { row: any }) => (
            <ToggleSwitch
              value={row?.isBlock}
              onClick={() => {
                const id: any = row?._id;
                
                dispatch(blockuser(id));
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
      Cell: ({ row }: { row: SuggestedServiceData }) => (
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




    {
      Header: "Edit Coin",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <TableActionIcons
          size={22}
          gap={8}
          actions={[
            {
              id: "edit",
              label: "Edit Coin",
              title: "Edit Coin",
              icon: IconEdit,
              color: "#666666",
              onClick: () => handleEdit(row),
            },
          ]}
        />
      ),
    },


  ];
  return (
    <div className="mainCategory">
      {dialogueType == "notification" && <NotificationDialog />}
      {dialogueType === "Coin" && <CoinUpdateDialog />}
      <Title
        name="User Table"
        description="Manage users, review profiles, and control account status from one place."
      />
      <div className="d-flex justify-content-between align-items-center gap-3">
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
            data={user}
            setData={setData}
            column={userTable}
            serverSearching={handleFilterData}
            placeholder={"Search by Email / Name / Unique Id"}
            countryValue={countryFilter}
            onCountryChange={(value: string) => {
              setCountryFilter(value);
              setPage(1);
            }}
            filterOptions={[
              { value: "all", label: "All" },
              { value: "block", label: "Blocked" },
              { value: "unblock", label: "Unblocked" },
              { value: "offline", label: "Offline" },
              { value: "online", label: "Online" },
              { value: "vip", label: "VIP" },
              { value: "busy", label: "Busy" },
              { value: "host", label: "Host" },
            ]}
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
      </div>
      <div className="">
        <Table
          data={user}
          mapData={userTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
          shimmer={<UserShimmer />}
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
    </div>
  );
};

User.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default User;
