import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Analytics from "@/extra/Analytic";
import { getCoinPlanUserHistory } from "@/store/coinPlanSlice";
import { getCoinPlanHistory } from "@/store/hostSlice";
import CoinPlanTable from "../component/Shimmer/CoinPlanTable";
import { formatCoins } from "@/utils/number";
import { formatDateTime } from "@/utils/date";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import { getImageUrl } from "@/utils/getImageUrl";
import Searching from "@/extra/Searching";

const CoinPlanHistory = (props: any) => {
  const { queryType } = props;
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "null")
      : null;
  const hostData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const {
    coinPlanHistory,
    totalCoinPlanHistory,
    totalIncoming,
    totalOutGoing,
  } = useSelector((state: RootStore) => state.coinPlan);

  const { hostCoinHistory, totalHostCoinPlanHistory } = useSelector(
    (state: RootStore) => state.host
  );
  const coinPlanHistoryKey = useMemo(
    () => `coin-plan-history:${queryType}`,
    [queryType]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: coinPlanHistoryKey,
    defaultRowsPerPage: 10,
  });
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const coinPlanHistoryData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("coinPlanHistoryData") || "null")
      : null;

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      id: queryType === "host" ? hostData?._id : userData?._id,
      startDate,
      endDate,
      search,
    };

    if (queryType === "host") {
      dispatch(getCoinPlanHistory(payload));
    } else {
      dispatch(getCoinPlanUserHistory(payload));
    }
  }, [dispatch, page, rowsPerPage, startDate, endDate, queryType, search]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    const totalRows =
      queryType === "host" ? totalHostCoinPlanHistory : totalCoinPlanHistory;
    changeRowsPerPage(parseInt(event, 10), totalRows);
  };

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const coinPlanTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },



    {
      Header: `${queryType === "host" ? "Sender Name" : "Receiver Name"} `,
      body: "uniqueid",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image
          ? row.image.replace(/\\/g, "/")
          : "";

        return (
          <div style={{ cursor: "pointer" }} >
            <div className="d-flex px-2 py-1">
              <div>
                <img
                  src={getImageUrl(queryType === "host" ? row?.senderImage : row?.receiverImage) || "/images/male.png"}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = '/images/male.png';
                  }}
                  alt="Image"
                  loading="eager"
                  draggable="false"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    height: "50px",
                    width: "50px",
                  }}
                  height={70}
                  width={70}
                />
              </div>
              <div className="d-flex flex-column justify-content-center text-start ms-3">
                <span className="mb-0 text-sm text-capitalize maintext">
                  {queryType === "host"
                    ? row?.senderName || "-"
                    : row?.receiverName || "-"}
                </span>
                <div className="d-flex align-items-center">
                  {(queryType === "host" ? row?.senderUniqueId : row?.receiverUniqueId) && (
                    <div className="d-flex align-items-center">
                      <p
                        className="text-capitalize fw-normal mb-0"
                        style={{ fontSize: "12px", color: "gray" }}
                      >
                        {queryType === "host" ? row?.senderUniqueId : row?.receiverUniqueId}
                      </p>

                      <button
                        className="btn btn-sm p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyId(queryType === "host" ? row?.senderUniqueId : row?.receiverUniqueId);
                        }}
                        style={{ fontSize: "10px", lineHeight: "1" }}
                        title="Copy Unique ID"
                      >
                        <MdContentCopy size={14} color="gray" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      },



    },

    {
      Header: "UniqueId",
      body: "uniqueid",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize cursorPointer">{row?.uniqueId}
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
          </button></span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex justify-content-center align-items-center">
          <div style={{ width: "150px", textAlign: "left" }}>
            <span className="text-capitalize">{row?.typeDescription}</span>
          </div>
          {row?.payoutStatus === 1 && (
            <p style={{ color: "#FF8D0B" }}>(Pending)</p>
          )}
          {row?.payoutStatus === 2 && (
            <p style={{ color: "#0EBA1A" }}>(Accepted)</p>
          )}
          {row?.payoutStatus === 3 && (
            <p style={{ color: "#FF3737" }}>(Declined)</p>
          )}
        </div>
      ),
    },

    queryType === "host"
      ? {
        Header: "User Coin",
        Cell: ({ row }: { row: any }) => {
          const isAdd = row?.type === 14;
          const isDeduct = row?.type === 15;
          const color = isAdd ? "green" : isDeduct ? "red" : "black";
          const sign = isAdd ? "+" : isDeduct ? "-" : "";

          return (
            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              <img
                src="/images/coin.webp"
                alt="coin"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <span
                className="text-capitalize"
                style={{ color, fontWeight: 500 }}
              >
                {`${sign} ${formatCoins(row?.userCoin)}`}
              </span>
            </div>
          );
        },
      }

      : {
        Header: "User Coin",
        Cell: ({ row }: { row: any }) => {
          const isAdd = row?.type === 14;
          const isDeduct = row?.type === 15;
          const color = isAdd ? "green" : isDeduct ? "red" : "black";
          const sign = isAdd ? "+" : isDeduct ? "-" : "";

          return (

            <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
              <img
                src="/images/coin.webp"
                alt="coin"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <span
                className="text-capitalize"
                style={{ color, fontWeight: 500 }}
              >
                {`${sign} ${formatCoins(row?.userCoin)}`}
              </span>
            </div>
          );
        },
      },

    queryType === "host"
      ? {
        Header: "Host Coin",
        Cell: ({ row }: { row: any }) => {
          const hostCoin = row?.hostCoin ?? 0;
          const isIncome = row?.isIncome;
          const isPositive = hostCoin > 0;
          return (
            <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
              <img
                src="/images/coin.webp"
                alt="coin"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <span
                className="text-capitalize"
                style={{
                  color:
                    isIncome === true
                      ? "green"
                      : row?.payoutStatus === 2
                        ? "red"
                        : "orange",
                }}
              >
                {isIncome === true
                  ? `+${formatCoins(hostCoin)}`
                  : row?.payoutStatus === 2
                    ? `-${formatCoins(hostCoin)}`
                    : formatCoins(hostCoin)}
              </span>
            </div>
          );
        },
      }
      : {
        Header: "Host Coin",
        Cell: ({ row }: { row: any }) => {
          const hostCoin = row?.hostCoin ?? 0;
          const isPositive = hostCoin > 0;
          return (
            <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
              <img
                src="/images/coin.webp"
                alt="coin"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <span
                className="text-capitalize"
                style={{
                  color: isPositive ? "green" : "inherit",
                }}
              >
                {isPositive ? `+${hostCoin.toFixed(2)}` : hostCoin.toFixed(2)}
              </span>
            </div>
          );
        },
      },

    {
      Header: "Admin Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
          <img
            src="/images/coin.webp"
            alt="coin"
            width={20}
            height={20}
            style={{ objectFit: "contain" }}
          />
          <span className="text-capitalize">
            {formatCoins(row?.adminCoin)}
          </span>
        </div>
      ),
    },

    {
      Header: "Agency Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
          <img
            src="/images/coin.webp"
            alt="coin"
            width={20}
            height={20}
            style={{ objectFit: "contain" }}
          />
          <span className="text-capitalize">
            {formatCoins(row?.agencyCoin)}
          </span>
        </div>
      ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize text-nowrap">
          {formatDateTime(row?.createdAt)}
        </span>
      ),
    },
  ];

  const tableData = queryType === "host" ? hostCoinHistory : coinPlanHistory;

  return (
    <>
      <div className="row d-flex align-items-center pt-3">
        <div
          className="col-12 fs-20 fw-600 d-flex gap-5 flex-wrap justify-content-end"
          style={{ color: "#404040", marginBottom: "0px" }}
        >
          {queryType !== "host" && (
            <>
              <div style={{ fontWeight: "500", fontSize: "18px" }}>
                <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
                  Total Income : {" "}
                  <span style={{ color: "green" }}>{totalIncoming}</span>
                  <img
                    src="/images/coin.webp"
                    alt="coin"
                    width={20}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
              <div style={{ fontWeight: "500", fontSize: "18px" }}>
                <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
                  Total Outgoing : {" "}
                  <span style={{ color: "red" }}>{totalOutGoing}</span>
                  <img
                    src="/images/coin.webp"
                    alt="coin"
                    width={20}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="row d-flex align-items-center pt-3">
        <div className="col-md-6 col-6 mb-0 d-flex justify-content-start">
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"start"}
          />
        </div>

        <div className="col-md-6 col-6 mt-3">
          <Searching
            type={"server"}
            data={tableData}
            setData={setData}
            column={coinPlanTable}
            serverSearching={handleFilterData}
            placeholder={"Search by User Name / Unique Id"}
          />
        </div>
      </div>

      <div className="mt-2">
        <div style={{ marginBottom: "32px" }}>
          <Table
            data={tableData}
            mapData={coinPlanTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"server"}
            shimmer={<CoinPlanTable />}
          />
        </div>
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={
            queryType === "host"
              ? totalHostCoinPlanHistory
              : totalCoinPlanHistory
          }
        />
      </div>
    </>
  );
};

CoinPlanHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default CoinPlanHistory;
