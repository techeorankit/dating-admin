import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getNewUsers, getTopPerformingHost } from "@/store/dashboardSlice";
import { RootStore } from "@/store/store"
import { baseURL } from "@/utils/config";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png"
import { getDefaultCurrency } from "@/store/settingSlice";
import DashboardTable from "@/extra/DashboardTable";
import Image from "next/image";
import { useRouter } from "next/router";
import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png"
import Performing from "@/component/Shimmer/Performing";
import { getImageUrl } from "@/utils/getImageUrl";
import { MdContentCopy } from "react-icons/md";
import coin from "@/assets/images/coin.png";

const TopPerformingHost = (props: any) => {
    const { startDate, endDate, type } = props;
    const dispatch = useDispatch();
    const { topPerformingHost } = useSelector((state: RootStore) => state.dashboard)
    const { defaultCurrency } = useSelector((state: RootStore) => state.setting)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const router = useRouter();


    useEffect(() => {
        if (startDate && endDate) {

            const payload = {
                startDate,
                endDate
            }
            dispatch(getTopPerformingHost(payload))

        }
    }, [dispatch, startDate, endDate])

    useEffect(() => {
        dispatch(getDefaultCurrency())
    }, [])


    const pendingHostRequest = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span> {index + 1}</span>
            ),
        },

        {
            Header: "Host",
            body: "profilePic",
            Cell: ({ row }: { row: any }) => {
                const rawImagePath = row?.image || "";
                const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

                const imageUrl = normalizedImagePath.includes("storage")
                    ? baseURL + normalizedImagePath
                    : normalizedImagePath;

                const handleClick = () => {
                    router.push({
                        pathname: "/Host/HostInfoPage",
                        query: { id: row?._id },
                    });
                }

                return (
                    <div style={{ cursor: "pointer" }}
                        onClick={handleClick}
                    >
                        <div className="d-flex px-2 py-1">
                            <div>
                                <img
                                    src={getImageUrl(row?.image)}
                                    alt="Image"
                                    loading="eager"
                                    draggable="false"
                                    style={{
                                        borderRadius: "50px",
                                        objectFit: "cover",
                                        height: "50px",
                                        width: "50px",
                                    }}
                                    height={70}
                                    width={70}
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = `/images/male.png`;
                                    }}
                                />
                            </div>
                            <div className="d-flex flex-column justify-content-center text-start ms-3">
                                <p className="mb-0  text-capitalize " style={{ fontWeight: "500", fontSize: "14px" }}>{row?.name || "-"}</p>
                                <div className="d-flex align-items-center">
                                    <p className="mb-0  text-capitalize " style={{ fontWeight: "400", fontSize: "12px" }}>{row?.uniqueId || "-"}</p>
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
                    </div>
                );
            },
        },


        {
            Header: "Agency",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize" style={{ fontWeight: "400" }}>{row?.agencyName || "-"}</span>
            ),
        },


        {
            Header: "Country",
            Cell: ({ row }: { row: any }) => {
                const countryName = row?.country || "-";
                const emoji = row?.countryFlagImage; // e.g., "🇮🇳"

                const countryCode = getCountryCodeFromEmoji(emoji); // "in"

                const flagImageUrl = countryCode
                    ? `https://flagcdn.com/w80/${countryCode}.png`
                    : null;

                return (
                    <div className="d-flex justify-content-end align-items-center gap-3">
                        {flagImageUrl && (
                            <div style={{ width: "70px" }}>
                                <img
                                    src={getImageUrl(flagImageUrl)}
                                    height={40}
                                    width={40}
                                    alt={`${countryName} Flag`}
                                    style={{
                                        objectFit: "cover",
                                        borderRadius: "50px",
                                        border: "1px solid #ccc",
                                    }}
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = `/images/india.png`;
                                    }}
                                />
                            </div>
                        )}
                        <div style={{ width: "200px", textAlign: "start" }}>
                            <span className="text-capitalize " style={{ marginLeft: "10px", fontWeight: "400" }}>
                                {countryName}
                            </span>
                        </div>
                    </div>
                );
            },
        },


        {
            Header: "Coin",
            Cell: ({ row }: { row: any }) => (
                <div className="d-flex justify-content-start align-items-center" style={{ gap: "6px" }}>
                    <img
                        src="/images/coin.webp"
                        alt="coin"
                        width={20}
                        height={20}
                        style={{ objectFit: "contain" }}
                    />
                    <span style={{ fontWeight: "400" }}>
                        {row?.coin?.toFixed(2) || 0}
                    </span>
                </div>
            ),
        },

        {
            Header: "Online",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize " style={{ fontWeight: "400" }}>{row?.isOnline ? "Yes" : "No"}</span>
            ),
        },

        {
            Header: "Date",
            Cell: ({ row }: { row: any }) => {
                const date = new Date(row?.createdAt);
                const formattedDateTime = isNaN(date.getTime())
                    ? "-"
                    : date.toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    });

                return <span className="text-nowrap text-normal">{formattedDateTime}</span>;
            },
        },
    ];

    return (
        <div className="mt-4">
            <DashboardTable
                title={"Top Performing Host"}
                data={topPerformingHost}
                mapData={pendingHostRequest}
                shimmer={<Performing />}

            />

        </div>
    )
}

export default TopPerformingHost