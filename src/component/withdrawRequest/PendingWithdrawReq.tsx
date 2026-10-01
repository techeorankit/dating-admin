import { basePath } from "@/utils/config";
import { closeDialog, openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import {
  acceptOrDeclineWithdrawRequestForAgency,
  getWithdrawalRequest,
} from "@/store/withdrawalSlice";
import { Box, Modal } from "@mui/material";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import Image from "next/image";
import male from "@/assets/images/male.png";
import { getDefaultCurrency } from "@/store/settingSlice";
import CommonDialog from "@/utils/CommonDialog";
import coin from "@/assets/images/coin.png";
import WithdrawerShimmer from "../Shimmer/WithdrawerShimmer";
import AgencyWithShimmer from "../Shimmer/AgencyWithShimmer";
import Agency from "@/pages/Agency";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { formatDateTime } from "@/utils/date";
import { copyId } from "@/utils/Common";
import { MdContentCopy } from "react-icons/md";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons from "@/component/common/TableActionIcons";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";

const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  backgroundColor: "background.paper",
  borderRadius: "13px",
  border: "1px solid #C9C9C9",
  boxShadow: "24px",
  padding: "19px",
};

const PendingWithdrawReq = (props: any) => {
  const { statusType, type, startDate, endDate, search } = props;
  const { can } = usePermission();
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

  const { withDrawal, totalWithdrawal } = useSelector(
    (state: RootStore) => state.withdrawal
  );
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);

  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const router = useRouter();
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

  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();
  const [openReason, setOpenReason] = useState(false);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);

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
    if (status && person && type) {
      dispatch(getWithdrawalRequest(payload));
    }
  }, [
    dispatch,
    page,
    rowsPerPage,
    search,
    person,
    status,
    startDate,
    endDate,
    type,
  ]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalWithdrawal);
  };

  const handleActionDeclined = (id: any) => {
    
    dispatch(openDialog({ type: "reasondialog", data: { _id: id } }));
  };

  const handleOpenInfo = (row: any) => {
    setOpenInfo(true);
    setInfodata(row);
  };

  const handleAcceptRequest = async () => {
    
    if (selectedId) {
      const payload = {
        requestId: selectedId?._id,
        agencyId: selectedId?.agencyId?._id,
        type: "approve",
      };
      dispatch(acceptOrDeclineWithdrawRequestForAgency(payload));
      setShowDialog(false);
    }
  };
  const handleActionAccept = (id: any) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const withdrawPendingTable = [
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
                    e.target.src = `${basePath}/images/male.png`;
                  }}
                />
              </div>
              <div style={{ width: "200px", textAlign: "start" }}>
                <span className="text-capitalize ms-3 cursorPointer maintext text-nowrap" style={{ fontWeight: "500", fontSize: "14px" }}>
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
          const updatedImagePath = row?.hostId?.image
            ? row.hostId.image.replace(/\\/g, "/")
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
              <div style={{ width: "100px", textAlign: "end" }}>
                <img
                  src={
                    getImageUrl(row?.hostId?.image)
                  }
                  alt="Image"
                  width="60"
                  height="60"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `${basePath}/images/male.png`;
                  }}
                  style={{ borderRadius: "50px", objectFit: "cover" }}
                />
              </div>
              <div style={{ width: "200px", textAlign: "start" }}>
                <p className="text-capitalize ms-3 cursorPointer text-nowrap maintext" style={{ fontWeight: "500", fontSize: "14px" }}>
                  {row?.hostId?.name || "-"}
                </p>
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
            <img src={`${basePath}/images/coin.webp`} height={20} width={20} />
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
      Cell: ({ row }: { row: any }) => (
        <span>
          {(row?.requestDate) || "-"}
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

    // ✅ Single column for both Accept and Decline buttons
    ...(type === "agency" && can("Withdrawal", "Edit")
      ? [
        {
          Header: "Actions",
          Cell: ({ row }: { row: any }) => (
            <TableActionIcons
              size={22}
              gap={8}
              actions={[
                {
                  id: "accept",
                  label: "Accept",
                  icon: IconCheck,
                  color: "#16a34a",
                  onClick: () => handleActionAccept(row),
                  title: "Accept",
                },
                {
                  id: "decline",
                  label: "Decline",
                  icon: IconX,
                  color: "#dc2626",
                  onClick: () => handleActionDeclined(row),
                  title: "Decline",
                },
              ]}
            />
          ),
        },
      ]
      : []),

  ].filter(Boolean); // ✅ This removes all `undefined` values

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  const handleCloseReason = () => {
    setOpenReason(false);
  };

  return (
    <>
      <div>
        {dialogueType == "reasondialog" && <ReasonDialog />}
        <CommonDialog
          open={showDialog}
          onCancel={() => setShowDialog(false)}
          onConfirm={handleAcceptRequest}
          text={"Accept"}
        />
        <div className="mt-2">
          <div>
            <Table
              data={withDrawal}
              mapData={withdrawPendingTable}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={type === "agency" ? <AgencyWithShimmer /> : <WithdrawerShimmer />}
            />
          </div>
        </div>
        <div style={{ padding: "25px 0px" }}>
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={totalWithdrawal}
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
                      <h2 className="text-theme m0">
                        Payment Detail Info
                      </h2>
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

export default PendingWithdrawReq;
