import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Analytics from "@/extra/Analytic";
import { getGiftHistory } from "@/store/userSlice";
import { getLiveBroadCastHistory } from "@/store/hostSlice";
import { formatCoins } from "@/utils/number";
import { formatDateTime } from "@/utils/date";

const LiveBroadCastHistory = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const hostData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const { hostLiveBroadCastHistory, totalLiveHistory, totalDuration } = useSelector(
    (state: RootStore) => state.host
  );
  console.log("totalDuration", totalDuration);

  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "history:live-broadcast",
    defaultRowsPerPage: 10,
  });
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      hostId: hostData?._id,
      startDate,
      endDate,
    };
    dispatch(getLiveBroadCastHistory(payload));
  }, [dispatch, page, rowsPerPage, startDate, endDate]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalLiveHistory);
  };

  const giftTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
          <img
            src="/images/coin.webp"
            alt="coin"
            width={20}
            height={20}
            style={{ objectFit: "contain" }}
          />
          <span className="text-capitalize">{formatCoins(row?.coins)}</span>
        </div>
      ),
    },

    {
      Header: "Gifts",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.gifts || 0}</span>
      ),
    },

    {
      Header: "Audience Count",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.audienceCount || 0}</span>
      ),
    },

    {
      Header: "Live Comments",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.liveComments || 0}</span>
      ),
    },

    {
      Header: "Start Time",
      Cell: ({ row }: { row: any }) => {
        const rawDate = row?.startTime;
        let formattedDate = "-";

        if (rawDate) {
          const date = new Date(rawDate);
          const optionsDate: Intl.DateTimeFormatOptions = {
            month: "long",
            day: "numeric",
            year: "numeric",
          };
          const optionsTime: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          };

          const datePart = date.toLocaleDateString("en-US", optionsDate); // e.g., May 13, 2025
          const timePart = date.toLocaleTimeString("en-US", optionsTime); // e.g., 1:25:49 PM

          formattedDate = `${datePart}, ${timePart}`;
        }

        return (
          <span className="text-capitalize text-nowrap">{formattedDate}</span>
        );
      },
    },

    {
      Header: "End Time",
      Cell: ({ row }: { row: any }) => {
        const rawDate = row?.endTime;
        let formattedDate = "-";

        if (rawDate) {
          const date = new Date(rawDate);
          const optionsDate: Intl.DateTimeFormatOptions = {
            month: "long",
            day: "numeric",
            year: "numeric",
          };
          const optionsTime: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          };

          const datePart = date.toLocaleDateString("en-US", optionsDate); // e.g., May 13, 2025
          const timePart = date.toLocaleTimeString("en-US", optionsTime); // e.g., 1:25:49 PM

          formattedDate = `${datePart}, ${timePart}`;
        }

        return (
          <span className="text-capitalize text-nowrap">{formattedDate}</span>
        );
      },
    },

    {
      Header: "Duration",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.duration || "-"}</span>
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

  return (
    <>
      <div className="row d-flex align-items-center pt-3 px-2">
        <div
          className="col-12 col-lg-6 col-md-6 col-sm-12 fs-20 fw-600"
          style={{ color: "#404040" }}
        ></div>

        <div className="mb-0 d-flex justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-16 fw-600" style={{ color: "#404040" }}>Total Duration:</span>
            <span className="fs-16 fw-600" style={{ color: "#404040" }}>{totalDuration}</span>
          </div>
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"end"}
          />
        </div>

        
      </div>

      <div className="mt-2">
        <Table
          data={hostLiveBroadCastHistory}
          mapData={giftTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
        />
        <div className="mt-5">
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalLiveHistory}
          />
        </div>
      </div>
    </>
  );
};

LiveBroadCastHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default LiveBroadCastHistory;
