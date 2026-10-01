import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import image from "@/assets/images/bannerImage.png";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Title from "@/extra/Title";
import { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Image from "next/image";
import { warning } from "@/utils/Alert";
import DocumentTypeDialog from "@/component/documentType/DocumentTypeDialog";
import { deleteDocumentType, getDocumentType } from "@/store/settingSlice";
import DailyCheckInRewardDialog from "@/component/dailyCheckInReward/DailyCheckInRewardDialog";
import { deleteDailyReward, getDailyCheckInReward } from "@/store/dailyCheckInRewardSlice";
import CommonDialog from "@/utils/CommonDialog";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";
import { formatCoins } from "@/utils/number";
import { usePermission } from "@/context/PermissionContext";
import { useRouter } from "next/router";
import TableActionIcons, {
    type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";


const DailyCheckInReward = () => {
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector(
        (state: RootStore) => state.dialogue
    );
    
    const { can, canSee } = usePermission();
    const { dailyReward, total } = useSelector((state: RootStore) => state.dailyReward)
    const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
        storageKey: "daily-check-in-reward",
        defaultRowsPerPage: 10,
    });
    const [selectedId, setSelectedId] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();

    useEffect(() => {

        dispatch(getDailyCheckInReward())
    }, [dispatch, page, rowsPerPage])

    useEffect(() => {
        if (!canSee("Daily CheckIn")) {
            router.push("/not-authorized");
        }
    }, [canSee, router]);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        changeRowsPerPage(parseInt(event, 10), total);
    };


    const confirmDelete = async () => {
        if (selectedId) {
            dispatch(deleteDailyReward(selectedId));
            setShowDialog(false);
        }
    };

    const handleDelete = (id: any) => {
        setSelectedId(id);
        setShowDialog(true);
    };

    const showDailyActions =
        can("Daily CheckIn", "Edit") || can("Daily CheckIn", "Delete");
    const canCreateDailyReward = can("Daily CheckIn", "Create");

    const documentTypeTable = [
        // {
        //     Header: "No",
        //     Cell: ({ index }: { index: any }) => (
        //         <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
        //     ),
        // },


        {
            Header: "Day",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">{row?.day || "-"}</span>
            ),
        },


        {
            Header: "Daily Reward Coin",
            Cell: ({ row }: { row: any }) => (
                <div className="d-flex align-items-center justify-content-center gap-2">
                    <img src="/images/coin.webp" alt="Coin" height={20} width={20} />
                    <span>{row?.dailyRewardCoin}</span>
                </div>
            ),
        },

        {
            Header: "Created At",
            Cell: ({ row }: { row: any }) => {
                const date = new Date(row?.createdAt);
                const formattedDate = isNaN(date.getTime())
                    ? "-"
                    : date.toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                    });
                return <span>{formattedDate}</span>;
            },
        },


        {
            Header: "Updated At",
            Cell: ({ row }: { row: any }) => {
                const date = new Date(row?.updatedAt);
                const formattedDate = isNaN(date.getTime())
                    ? "-"
                    : date.toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                    });
                return <span>{formattedDate}</span>;
            },
        },


        ...(showDailyActions
            ? [
                {
                    Header: "Action",
                    Cell: ({ row }: { row: any }) => {
                        const actions: Array<TableActionIconAction | undefined> = [
                            can("Daily CheckIn", "Edit")
                                ? {
                                    id: "edit",
                                    label: "Edit",
                                    icon: IconEdit,
                                    color: "#666666",
                                    onClick: () => {
                                        dispatch(
                                            openDialog({
                                                type: "dailycheckinreward",
                                                data: row,
                                            })
                                        );
                                    },
                                }
                                : undefined,
                            can("Daily CheckIn", "Delete")
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
            {dialogueType === "dailycheckinreward" && <DailyCheckInRewardDialog />}
            <CommonDialog
                open={showDialog}
                onCancel={() => setShowDialog(false)}
                onConfirm={confirmDelete}
                text={"Delete"}
            />
            <div className="userTable">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <Title name="Daily CheckIn Reward" />
                    <div className="betBox">
                        {canCreateDailyReward && (
                            <Button
                                className="bg-button p-10 text-white"
                                bIcon={`/images/bannerImage.png`}
                                text="Add Daily Reward"
                                onClick={() => {
                                    dispatch(openDialog({ type: "dailycheckinreward" }));
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="mt-2">
                    <Table
                        data={dailyReward}
                        mapData={documentTypeTable}
                        PerPage={rowsPerPage}
                        Page={page}
                        type={"server"}
                        shimmer={<ImpressionShimmer />}
                    />
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

DailyCheckInReward.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default DailyCheckInReward;