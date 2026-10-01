import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import image from "@/assets/images/bannerImage.png";
import { RootStore } from "@/store/store";
import AgencyDialog from "@/component/agency/AgencyDialog";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { baseURL } from "@/utils/config";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { blockUnblockAgency, getAllAgency } from "@/store/agencySlice";
import { useRouter } from "next/router";
import male from "@/assets/images/male.png";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import Title from "@/extra/Title";
import { getDefaultCurrency } from "@/store/settingSlice";
import Image from "next/image";
import agencyWiseHost from "@/assets/images/agencyWiseHost.svg";
import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import { setToast } from "@/utils/toastServices";
import AgencyShimmer from "@/component/Shimmer/AgencyShimmer";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { MdContentCopy } from "react-icons/md";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconEdit, IconUsers } from "@tabler/icons-react";

const Agency = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue,
  );

  const { can, canSee } = usePermission();
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const { agency, total } = useSelector((state: RootStore) => state.agency);
  const router = useRouter();
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "agency:list",
    defaultRowsPerPage: 10,
  });
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let isBlock: boolean | undefined;

    if (statusFilter === "block") isBlock = true;
    if (statusFilter === "unblock") isBlock = false;

    const payload: any = {
      search,
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };

    if (isBlock !== undefined) payload.isBlock = isBlock;
    if (countryFilter) payload.country = countryFilter;

    dispatch(getAllAgency(payload));
  }, [
    search,
    page,
    rowsPerPage,
    startDate,
    endDate,
    statusFilter,
    countryFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (!canSee("Agency")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, []);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleInfo = (row: any) => {
    router.push({
      pathname: "/Host/AgencyWiseHost",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("agencyData", JSON.stringify(row));
  };

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

  const canSeeAgencyActions =
    can("Agency", "Edit") || can("Agency", "Delete");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const agencyTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Agency",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image
          ? row.image.replace(/\\/g, "/")
          : "";

        return (
          <div className="d-flex justify-content-end align-items-center gap-4 px-2 py-1">
            <div style={{ width: "60px", textAlign: "end" }}>
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
                height={70}
                width={70}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
              />
            </div>
            <div style={{ width: "200px", textAlign: "start" }}>
              <p
                className=" maintext text-capitalize"
                style={{ fontWeight: "500" }}
              >
                {row?.name || "-"}
              </p>
              <div className="d-flex align-items-center gap-2">
                <p
                  className="text-capitalize fw-normal "
                  style={{ fontWeight: "400", fontSize: "12px" }}
                >
                  {row?.agencyCode || "-"}
                </p>
                <button
                  className="btn btn-sm p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyId(row?.agencyCode);
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
      Header: "Commission (%)",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {formatCoins(row?.commission)} %
        </span>
      ),
    },

    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="text-lowercase fw-normal">{row?.email || "-"}</span>
      ),
    },

    {
      Header: "Mobile Number",
      Cell: ({ row }: { row: any }) => (
        <div style={{ width: "200px" }}>
          <span className="text-capitalize fw-normal">
            {row?.countryCode && row?.mobileNumber
              ? `+${row.countryCode} ${row.mobileNumber}`
              : "-"}
          </span>
        </div>
      ),
    },
    // {
    //   Header: "Password",
    //   Cell: ({ row }: { row: any }) => (
    //     <span className="text-capitalize fw-normal">
    //       {row?.password ? "*****" : "-"}
    //     </span>
    //   ),
    // },

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
                  src={
                    row?.countryFlagImage
                      ? row?.countryFlagImage
                      : `/images/india.png`
                  }
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
      Header: "Total Host",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.totalHosts || 0}
        </span>
      ),
    },

    {
      Header: "Host Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
          <img
            src="/images/coin.webp"
            alt="coin"
            width={20}
            height={20}
            style={{ objectFit: "contain" }}
          />
          <span className="text-capitalize fw-normal">
            {formatCoins(row?.hostCoins)}
          </span>
        </div>
      ),
    },

    {
      Header: `Total Earning (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {formatCoins(row?.totalEarnings)} {defaultCurrency?.symbol}
        </span>
      ),
    },

    {
      Header: `Net Available Earning (${defaultCurrency?.symbol})`,
      body: "netAvailableEarnings",
      sorting: { type: "server" },
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {formatCoins(row?.netAvailableEarnings)} {defaultCurrency?.symbol}
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
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        return <span className="text-nowrap text-normal">{formattedDateTime}</span>;
      },
    },

    ...(can("Agency", "Edit")
      ? [
        {
          Header: "Block",
          body: "isBlock",
          Cell: ({ row }: { row: any }) => (
            <ToggleSwitch
              value={row?.isBlock}
              onClick={() => {
                const id: any = row?._id;
                
                dispatch(blockUnblockAgency(id));
              }}
            />
          ),
        },
      ]
      : []),

    {
      Header: "Host",
      Cell: ({ row }: { row: any }) => (
        <TableActionIcons
          size={22}
          gap={8}
          justifyContent="center"
          actions={[
            {
              id: "manage-host",
              label: "Manage Host",
              title: "Manage Host",
              icon: IconUsers,
              color: "#8F6DFF",
              onClick: () => handleInfo(row),
            },
          ]}
        />
      ),
    },

    ...(can("Agency", "Edit")
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => (
            <span className="d-block mx-auto">
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
                      
                      dispatch(openDialog({ type: "agency", data: row }));
                    },
                  },
                ]}
              />
            </span>
          ),
        },
      ]
      : []),
  ];

  return (
    <>
      {dialogueType === "agency" && <AgencyDialog />}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <Title name="Agency" />
        <div className="betBox">
          {can("Agency", "Create") && (
            <Button
              className={`bg-button p-10 text-white m10-bottom `}
              bIcon={`/images/bannerImage.png`}
              text="Add Agency"
              onClick={() => {
                // if (agency.length >= 1) {
                //   setToast("error", "you are not allowed to add more than one agency!");
                //   return;
                // }
                
                dispatch(openDialog({ type: "agency" }));
              }}
            />
          )}
          {dialogueType === "agency" && <AgencyDialog />}
        </div>
      </div>

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
            data={agency}
            setData={setData}
            column={agencyTable}
            serverSearching={handleFilterData}
            placeholder={"Search by AgencyCode/Name"}
            countryValue={countryFilter}
            onCountryChange={(value: string) => {
              setCountryFilter(value);
              setPage(1);
            }}
            filterOptions={[
              { value: "all", label: "All" },
              { value: "block", label: "Blocked" },
              { value: "unblock", label: "Unblocked" },
            ]}
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
      </div>

      <div className="mt-1">
        <Table
          data={agency}
          mapData={agencyTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
          shimmer={<AgencyShimmer />}
          onChildValue={handleSort}
          sortColumn={sortBy}
          sortOrder={sortOrder}
        />
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
    </>
  );
};

Agency.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default Agency;
