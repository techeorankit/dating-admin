import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getNewUsers } from "@/store/dashboardSlice";
import { RootStore } from "@/store/store"
import { baseURL } from "@/utils/config";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png"
import DashboardTable from "@/extra/DashboardTable";
import Image from "next/image";
import { useRouter } from "next/router";
import { copyId, getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png"
import PendingHostRequestShimmer from "@/component/Shimmer/PendingHostRequestShimmer";
import { MdContentCopy } from "react-icons/md";
import coin from "@/assets/images/coin.png";


const GetNewUser = (props: any) => {
    const { startDate, endDate } = props;
    const dispatch = useDispatch();
    const { newUsers } = useSelector((state: RootStore) => state.dashboard)
    const router = useRouter()

    useEffect(() => {

        const payload = {
            startDate,
            endDate
        }
        dispatch(getNewUsers(payload))
    }, [dispatch, startDate, endDate])




    const pendingHostRequest = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span> {index + 1}</span>
            ),
        },

        // {
        //     Header: "Unique Id",
        //     Cell: ({ row }: { row: any }) => (
        //         <span className="text-capitalize" style={{ fontWeight: "400" }}>{row?.uniqueId || "-"}</span>
        //     ),
        // },


        {
            Header: "User",
            body: "profilePic",
            Cell: ({ row }: { row: any }) => {
                const rawImagePath = row?.image || "";
                const normalizedImagePath = rawImagePath.replace(/\\/g, "/");

                const imageUrl = normalizedImagePath.includes("storage")
                    ? baseURL + normalizedImagePath
                    : normalizedImagePath;

                const handleClick = () => {
                    router.push({
                        pathname: "/User/UserInfoPage",
                        query: { id: row?._id },
                    });

                    typeof window !== "undefined" && localStorage.setItem("userData", JSON.stringify(row))

                }

                return (
                    <div style={{ cursor: "pointer" }}
                        onClick={handleClick}
                    >
                        <div className="d-flex px-2 py-1"

                        >
                            <div>
                                <img
                                    src={
                                        row?.image
                                            ? `${row.image}${row?.image?.includes('googleusercontent') ? '?s96' : ''}`
                                            : `/images/male.png`
                                    }
                                    alt="Image"
                                    loading="eager"
                                    draggable="false"
                                    style={{
                                        borderRadius: "50px",
                                        objectFit: "cover",
                                        height: "50px",
                                        width: "50px",
                                    }}
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = `/images/male.png`;
                                    }}
                                    height={70}
                                    width={70}
                                />
                            </div>
                            <div className="d-flex flex-column justify-content-center text-start ms-3">
                                <p className="mb-0  text-capitalize" style={{ fontSize: "14px", fontWeight: "500" }}>{row?.name || "-"}</p>
                                <div className="d-flex align-items-center">
                                    <p className="text-capitalize" style={{ fontWeight: "400", fontSize: "12px", color: "606060" }}>{row?.uniqueId || "-"}</p>
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
            }

        },



        {
            Header: "Email",
            Cell: ({ row }: { row: any }) => (
                <span
                    className="text-capitalize fw-normal"
                    style={{
                        maxWidth: "180px",
                        display: "inline-block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                    title={row?.email || "-"}
                >
                    {row?.email || "-"}
                </span>
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
                <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                    <img
                        src="/images/coin.webp"
                        alt="coin"
                        width={20}
                        height={20}
                        style={{ objectFit: "contain" }}
                    />
                    <span style={{ fontWeight: "400" }}>
                        {row?.coin || 0}
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
                title={"Recent Users"}
                data={newUsers}
                mapData={pendingHostRequest}
                shimmer={<PendingHostRequestShimmer />}

            />

        </div>
    )
}

export default GetNewUser