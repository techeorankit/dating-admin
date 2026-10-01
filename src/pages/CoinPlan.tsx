import { basePath } from "@/utils/config";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import image from "@/assets/images/bannerImage.png";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Image from "next/image";
import { activeCoinPlan, deleteCoinPlan, getCoinPlan } from "@/store/coinPlanSlice";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { useRouter } from "next/router";
import { getDefaultCurrency } from "@/store/settingSlice";
import coin from "@/assets/images/coin.png";
import CommonDialog from "@/utils/CommonDialog";
import CoinPlanShimmer from "@/component/Shimmer/CoinPlanShimmer";
import InfoTooltip from "@/extra/InfoTooltip";
import { formatCoins } from "@/utils/number";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
    type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const CoinPlan = ({ type }: any) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector(
        (state: RootStore) => state.dialogue
    );
    const [showDialog, setShowDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const { defaultCurrency } = useSelector((state: RootStore) => state.setting)
    const { coinPlan, total } = useSelector((state: RootStore) => state.coinPlan)
    const coinPlanKey = useMemo(() => `coin-plan:${String(type)}`, [type]);
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: coinPlanKey,
        defaultRowsPerPage: 10,
    });

    const { can } = usePermission();

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage
        }
        if (type) {

            dispatch(getCoinPlan(payload))
        }
    }, [dispatch, page, rowsPerPage, type])

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        changeRowsPerPage(parseInt(event, 10), total);
    };

    useEffect(() => {
        dispatch(getDefaultCurrency())
    }, [dispatch])




    const confirmDelete = async () => {
        if (selectedId) {
            dispatch(deleteCoinPlan(selectedId));
            setShowDialog(false);
        }
    };
    const handleDelete = (id: any) => {

        setSelectedId(id);
        setShowDialog(true);
    };


    const showPlanActions = can("Plan", "Edit") || can("Plan", "Delete");

    const coinPlanTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },


        {
            Header: "Coin",
            Cell: ({ row }: { row: any }) => (

                <div
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
                >
                    <div style={{ width: "30px" }}>
                        <img
                            src={`${basePath}/images/coin.webp`}
                            height={20}
                            width={20}
                        />

                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">
                            {formatCoins(row?.coins)}
                        </span>
                    </div>
                </div>
            ),
        },

        {
            Header: (
                <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', gap: "5px" }}>
                    Bonus Coin
                    <InfoTooltip
                        title="VIP Exclusive"
                        content={[
                            {
                                label: "Bonus Coins",
                                description: "Only VIP users will receive Bonus Coins with their coin purchases."
                            }
                        ]}
                    />
                </div>
            ),
            Cell: ({ row }: { row: any }) => (
                <div className="d-flex align-items-center justify-content-center gap-2">
                    <img src={`${basePath}/images/coin.webp`} alt="Coin" height={20} width={20} />
                    <span className="text-capitalize fw-normal">{formatCoins(row?.bonusCoins)}</span>
                </div>
            ),
        },

        {
            Header: `Price (${defaultCurrency?.symbol})`,
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{formatCoins(row?.price)} {defaultCurrency?.symbol}</span>
            ),
        },

        {
            Header: "Product Id",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{row?.productId || "-"}</span>
            ),
        },

        ...(can("Plan", "Edit")
            ? [
                {
                    Header: "Active",
                    body: "isActive",
                    Cell: ({ row }: { row: any }) => (
                        <ToggleSwitch
                            value={row?.isActive}
                            onClick={() => {
                                const payload = { id: row?._id, type: "isActive" };
                                
                                dispatch(activeCoinPlan(payload));
                            }}
                        />
                    ),
                },
                {
                    Header: "Popular",
                    body: "IsPopular",
                    Cell: ({ row }: { row: any }) => (
                        <ToggleSwitch
                            value={row?.isFeatured}
                            onClick={() => {
                                const payload = { id: row?._id, type: "isFeatured" };
                                
                                dispatch(activeCoinPlan(payload));
                            }}
                        />
                    ),
                },
            ]
            : []),

        ...(showPlanActions
            ? [
                {
                    Header: "Action",
                    Cell: ({ row }: { row: any }) => {
                        const actions: Array<TableActionIconAction | undefined> = [
                            can("Plan", "Edit")
                                ? {
                                    id: "edit",
                                    label: "Edit",
                                    icon: IconEdit,
                                    color: "#666666",
                                    onClick: () => {
                                        dispatch(
                                            openDialog({ type: "coinplan", data: row })
                                        );
                                    },
                                }
                                : undefined,
                            can("Plan", "Delete")
                                ? {
                                    id: "delete",
                                    label: "Delete",
                                    icon: IconTrash,
                                    color: "#EF4444",
                                    onClick: () => handleDelete(row?._id),
                                }
                                : undefined,
                        ];

                        const filteredActions = actions.filter(
                            (action): action is TableActionIconAction =>
                                action !== undefined
                        );

                        return (
                            <div className="d-flex justify-content-center">
                                <TableActionIcons
                                    size={22}
                                    gap={8}
                                    actions={filteredActions}
                                />
                            </div>
                        );
                    },
                },
            ]
            : []),
    ];

    return (
        <>
            <CommonDialog
                open={showDialog}
                onCancel={() => setShowDialog(false)}
                onConfirm={confirmDelete}
                text={"Delete"}
            />
            {/* <div className="row">
                <div className="col-6 new-fake-btn d-flex justify-content-end align-items-center">
                    <div className="dashboardHeader primeHeader mb-3 p-0"></div>
                </div>
            </div> */}

            <div className="mt-2">
                <Table
                    data={coinPlan}
                    mapData={coinPlanTable}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"server"}
                    shimmer={<CoinPlanShimmer />}
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
        </>
    )
}

CoinPlan.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default CoinPlan;