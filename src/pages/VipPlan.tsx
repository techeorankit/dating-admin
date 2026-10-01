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
import { warning } from "@/utils/Alert";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { useRouter } from "next/router";
import { activeVipPlan, deleteVipPlan, getVipPlan } from "@/store/vipPlanSlice";
import { getDefaultCurrency } from "@/store/settingSlice";
import coin from "@/assets/images/coin.png";
import CommonDialog from "@/utils/CommonDialog";
import VipPlanShimmer from "@/component/Shimmer/VipPlanShimmer";
import { formatCoins } from "@/utils/number";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
    type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";


const VipPlan = ({ type }: any) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector(
        (state: RootStore) => state.dialogue
    );
    const [showDialog, setShowDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    
    const { vipPlan, total } = useSelector((state: RootStore) => state.vipPlan)
    const vipPlanKey = useMemo(() => `vip-plan:${String(type)}`, [type]);
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: vipPlanKey,
        defaultRowsPerPage: 10,
    });
    const { defaultCurrency } = useSelector((state: RootStore) => state.setting)
    const { can } = usePermission();
    useEffect(() => {
        dispatch(getDefaultCurrency())
    }, [dispatch, type])

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage
        }
        if (type) {

            dispatch(getVipPlan(payload))
        }
    }, [dispatch, page, rowsPerPage, type])

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        changeRowsPerPage(parseInt(event, 10), total);
    };

    const confirmDelete = async () => {
        if (selectedId) {
            dispatch(deleteVipPlan(selectedId));
            setShowDialog(false);
        }
    };

    const handleDelete = (id: any) => {
        

        setSelectedId(id);
        setShowDialog(true);
    };



    const handleOpen = (row: any) => {
        router.push("/CoinPlanHistory");
        localStorage.setItem("coinPlanHistoryData", JSON.stringify(row));
    }

    const coinPlanTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },


        {
            Header: "Validity",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{row?.validity || 0}</span>
            ),
        },

        {
            Header: "Validity Type",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{row?.validityType || "-"}</span>
            ),
        },

        {
            Header: `Price (${defaultCurrency?.symbol})`,
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize fw-normal">{formatCoins(row?.price)} {defaultCurrency?.symbol}</span>
            ),
        },

        {
            Header: "Coin",
            Cell: ({ row }: { row: any }) => (

                <div
                    style={{ display: "flex", justifyContent: "center", gap: "10px" }}
                >
                    <div style={{ width: "30px" }}>
                        <img
                            src="/images/coin.webp"
                            height={20}
                            width={20}
                        />

                    </div>
                    <div style={{ width: "50px", textAlign: "start" }}>
                        <span className="text-capitalize fw-normal">
                            {formatCoins(row?.coin)}
                        </span>
                    </div>
                </div>
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
                                const id: any = row?._id;
                                
                                dispatch(activeVipPlan(id));
                            }}
                        />
                    ),
                },
            ]
            : []),
        ...(can("Plan", "Edit") || can("Plan", "Delete")
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
                                        dispatch(openDialog({ type: "vipPlan", data: row }));
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
                            <div className="action-button">
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
                    data={vipPlan}
                    mapData={coinPlanTable}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"server"}
                    shimmer={<VipPlanShimmer />}
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

VipPlan.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default VipPlan;