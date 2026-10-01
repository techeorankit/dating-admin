import { basePath } from "@/utils/config";
import React from "react";
import RootLayout from "@/component/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { getPlanPurchaseHistory } from "@/store/coinPlanSlice";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Title from "@/extra/Title";
import { getDefaultCurrency } from "@/store/settingSlice";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from "next/router";
import Table from "@/extra/Table";
import PlanPurchaseHistoryShimmer from "@/component/Shimmer/PlanPurchaseHistoryShimmer";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import CoinPlanShimmer from "@/component/Shimmer/CoinPlanShimmer";
import Searching from "@/extra/Searching";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import { usePermission } from "@/context/PermissionContext";

const PlanHistory = () => {
    const dispatch = useDispatch();
    const { planPurchaseHistory, totalPlanPurchaseHistory, adminEarning } = useSelector((state: RootStore) => state.coinPlan);

    const { defaultCurrency } = useSelector((state: RootStore) => state.setting)
    const [type, setType] = useState<string>("all"); // "coin", "vip" or "all"
    const planHistoryKey = useMemo(() => `plan-history:${type}`, [type]);
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: planHistoryKey,
        defaultRowsPerPage: 10,
    });
    const [startDate, setStartDate] = useState("All");
    const [endDate, setEndDate] = useState("All");
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [paymentGatewayFilter, setPaymentGatewayFilter] = useState<string>("all");
    const router = useRouter();
    const { canSee } = usePermission();

    useEffect(() => {
        const apiType = type === "coin" ? 7 : type === "vip" ? 8 : "all";

        const payload: any = {
            start: page,
            limit: rowsPerPage,
            startDate,
            endDate,
            type: apiType,
            search,
            paymentGateway: paymentGatewayFilter === "all" ? "" : paymentGatewayFilter,
        };
        dispatch(getPlanPurchaseHistory(payload));
    }, [dispatch, page, rowsPerPage, type, startDate, endDate, search, paymentGatewayFilter]);

    useEffect(() => {
        if (!canSee("Plan History")) {
            router.push("/not-authorized");
        }
    }, [canSee, router]);

    useEffect(() => {
        dispatch(getDefaultCurrency())
    }, [dispatch])

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

    const planPurchaseHistoryTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span>{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },
        {
            Header: "User",
            body: "profilePic",
            Cell: ({ row }: { row: any }) => {
                const user = row?.userDetails || {};
                const rawImagePath = user?.image || "";
                const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

                const imageUrl = normalizedImagePath.includes("storage")
                    ? baseURL + normalizedImagePath
                    : normalizedImagePath || getImageUrl(user?.image);

                return (
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex align-items-center justify-content-center px-2 py-1">
                            {/* Image */}
                            <div className="d-flex justify-content-center">
                                <img
                                    src={imageUrl || `${basePath}/images/male.png`}
                                    referrerPolicy="no-referrer"
                                    alt="Image"
                                    loading="eager"
                                    draggable="false"
                                    style={{
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        height: "50px",
                                        width: "50px",
                                    }}
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = `${basePath}/images/male.png`;
                                    }}
                                />
                            </div>

                            {/* Text */}
                            <div
                                className="d-flex flex-column justify-content-center align-items-start ms-3 text-nowrap "
                                style={{ width: "100px" }}
                            >
                                <p className="mb-0 text-sm text-capitalize maintext text-left" style={{ fontWeight: "500", fontSize: "14px" }}>
                                    {user?.name || "-"}
                                </p>
                                <div className="d-flex align-items-center">
                                    <p
                                        className="mb-0 text-capitalize  text-center" style={{ fontWeight: "400", fontSize: "12px" }}

                                    >
                                        {user?.uniqueId || "-"}
                                    </p>
                                    <button
                                        className="btn btn-sm p-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyId(user?.uniqueId);
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

                <div className="d-flex align-items-center justify-content-center">
                    <p
                        className="mb-0 text-capitalize  text-center"
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
            ),
        },
        {
            Header: `Price (${defaultCurrency?.currencySymbol || '$'})`,
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">
                    {formatCoins(row?.price)} {defaultCurrency?.currencySymbol || '$'}
                </span>
            ),
        },
        {
            Header: "Coins",
            Cell: ({ row }: { row: any }) => (
                <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                    <div style={{ width: "30px" }}>
                        <img src={`${basePath}/images/coin.webp`} height={20} width={20} alt="Coins" />
                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">
                            {formatCoins(row?.coin || 0)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            Header: "Bonus Coins",
            Cell: ({ row }: { row: any }) => (
                <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                    <div style={{ width: "30px" }}>
                        <img src={`${basePath}/images/coin.webp`} height={20} width={20} alt="Coins" />
                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">
                            {formatCoins(row?.bonusCoins || 0)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            Header: "Payment Gateway",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">
                    {row?.paymentGateway || "-"}
                </span>
            ),
        },
        {
            Header: "Type",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">
                    {planTypeLabel(row?.type)}
                </span>
            ),
        },
        {
            Header: "Date",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">
                    {row?.date || "-"}
                </span>
            ),
        },
    ];

    return (
        <>
            <Title name="Plan History" />
            <div className="d-flex align-items-center justify-content-end">

            </div>
            <div className="plan">
                <div className="my-2 expert_width">
                    <button
                        type="button"
                        className={`${type === "all" ? "activeBtn" : "disabledBtn"} ms-1`}
                        onClick={() => setType("all")}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={`${type === "coin" ? "activeBtn" : "disabledBtn"}`}
                        onClick={() => setType("coin")}
                    >
                        Coin Plan
                    </button>
                    <button
                        type="button"
                        className={`${type === "vip" ? "activeBtn" : "disabledBtn"} ms-1`}
                        onClick={() => setType("vip")}
                    >
                        Vip Plan
                    </button>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <div className="col-6">
                <Analytics
                    analyticsStartDate={startDate}
                    analyticsStartEnd={endDate}
                    analyticsStartDateSet={setStartDate}
                    analyticsStartEndSet={setEndDate}
                    direction={"start"}
                />
                </div>
                <div className="col-6 mt-3">
                    <Searching
                        type={`server`}
                        data={planPurchaseHistory}
                        setData={setData}
                        column={planPurchaseHistoryTable}
                        serverSearching={handleFilterData}
                        placeholder={"Search by User Name / Unique Id"}
                        filterOptions={[
                            { value: "all", label: "All" },
                            { value: "Stripe", label: "Stripe" },
                            { value: "RazorPay", label: "RazorPay" },
                            { value: "Paypal", label: "Paypal" },
                            { value: "Paystack", label: "Paystack" },
                            { value: "Cashfree", label: "Cashfree" },
                            { value: "In App Purchase", label: "In App Purchase" },
                            { value: "FlutterWave", label: "FlutterWave" },
                        ]}
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
                    mapData={planPurchaseHistoryTable}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"server"}
                    shimmer={<PlanPurchaseHistoryShimmer />}

                />
                <div style={{ padding: "25px 0px" }}>
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
            </div>
        </>
    );
};

PlanHistory.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};

export default PlanHistory;
