import Button from "@/extra/Button";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { openDialog } from "@/store/dialogSlice";
import {
  deleteCurrency,
  getAllCurrency,
  setDefaultCurrency,
} from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CurrencyDialog from "./CurrencyDialog";
import image from "@/assets/images/bannerImage.png";
import Image from "next/image";
import CommonDialog from "@/utils/CommonDialog";
import CurrencySettingShimmer from "../Shimmer/CurrencySettingShimmer";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { isSkeleton } from "@/utils/allSelector";

const CurrencySetting = () => {
  const { currency } = useSelector((state: RootStore) => state.setting);
  const roleSkeleton = useSelector(isSkeleton);
  
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const dispatch = useAppDispatch();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const currencyList = Array.isArray(currency) ? currency : [];
  const [fetchSettled, setFetchSettled] = useState(false);
  const fetchCancelled = useRef(false);

  useEffect(() => {
    fetchCancelled.current = false;
    (async () => {
      try {
        await dispatch(getAllCurrency()).unwrap();
      } catch {
        /* keep empty list on error */
      } finally {
        if (!fetchCancelled.current) setFetchSettled(true);
      }
    })();
    return () => {
      fetchCancelled.current = true;
    };
  }, [dispatch]);

  const currencyTable = [
    {
      Header: "No",
      body: "name",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * size + index + 1}</span>
      ),
    },
    {
      Header: "Currency Name",
      body: "currencyName",
      Cell: ({ row, index }: { row: any; index: number }) => (
        <span className="text-capitalize">{row?.name}</span>
      ),
    },
    {
      Header: "Currency Symbol",
      body: "name",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.symbol}</span>
      ),
    },
    {
      Header: "Currency Code",
      body: "currencyCode",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.currencyCode}</span>
      ),
    },
    {
      Header: "Country Code",
      body: "countryCode",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.countryCode}</span>
      ),
    },
    {
      Header: "Default",
      body: "isDefault",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          onClick={() => {
            
            handleIsActive(row?._id);
          }}
          value={row?.isDefault}
        />
      ),
    },
    {
      Header: "Action",
      body: "action",
      Cell: ({ row }: { row: any }) => {
        const actions: TableActionIconAction[] = [
          {
            id: "edit",
            label: "Edit",
            icon: IconEdit,
            color: "#666666",
            onClick: () => {
              
              dispatch(openDialog({ type: "currency", data: row }));
            },
          },
          {
            id: "delete",
            label: "Delete",
            icon: IconTrash,
            color: "#EF4444",
            onClick: () => {
              
              handleDelete(row?._id);
            },
          },
        ];

        return (
          <div className="action-button" style={{ display: "flex", justifyContent: "center" }}>
            <TableActionIcons size={22} gap={8} actions={actions} />
          </div>
        );
      },
    },
  ];

  const handleIsActive = (id: any) => {
    

    dispatch(setDefaultCurrency(id));
  };

  const handleDelete = (id: any) => {
    

    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteCurrency(selectedId));
      setShowDialog(false);
    }
  };

  return (
    <>
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="userPage withdrawal-page p-0">
        <div className="payment-setting-box user-table mt-3">
          <div className="row align-items-center">
            <div
              className="col-12 col-sm-6 col-md-6 col-lg-6"
              style={{ marginBottom: "0px" }}
            >
              {/* <h5 className="mb-0">Currency</h5> */}
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-6 new-fake-btn d-flex justify-content-end mt-3 m-sm-0">
              <Button
                className={`bg-button p-10 text-white`}
                bIcon={`/images/bannerImage.png`}
                text="Add Currency"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "currency" }));
                }}
              />
            </div>
          </div>
          <div className="mt-3">
            {!fetchSettled ||
            roleSkeleton ||
            currencyList.length > 0 ? (
              <Table
                data={currencyList}
                mapData={currencyTable}
                type={"server"}
                shimmer={<CurrencySettingShimmer />}
              />
            ) : (
              <div
                className="empty-state d-flex justify-content-center align-items-center"
                style={{
                  minHeight: "240px",
                  border: "1px solid #eeeeee",
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div>
                  <p className="mb-0 fw-500" style={{ color: "#404040" }}>
                    No data found
                  </p>
                  <p
                    className="text-muted mt-2 mb-0"
                    style={{ fontSize: "14px" }}
                  >
                    Add a currency using the button above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {dialogueType === "currency" && <CurrencyDialog />}
    </>
  );
};

export default CurrencySetting;
