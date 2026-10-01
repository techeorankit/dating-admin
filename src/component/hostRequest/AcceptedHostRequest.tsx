import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { getHostRequest } from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { baseURL } from "@/utils/config";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png";
import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import HostRequsetShimmer from "../Shimmer/HostRequsetShimmer";
import Searching from '@/extra/Searching';
import { getImageUrl } from "@/utils/getImageUrl";
import { MdContentCopy } from "react-icons/md";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconInfoCircle } from "@tabler/icons-react";

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
}

const AcceptedHostRequest = ({ type }: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const paginationKey = useMemo(() => `host-request:${type}`, [type]);
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: paginationKey,
    defaultRowsPerPage: 10,
  });
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { hostRequest, totalHostRequest, countryData } = useSelector(
    (state: RootStore) => state.hostRequest
  );
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

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      status: 2,
      search
    };
    if (type === "accepted") {
      dispatch(getHostRequest(payload));
    }
  }, [page, rowsPerPage, type, search]);

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalHostRequest);
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
      pathname: "/HostProfile",
      query: { id: row?._id },
    });

    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const acceptedHostRequestTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Agency",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.agency?.image
          ? row.agency?.image.replace(/\\/g, "/")
          : "";
        return (
          <div className="d-flex justify-content-end align-items-center fw-normal">
            <div style={{ width: "100px", textAlign: "center" }}>
              <img
                src={getImageUrl(row?.agency?.image) || "/images/male.png"}
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
                className="text-capitalize maintext text-nowrap"
                style={{ fontWeight: "500", fontSize: "14px" }}
              >
                {row?.agency?.name
                  ? row?.agency?.name
                  : row?.agency?.name || "-"}
              </p>

              <div className="d-flex align-items-center">
                <p
                  className="text-capitalize cursorPointer  text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px" }}
                >
                  {row?.agency?.agencyCode || "-"}
                </p>
                <button
                  className="btn btn-sm p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyId(row?.agency?.agencyCode);
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
      accessor: "host",
      Cell: ({ row }: { row: any }) => {

        return (
          <div
            className="d-flex justify-content-end align-items-center fw-normal cursor-pointer"
            onClick={() => handleInfo(row)}
          >
            {/* Image Section */}
            <div style={{ width: "60px", textAlign: "center" }}>
              <img
                src={
                  getImageUrl(row?.image)
                }
                alt={"Image"}
                width="60"
                height="60"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = `/images/male.png`;
                }}
                style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
              />
            </div>

            {/* Product Name */}
            <div style={{ width: "200px", textAlign: "start" }}>
              <p
                className="text-capitalize ms-3 cursorPointer maintext text-nowrap"
                style={{ fontWeight: "500", fontSize: "14px" }}
              >
                {row?.name || "-"}
              </p>
              <div className="d-flex align-items-center">
                <p
                  className="text-capitalize ms-3 cursorPointer  text-nowrap"
                  style={{ fontWeight: "400", fontSize: "12px" }}
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
            <div style={{ width: "70px", textAlign: "center" }}>
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
                className="text-capitalize ms-3 cursorPointer maintext text-nowrap"
                style={{ fontWeight: "500", fontSize: "14px" }}
              >
                {row?.userId?.name || "-"}
              </p>
              <div className="d-flex align-items-center">
                <p className="text-capitalize ms-3 cursorPointer text-nowrap" style={{ fontWeight: "400", fontSize: "12px" }}>
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
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded = expanded[index] || false;
        const impressionText = String(row?.impression || ""); // Convert to string
        const previewText = impressionText.substring(0, 50); // First 30 chars

        return (
          <div
            className="text-capitalize padding-left-2px fw-normal"
            style={{ width: "300px" }}
          >
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
          </div>
        );
      },
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
                  src={flagImageUrl ? flagImageUrl : `/images/india.png`}
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
            <div style={{ width: "200px", textAlign: "start" }}>
              <span className="text-capitalize fw-normal">
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
  ];
  return (
    <div className="mainCategory">
      <div className="d-flex w-100 justify-content-end mb-3">
        <div style={{ width: 600 }}>
          <Searching
            type={`server`}
            data={hostRequest}
            setData={setData}
            column={acceptedHostRequestTable}
            serverSearching={handleFilterData}
            placeholder={"Search by Host Name/Unique ID"}
          />
        </div>
      </div>
      <div>
        <div>
          <Table
            data={hostRequest}
            mapData={acceptedHostRequestTable}
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

export default AcceptedHostRequest;
