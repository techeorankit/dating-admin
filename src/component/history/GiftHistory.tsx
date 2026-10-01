import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Analytics from "@/extra/Analytic";
import { getGiftHistory } from "@/store/userSlice";
import { getHostGiftHistory } from "@/store/hostSlice";
import CoinPlanTable from "../Shimmer/CoinPlanTable";
import { formatCoins } from "@/utils/number";
import { formatDateTime } from "@/utils/date";
import { MdContentCopy } from "react-icons/md";
import { copyId } from "@/utils/Common";
import { getImageUrl } from "@/utils/getImageUrl";
import Searching from "@/extra/Searching";


const GiftHistory = (props: any) => {
    const { queryType } = props;
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector(
        (state: RootStore) => state.dialogue
    );
    const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null;
    const hostData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("hostData") || "null") : null;

    const { userGiftHistory, totalUserGiftHistory } = useSelector((state: RootStore) => state.user)
    const { hostGiftHistory, total } = useSelector((state: RootStore) => state.host)

    const paginationKey = useMemo(
        () => `gift-history:${queryType}`,
        [queryType]
    );
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: paginationKey,
        defaultRowsPerPage: 10,
    });
    const [startDate, setStartDate] = useState("All");
    const [endDate, setEndDate] = useState("All");
    const [search, setSearch] = useState("");
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            id: queryType === "host" ? hostData?._id : userData?._id,
            startDate,
            endDate,
            search,
        }

        if (queryType === "host") {
            dispatch(getHostGiftHistory(payload))
        } else if (queryType !== "host") {
            dispatch(getGiftHistory(payload))
        }
    }, [dispatch, page, rowsPerPage, startDate, endDate, queryType, search])

    const handleFilterData = (filteredData: any) => {
        setPage(1);
        if (typeof filteredData === "string") {
            setSearch(filteredData);
        } else {
            setData(filteredData);
        }
    };

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        const totalRows = queryType === "host" ? total : totalUserGiftHistory;
        changeRowsPerPage(parseInt(event, 10), totalRows);
    };


    const giftTable = [
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
                                    <p
                                        className="text-capitalize fw-normal mb-0"
                                        style={{ fontSize: "12px", color: "gray" }}
                                    >
                                        {queryType === "host" ? row?.senderUniqueId || "-" : row?.receiverUniqueId || "-"}
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
                            </div>
                        </div>
                    </div>
                );
            },



        },

        {
            Header: "UniqueId",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">{row?.uniqueId || "-"}</span>
            ),
        },

        {
            Header: "Description",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">{row?.typeDescription || "-"}</span>
            ),
        },


        queryType === "host"
            ? {
                Header: "User Coin",
                Cell: ({ row }: { row: any }) => (
                    <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
                        <img
                            src="/images/coin.webp"
                            alt="coin"
                            width={20}
                            height={20}
                            style={{ objectFit: "contain" }}
                        />
                        <span
                            className="text-capitalize fw-normal"
                            style={{ color: "red" }}
                        >
                            {`  - ${formatCoins(row?.userCoin)}` || 0}
                        </span>
                    </div>
                ),
            }
            : {
                Header: "User Coin",
                Cell: ({ row }: { row: any }) => (
                    <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
                        <img
                            src="/images/coin.webp"
                            alt="coin"
                            width={20}
                            height={20}
                            style={{ objectFit: "contain" }}
                        />
                        <span
                            className="text-capitalize fw-normal"
                            style={{ color: row?.isIncome ? "green" : "red" }}
                        >
                            {`${row?.isIncome ? "+" : "-"}  ${formatCoins(row?.userCoin)}` || 0}
                        </span>
                    </div>
                ),
            },
        queryType === "host" ?
            {
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
                                {isPositive ? `+${formatCoins(hostCoin)}` : formatCoins(hostCoin)}
                            </span>
                        </div>
                    );
                },
            } :

            {
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
                                {isPositive ? `+${formatCoins(hostCoin)}` : formatCoins(hostCoin)}
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
                    <span className="text-capitalize">{formatCoins(row?.adminCoin)}</span>
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
                    <span className="text-capitalize">{formatCoins(row?.agencyCoin)}</span>
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

    const giftTableData = queryType === "host" ? hostGiftHistory : userGiftHistory;

    return (
        <>
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
                        data={giftTableData}
                        setData={setData}
                        column={giftTable}
                        serverSearching={handleFilterData}
                        placeholder={"Search by User Name / Unique Id"}
                    />
                </div>

            </div>

            <div className="mt-2">
                <div style={{ marginBottom: "32px" }}>
                    <Table
                        data={giftTableData}
                        mapData={giftTable}
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
                    totalData={queryType === "host" ? total : totalUserGiftHistory}
                />
            </div>
        </>
    )
}

GiftHistory.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default GiftHistory;