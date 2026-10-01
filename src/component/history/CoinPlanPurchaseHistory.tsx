import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Analytics from "@/extra/Analytic";
import { baseURL } from "@/utils/config";
import { getDefaultCurrency } from "@/store/settingSlice";
import CoinPlanTable from "../Shimmer/CoinPlanTable";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import { getPlanPurchaseHistory } from "@/store/coinPlanSlice";
import { formatCoins } from "@/utils/number";
import Searching from "@/extra/Searching";
import { getImageUrl } from "@/utils/getImageUrl";


const CoinPlanPurchaseHistory = () => {
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector(
        (state: RootStore) => state.dialogue
    );
    const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null;
    const { defaultCurrency } = useSelector((state: RootStore) => state.setting)
    const { planPurchaseHistory, totalPlanPurchaseHistory } = useSelector(
        (state: RootStore) => state.coinPlan
    );
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: "history:coin-plan-purchase",
        defaultRowsPerPage: 10,
    });
    const [startDate, setStartDate] = useState("All");
    const [endDate, setEndDate] = useState("All");
    const [search, setSearch] = useState<string>("");
    const [paymentGatewayFilter, setPaymentGatewayFilter] = useState<string>("all");
    const [data, setData] = useState<any[]>([]);


    useEffect(() => {
        dispatch(getDefaultCurrency())
    }, [dispatch])

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            userId: userData?._id,
            startDate,
            endDate,
            type: 7,
            search,
            paymentGateway: paymentGatewayFilter === "all" ? "" : paymentGatewayFilter,
        }
        dispatch(getPlanPurchaseHistory(payload))
    }, [dispatch, page, rowsPerPage, startDate, endDate, search, paymentGatewayFilter])

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        changeRowsPerPage(parseInt(event, 10), totalPlanPurchaseHistory);
    };

    const handleFilterData = (filteredData: any) => {
        setPage(1);
        if (typeof filteredData === "string") {
            setSearch(filteredData);
        } else {
            setData(filteredData);
        }
    };

    const planTypeLabel = (value: any) => {
        const t = Number(value);
        if (t === 7) return "Coin Plan";
        if (t === 8) return "Vip Plan";
        return "-";
    };

    const coinPlanTable = [
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
                const updatedImagePath = row?.image
                    ? row.image.replace(/\\/g, "/")
                    : "";

                return (
                    <div style={{ cursor: "pointer" }} >
                        <div className="d-flex px-2 py-1">
                            <div>
                                <img
                                    src={getImageUrl(row?.userDetails?.image) || "/images/male.png"}
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
                                    {row?.userDetails?.name || "-"}
                                </span>
                                <div className="d-flex align-items-center">
                                    <p
                                        className="text-capitalize fw-normal mb-0"
                                        style={{ fontSize: "12px", color: "gray" }}
                                    >
                                        {row?.userDetails?.uniqueId || "-"}
                                    </p>
                                    <button
                                        className="btn btn-sm p-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyId(row?.userDetails?.uniqueId);
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
                <div className="d-flex align-items-center">
                    <span className="text-capitalize" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row?.uniqueId || "-"}
                    </span>
                    <button
                        className="btn btn-sm p-1 ms-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            copyId(row?.uniqueId);
                        }}
                        style={{ fontSize: "10px", lineHeight: "1" }}
                        title="Copy Purchase Unique ID"
                    >
                        <MdContentCopy size={14} color="gray" />
                    </button>
                </div>
            ),
        },

        {
            Header: "Payment Gateway",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">{row?.paymentGateway || "-"}</span>
            ),
        },



        {
            Header: `Price (${defaultCurrency?.currencySymbol || "$"})`,
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">
                    {formatCoins(row?.price)} {defaultCurrency?.currencySymbol || "$"}
                </span>
            ),
        },

        {
            Header: "Coins",
            Cell: ({ row }: { row: any }) => (
                <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                    <div style={{ width: "30px" }}>
                        <img src="/images/coin.webp" height={20} width={20} alt="Coins" />
                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">{formatCoins(row?.coin || 0)}</span>
                    </div>
                </div>
            ),
        },

        {
            Header: "Bonus Coins",
            Cell: ({ row }: { row: any }) => (
                <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                    <div style={{ width: "30px" }}>
                        <img src="/images/coin.webp" height={20} width={20} alt="Coins" />
                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">{formatCoins(row?.bonusCoins || 0)}</span>
                    </div>
                </div>
            ),
        },

        {
            Header: "Date",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{row?.date || row?.createdAt || "-"}</span>
            ),
        },
    ];

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
                        data={planPurchaseHistory}
                        setData={setData}
                        column={coinPlanTable}
                        serverSearching={handleFilterData}
                        placeholder={"Search by User Name / Unique Id"}
                        // filterOptions={[
                        //     { value: "all", label: "All" },
                        //     { value: "Stripe", label: "Stripe" },
                        //     { value: "Razorpay", label: "Razorpay" },
                        //     { value: "Flutterwave", label: "Flutterwave" },
                        //     { value: "PayPal", label: "PayPal" },
                        //     { value: "Paystack", label: "Paystack" },
                        //     { value: "Cashfree", label: "Cashfree" },
                        //     { value: "In App Purchase", label: "In App Purchase" },
                        // ]}
                        filterValue={paymentGatewayFilter}
                        onFilterChange={(value: string) => {
                            setPaymentGatewayFilter(value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="mt-2">
                <Table
                    data={planPurchaseHistory}
                    mapData={coinPlanTable}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"server"}
                    shimmer={<CoinPlanTable />}

                />
                <Pagination
                    type={"server"}
                    serverPage={page}
                    setServerPage={setPage}
                    serverPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    totalData={totalPlanPurchaseHistory}
                />
            </div>
        </>
    )
}

CoinPlanPurchaseHistory.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default CoinPlanPurchaseHistory;