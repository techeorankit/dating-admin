import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Searching from "@/extra/Searching";
import { RootStore } from "@/store/store";
import React, { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import FollowerlistShimmer from "@/component/Shimmer/FollowerlistShimmer";
import { useRouter } from "next/router";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";
import { getUserBlockList, clearUserBlockList } from "@/store/hostSlice";

const UserBlock = () => {
  const { userBlockList, totalUserBlockList } = useSelector(
    (state: RootStore) => state.host
  );
  const router = useRouter();
  const id: any = router?.query?.id;
  const userBlockKey = useMemo(
    () => `host:user-block:${String(id ?? "")}`,
    [id]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: userBlockKey,
    defaultRowsPerPage: 10,
  });

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    dispatch(
      getUserBlockList({
        hostId: id,
        start: page,
        limit: rowsPerPage,
        search: search.trim() || undefined,
      })
    );
  }, [id, page, rowsPerPage, search, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearUserBlockList());
    };
  }, [dispatch]);

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    }
  };

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), totalUserBlockList);
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "User",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        return (
          <div style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-center px-2 py-1">
              <div>
                <img
                  src={getImageUrl(row?.hostId?.image) || "/images/male.png"}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/male.png`;
                  }}
                  alt="Image"
                  loading="eager"
                  draggable="false"
                  style={{
                    borderRadius: "10px",
                    objectFit: "cover",
                    height: "50px",
                    width: "50px",
                  }}
                  height={70}
                  width={70}
                />
              </div>
              <div className="d-flex flex-column justify-content-center text-start ms-3">
                <b className="mb-0 text-sm text-capitalize">
                  {row?.hostId?.name || "-"}
                </b>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize fw-normal">
          {row?.hostId?.uniqueId || "-"}
        </span>
      ),
    },

    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.country || "-";
        const emoji = row?.countryFlagImage;

        const countryCode = getCountryCodeFromEmoji(emoji);

        const flagImageUrl = countryCode
          ? `https://flagcdn.com/w80/${countryCode}.png`
          : null;

        return (
          <div className="d-flex justify-content-end align-items-center gap-3">
            {flagImageUrl && (
              <div style={{ width: "70px", textAlign: "end" }}>
                <img
                  src={getImageUrl(flagImageUrl)}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `/images/india.png`;
                  }}
                  height={40}
                  width={40}
                  alt={`${countryName} Flag`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
            <div style={{ width: "100px", textAlign: "start" }}>
              <span className="text-capitalize text-nowrap">{countryName}</span>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <div style={{ width: "30px" }}>
            <img src="/images/coin.webp" height={20} width={20} />
          </div>
          <div style={{ width: "50px", textAlign: "start" }}>
            <span className="text-capitalize fw-bold">
              {formatCoins(row?.hostId?.coin)}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end align-items-center flex-wrap gap-3 mt-3 mb-2">
        <div className="col-4">
          <Searching
            type="server"
            data={userBlockList}
            setData={() => {}}
            column={userTable}
            serverSearching={handleFilterData}
            placeholder="Search by Name / Unique Id"
          />
        </div>
      </div>
      <div className="mt-2">
        <Table
          data={userBlockList}
          mapData={userTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
          shimmer={<FollowerlistShimmer />}
        />
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={totalUserBlockList}
        />
      </div>
    </div>
  );
};

UserBlock.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default UserBlock;
