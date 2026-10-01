import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { reqAccepted } from "@/utils/Alert";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import { getWithdrawalRequest } from "@/store/withdrawalSlice";
import Image from "next/image";
import male from "@/assets/images/male.png";
import { getDefaultCurrency } from "@/store/settingSlice";
import { Modal } from "@mui/material";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import coin from "@/assets/images/coin.png";
import WithdrawerShimmer from "../Shimmer/WithdrawerShimmer";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { formatDateTime } from "@/utils/date";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconInfoCircle } from "@tabler/icons-react";

const AcceptedWithrawRequest = (props: any) => {
  const { statusType, type, startDate, endDate, search } = props;
  const router = useRouter();
  const person =
    type == "user" ? 3 : type == "host" ? 2 : type == "agency" ? 1 : null;
  const status =
    statusType === "pending_Request"
      ? 1
      : statusType === "accepted_Request"
        ? 2
        : statusType === "declined_Request"
          ? 3
          : null;

  const { acceptedWithdrawal, totalAcceptedWithdrawal } = useSelector(
    (state: RootStore) => state.withdrawal
  );
  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  

  const dispatch = useAppDispatch();
  const [data, setData] = useState<any[]>([]);
  const paginationKey = useMemo(
    () => `withdraw:${statusType}:${type}`,
    [statusType, type]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: paginationKey,
    defaultRowsPerPage: 10,
  });
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();
  const [openReason, setOpenReason] = useState(false);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, []);

  useEffect(() => {
    const payload: any = {
      start: page,
      limit: rowsPerPage,
      search,
      startDate,
      endDate,
      person,
      status,
    };
    if (status && person && statusType && type) {
      dispatch(getWithdrawalRequest(payload));
    }
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalAcceptedWithdrawal);
  };

  const handleOpenInfo = (row: any) => {
    setOpenInfo(true);
    setInfodata(row);
  };

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  const handleCloseReason = () => {
    setOpenReason(false);
  };

  const withdrawAcceptedtable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },


    type === "agency"
      ? {
        Header: "Agency",
        accessor: "agency",
        Cell: ({ row }: { row: any }) => {
          const updatedImagePath = row?.agencyId?.image
            ? row.agencyId.image.replace(/\\/g, "/")
            : "";

          return (
            <div className="d-flex justify-content-center align-items-center">
              <div style={{ width: "100px", textAlign: "end" }}>
                <img
                  src={
                    getImageUrl(row?.agencyId?.image)
                  }
                  alt="Image"
                  width="60"
                  height="60"
                  style={{ borderRadius: "50px", objectFit: "cover" }}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/male.png`;
                  }}
                />
              </div>
              <div style={{ width: "200px", textAlign: "start" }}>
                <span className="text-capitalize ms-3 cursorPointer text-nowrap maintext" style={{ fontWeight: "500", fontSize: "14px" }}>
                  {row?.agencyId?.name || "-"}
                </span>
                <p className="text-capitalize ms-3 cursorPointer text-nowrap mb-0" style={{ fontWeight: "400", fontSize: "12px" }}>
                  {row?.agencyId?.agencyCode || "-"}
                </p>
              </div>
            </div>
          );
        },
      }
      : {
        Header: "Host",
        accessor: "host",
        Cell: ({ row }: { row: any }) => {
          // Define updatedImagePath before returning JSX
          const updatedImagePath = row?.hostId?.image
            ? row.hostId?.image.replace(/\\/g, "/")
            : "";

          const handleClick = () => {
            router.push({
              pathname: "/Host/HostInfoPage",
              query: { id: row?.hostId?._id },
            });
            typeof window !== "undefined" &&
              localStorage.setItem("hostData", JSON.stringify(row?.hostId));
          };

          return (
            <div
              className="d-flex justify-content-center align-items-center cursor-pointer"
              onClick={handleClick}
            >
              {/* Image Section */}
              <div style={{ width: "100px", textAlign: "end" }}>
                <img
                  src={
                    getImageUrl(row?.hostId?.image)
                  }
                  alt="Image"
                  width="60"
                  height="60"
                  style={{ borderRadius: "50px", objectFit: "cover" }} // Styling for better appearance
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/male.png`;
                  }}
                />
              </div>

              {/* Product Name */}
              <div style={{ width: "200px", textAlign: "start" }}>
                <span className="text-capitalize ms-3 cursorPointer text-nowrap maintext" style={{ fontWeight: "500", fontSize: "14px" }}>
                  {row?.hostId?.name || "-"}
                </span>
                <div className="d-flex align-items-center">
                  <p className="text-capitalize ms-3 cursorPointer text-nowrap" style={{ fontWeight: "400", fontSize: "12px" }}>
                    {row?.hostId?.uniqueId || "-"}
                  </p>
                  <button
                    className="btn btn-sm p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyId(row?.hostId?.uniqueId);
                    }}
                    style={{ fontSize: "10px", lineHeight: "1" }}
                    title="Copy Unique ID"
                  >
                    <MdContentCopy size={14} color="gray" />
                  </button>
                </div>
              </div>
            </div>
          );
        },
      },

    {
      Header: "UniqueId",
      Cell: ({ row }: { row: any }) => (
        <div className="d-flex align-items-center justify-content-center  ">
          <span className="text-capitalize cursor">{row?.uniqueId}</span>
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
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <div style={{ width: "30px" }}>
            <img src="/images/coin.webp" height={20} width={20} />
          </div>
          <div style={{ width: "50px", textAlign: "start" }}>
            <span className="text-capitalize fw-normal">{formatCoins(row?.coin)}</span>
          </div>
        </div>
      ),
    },

    {
      Header: `Amount (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => <span>{formatCoins(row?.amount)} {defaultCurrency?.symbol}</span>,
    },

    {
      Header: "Request Date",
      body: "requestDate",
      Cell: ({ row }: { row: any }) => (
        <span>
          {(() => {
            const raw = row?.requestDate;
            if (!raw) return "-";
            if (typeof raw !== "string") return String(raw);

            const rawTrimmed = raw.trim();

            // Backend can send either:
            // - "YYYY-MM-DD, HH:mm:ss" (comma-separated)
            // - "YYYY-MM-DD HH:mm:ss" or ISO strings (space or 'T')
            if (rawTrimmed.includes(",")) {
              const parts = rawTrimmed.split(",");
              const datePart = parts?.[0]?.trim();
              const timePart = parts.slice(1).join(",").trim();

              if (datePart && timePart) {
                const formatted = formatDateTime(`${datePart} ${timePart}`);
                return formatted !== "-" ? formatted : `${datePart} ${timePart}`;
              }

              return datePart || "-";
            }

            if (rawTrimmed.includes(":") || rawTrimmed.includes("T")) {
              return formatDateTime(rawTrimmed);
            }

            const d = new Date(
              rawTrimmed.includes("T") ? rawTrimmed : rawTrimmed.replace(" ", "T")
            );
            if (isNaN(d.getTime())) return rawTrimmed;

            return d.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          })()}
        </span>
      ),
    },

    {
      Header: "Process Date",
      body: "date",
      Cell: ({ row }: { row: any }) => (
        <span>
          {(row?.acceptOrDeclineDate) || "-"}
        </span>
      ),
    },

    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <TableActionIcons
          size={22}
          gap={8}
          actions={[
            {
              id: "info",
              label: "Info",
              title: "Info",
              icon: IconInfoCircle,
              color: "#666666",
              onClick: () => handleOpenInfo(row),
            },
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <div>
        {dialogueType == "reasondialog" && <ReasonDialog />}

        <div className="mt-2">
            <Table
              data={acceptedWithdrawal}
              mapData={withdrawAcceptedtable}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={<WithdrawerShimmer />}
            />
        </div>
        <div style={{ padding: "25px 0px" }}>
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalAcceptedWithdrawal}
          />
        </div>
      </div>

      <Modal
        open={openInfo}
        onClose={handleCloseReason}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="dialog">
          <div className="w-75">
            <div className="row justify-content-center">
              <div className="col-xl-5 col-md-8 col-11">
                <div className="mainDiaogBox">
                  <div className="row justify-content-between align-items-center formHead">
                    <div className="col-8">
                      <h2 className="text-theme m0">Payment Detail Info</h2>
                    </div>
                    <div className="col-4">
                      <div className="closeButton" onClick={handleCloseInfo}>
                        <i className="ri-close-line"></i>
                      </div>
                    </div>
                  </div>
                  <form style={{ padding: "15px", paddingTop: "0px" }}>
                    <div
                      className="row sound-add-box"
                      style={{ overflowX: "hidden" }}
                    >
                      <div className="col-12 mt-2">
                        <div className="col-12 mt-3 text-about">
                          <ExInput
                            type={"text"}
                            label={"Payment Gateway"}
                            name={"Payment Gateway"}
                            value={infoData?.paymentGateway}
                            newClass={`mt-3`}
                            readOnly
                          />
                        </div>

                        {infoData?.paymentDetails &&
                          Object.entries(infoData.paymentDetails).map(
                            ([key, value]: [string, any]) => {
                              return (
                                <div
                                  className="col-12 mt-1 text-about"
                                  key={key}
                                >
                                  <ExInput
                                    type="text"
                                    label={key || "-"}
                                    name="Payment Details"
                                    value={value || "-"}
                                    newClass="mt-3"
                                    readOnly
                                  />
                                </div>
                              );
                            }
                          )}
                      </div>
                      <div className="mt-3 d-flex justify-content-end">
                        {/* <Button
                          onClick={handleCloseInfo}
                          btnName={"Close"}
                          newClass={"close-model-btn"}
                        /> */}
                        <Button
                          className={`cancelButton text-white`}
                          text={`Close`}
                          type={`button`}
                          onClick={handleCloseInfo}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AcceptedWithrawRequest;
