import React from 'react';
import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import Analytics from "@/extra/Analytic";
import { useRouter } from "next/router";
import { retrieveCoinPlanPurchase } from '@/store/coinPlanSlice';
import { getDefaultCurrency } from '@/store/settingSlice';
import CoinPlanTable from '@/component/Shimmer/CoinPlanTable';
import Searching from '@/extra/Searching';
import { formatCoins } from '@/utils/number';

const CoinHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { userPlanPurchaseHistory, totalUserPlanPurchaseHistory } = useSelector(
    (state: any) => state.coinPlan

  );
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting)

  const coinHistoryKey = useMemo(
    () => `plan-history:user-coin:${String(id ?? "")}`,
    [id]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: coinHistoryKey,
    defaultRowsPerPage: 10,
  });
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getDefaultCurrency())
  }, [dispatch])

  useEffect(() => {
    if (!id) return;

    const Id = Array.isArray(id) ? id[0] : id;
    const typeNumber = 7;

    const payload = {
      start: page,
      limit: rowsPerPage,
      userId: Id,
      type: typeNumber,
      search
    };

    dispatch(retrieveCoinPlanPurchase(payload));
  }, [dispatch, id, page, rowsPerPage, search]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalUserPlanPurchaseHistory);
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

  const coinHistoryTable = [
    { Header: "No", Cell: ({ index }: any) => <span>{(page - 1) * rowsPerPage + parseInt(index) + 1}</span> },
    { Header: "UniqueId", Cell: ({ row }: any) => <span>{row?.uniqueId}</span> },
    { Header: "Payment Gateway", Cell: ({ row }: any) => <span>{row?.paymentGateway || "-"}</span> },
    { Header: "Type", Cell: ({ row }: any) => <span>{planTypeLabel(row?.type)}</span> },
    { Header: `Price (${defaultCurrency?.currencySymbol || '$'})`, Cell: ({ row }: any) => <span>{formatCoins(row?.price)} {defaultCurrency?.currencySymbol || '$'}</span> },
    {
      Header: "Coin", Cell: ({ row }: any) =>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <img src="/images/coin.webp" alt="Coin" height={20} width={20} />
          <span className="text-capitalize fw-normal">
            {formatCoins(row?.coin)}
          </span>
        </div>
    },
    { Header: "Date", Cell: ({ row }: any) => <span>{row?.date || "-"}</span> },
  ];



  return (
    <>
      <div className="row d-flex align-items-center pt-3">
        <div className="col-12 col-lg-6 col-md-6 col-sm-12 fs-20 fw-600"
          style={{ color: "#404040" }}
        >
          Coin Plan  History
        </div>
        <div className="col-12 col-lg-6 col-md-6 col-sm-12 fs-20 fw-600"
          style={{ color: "#404040" }}
        >
          <Searching
            type={`server`}
            data={userPlanPurchaseHistory}
            setData={setData}
            column={coinHistoryTable}
            serverSearching={handleFilterData}
            placeholder={"Search by Payment Gateway/Unique ID"}
          />
        </div>
      </div>

      <div className="mt-2">
        <Table
          data={userPlanPurchaseHistory || []}
          mapData={coinHistoryTable}
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
          totalData={totalUserPlanPurchaseHistory}
        />
      </div>
    </>
  );
};

CoinHistory.getLayout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;

export default CoinHistory;
