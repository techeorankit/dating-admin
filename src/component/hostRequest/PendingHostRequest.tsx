import { basePath } from "@/utils/config";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import {
  getAgencyList,
  getHostRequest,
  hostRequestUpdate,
} from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { warning, warningForAccept } from "@/utils/Alert";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import HostReasonDialog from "./HostReasonDialog";
import { useRouter } from "next/router";
import AssignAgencyToDialog from "./AssignAgencyToDialg";
import CommonDialog from "@/utils/CommonDialog";
import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import HostRequsetShimmer from "../Shimmer/HostRequsetShimmer";
import Searching from "@/extra/Searching";
import { getImageUrl } from "@/utils/getImageUrl";
import { MdContentCopy } from "react-icons/md";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconInfoCircle, IconX, IconId } from "@tabler/icons-react";

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

const PendingHostRequest = ({ type }: any) => {
  const dispatch = useDispatch();
  const { can } = usePermission();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [hasFetchedAgencyList, setHasFetchedAgencyList] = useState(false);

  const router = useRouter();
  
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [expandedCountry, setExpandedCountry] = useState<{
    [key: number]: boolean;
  }>({});
  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleCountry = (index: number) => {
    setExpandedCountry((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const paginationKey = useMemo(() => `host-request:pending:${type}`, [type]);
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: paginationKey,
    defaultRowsPerPage: 10,
  });
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { hostRequest, totalHostRequest, countryData } = useSelector(
    (state: RootStore) => state.hostRequest
  );
  const [selectedAgency, setSelectedAgency] = useState<string>(""); // Ensure it's a string

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (dialogueType === "assignagency" && !hasFetchedAgencyList) {
      dispatch(getAgencyList());
      setHasFetchedAgencyList(true);
    }
  }, [dialogueType, dispatch, hasFetchedAgencyList]);

  const handleAccepteHostRequest = async () => {
    
    if (selectedId) {
      const payload = {
        requestId: selectedId?._id,
        userId: selectedId?.userId?._id,
      };
      dispatch(hostRequestUpdate(payload));
      setShowDialog(false);
    }
  };

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      status: 1,
      search,
    };
    dispatch(getHostRequest(payload));
  }, [page, type, search]);

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalHostRequest);
  };

  const handleInfo = (row: any) => {
    router.push({
      pathname: "/HostProfile",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleOpenAgencyDialog = (row: any) => {
    
    if (row?.agencyId === null) {
      dispatch(
        openDialog({ type: "assignagency", data: { row, type: "expert" } })
      );
    }
  };

  const pendingHostRequest = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Host",
      accessor: "host",
      Cell: ({ row }: { row: any }) => {
        // Define updatedImagePath before returning JSX
        const updatedImagePath = row?.image
          ? row.image.replace(/\\/g, "/")
          : "";

        const handleClick = () => {
          router.push({
            pathname: "/Host/HostInfoPage",
            query: { id: row?._id },
          });
        };

        return (
          <div
            className="d-flex justify-content-end align-items-center cursor-pointer"
            onClick={handleClick}
          >
            {/* Image Section */}
            <div style={{ width: "100px", textAlign: "center" }}>
              <img
                src={getImageUrl(row?.image)}
                alt="Image"
                width="60"
                height="60"
                style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `${basePath}/images/male.png`;
                }}
              />
            </div>

            {/* Product Name */}
            <div style={{ width: "200px", textAlign: "start" }}>
              <p className="text-capitalize  cursorPointer maintext text-nowrap" style={{ fontWeight: "500", fontSize: "14px" }}>
                {row?.name || "-"}
              </p>
              <div className="d-flex align-items-center ">
                <p className=" text-capitalize text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}>
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
            className="d-flex justify-content-end align-items-center fw-normal cursor-pointer"
            onClick={handleClick}
          >
            {/* Image Section */}
            <div style={{ width: "100px", textAlign: "center" }}>
              <img
                src={getImageUrl(row?.userId?.image) || `${basePath}/images/male.png`}
                alt="Image"
                width="60"
                height="60"
                style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `${basePath}/images/male.png`;
                }}
              />
            </div>

            {/* Product Name */}
            <div style={{ width: "200px", textAlign: "start" }}>
              <p className="text-capitalize  cursorPointer maintext text-nowrap" style={{ fontWeight: "500", fontSize: "14px" }}>
                {row?.userId?.name || "-"}
              </p>
              <div className="d-flex align-items-center">
                <p className="text-capitalize text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px", color: "gray" }}>
                  {row?.userId?.uniqueId || "-"}
                </p>
                <button
                  className="btn btn-sm p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyId(row?.userId?.uniqueId);
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
      Header: "Impression",
      Cell: ({ row, index }: { row: SuggestedServiceData; index: any }) => {
        const isExpanded = expanded[index] || false;
        const impressionText = String(row?.impression || ""); // Convert to string
        const previewText = impressionText.substring(0, 35); // First 30 chars

        return (
          <span className="text-capitalize padding-left-2px">
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
      Header: "Identity Proof Type",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.identityProofType || "-"}</span>
      ),
    },

    {
      Header: "Country",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const countryName = row?.country || "-";
        const emoji = row?.countryFlagImage; // e.g., "🇮🇳"

        const countryCode = getCountryCodeFromEmoji(emoji); // "in"

        const flagImageUrl = countryCode
          ? `https://flagcdn.com/w80/${countryCode}.png`
          : null;

        const isExpanded = expandedCountry[index] || false;
        const previewText = countryName.substring(0, 10);

        return (
          <div className="d-flex justify-content-end align-items-center gap-3">
            {flagImageUrl && (
              <div style={{ width: "70px", textAlign: "end" }}>
                <img
                  src={flagImageUrl ? flagImageUrl : `${basePath}/images/india.png`}
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
            <div style={{ width: "150px", textAlign: "start" }}>
              <span className="text-capitalize">
                {isExpanded ? countryName : previewText || "-"}
                {countryName.length > 10 && (
                  <span
                    onClick={() => toggleCountry(index)}
                    className="text-primary bg-none"
                    style={{ cursor: "pointer", marginLeft: "5px" }}
                  >
                    {isExpanded ? " Read less" : " Read more..."}
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      },
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

    ...(can("Host Request", "Edit")
      ? [
        {
          Header: "Assign Agency",
          Cell: ({ row }: { row: any }) => {

            return (

              <span className="d-flex justify-content-center">

                <TableActionIcons
                  size={22}
                  gap={8}
                  actions={[
                    {
                      id: "info",
                      label: "Info",
                      title: "Info",
                      icon: IconId,
                      color: "#5A7ACD",
                      onClick: () => handleOpenAgencyDialog(row),
                    },
                  ]}
                />

              </span>
            )
          },
        },
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => (
            <TableActionIcons
              size={22}
              gap={8}
              justifyContent="center"
              actions={[
                {
                  id: "decline",
                  label: "Decline",
                  title: "Decline",
                  icon: IconX,
                  color: "#dc2626",
                  onClick: () => {
                    
                    dispatch(openDialog({ type: "reason", data: row }));
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
      <div className="d-flex w-100 justify-content-end mb-3">
        <div style={{ width: 600 }}>
          <Searching
            type={`server`}
            data={hostRequest}
            setData={setData}
            column={pendingHostRequest}
            serverSearching={handleFilterData}
            placeholder={"Search by Host Name/Unique ID"}
          />
        </div>
      </div>

      {dialogueType === "reason" && <HostReasonDialog />}
      {dialogueType == "assignagency" && (
        <AssignAgencyToDialog
          selectedAgency={selectedAgency}
          setSelectedAgency={setSelectedAgency}
        />
      )}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleAccepteHostRequest}
        text={"Accept"}
      />

      <div>
        <div >
          <Table
            data={hostRequest}
            mapData={pendingHostRequest}
            PerPage={rowsPerPage}
            Page={page}
            type={"server"}
            shimmer={<HostRequsetShimmer />}
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
            totalData={totalHostRequest}
          />
        </div>
      </div>
    </div>
  );
};

export default PendingHostRequest;
