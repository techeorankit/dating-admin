import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Searching from "@/extra/Searching";
import { RootStore } from "@/store/store";
import { getUserFollowingList, clearUserFollowerList } from "@/store/userSlice";
import React, { useEffect, useMemo, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useDispatch, useSelector } from "react-redux";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatCoins } from "@/utils/number";

const UserFollowingList = () => {
  const { userFollowingList, totalFollowingList }: any = useSelector(
    (state: RootStore) => state.user
  );
  const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "null")
      : null;
  const followingKey = useMemo(
    () => `user:following:${String(userData?._id ?? "")}`,
    [userData?._id]
  );
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: followingKey,
    defaultRowsPerPage: 10,
  });

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userData?._id) return;
    dispatch(
      getUserFollowingList({
        userId: userData._id,
        start: page,
        limit: rowsPerPage,
        search: search.trim() || undefined,
      })
    );
  }, [userData?._id, page, rowsPerPage, search, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearUserFollowerList());
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
    changeRowsPerPage(parseInt(event, 10), totalFollowingList);
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Host",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        return (
          <div style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-center px-2 py-1">
              <div>
                <img
                  src={
                    getImageUrl(row?.followingId?.image)
                  }
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
                <b className="mb-0 text-sm text-capitalize fw-normal">
                  {row?.followingId?.name || "-"}
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
          {row?.followingId?.uniqueId || "-"}
        </span>
      ),
    },

    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.followingId?.country || "-";
        const flagValue = row?.followingId?.countryFlagImage;
        const countryCode = getCountryCodeFromEmoji(flagValue);

        return (
          <div className="d-flex justify-content-center align-items-center gap-3">
            {flagValue && (
              <div style={{ width: "70px", textAlign: "end" }}>
                {countryCode ? (
                  <img
                    src={`https://flagcdn.com/w80/${countryCode}.png`}
                    height={30}
                    width={40}
                    alt={`${countryName} Flag`}
                    style={{
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = `/images/india.png`;
                    }}
                  />
                ) : (
                  <img
                    src={`/images/india.png`}
                    height={30}
                    width={40}
                    alt={`${countryName} Flag`}
                    style={{
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                )}
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
              {formatCoins(row?.followingId?.coin)}
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
            data={userFollowingList}
            setData={() => {}}
            column={userTable}
            serverSearching={handleFilterData}
            placeholder="Search by Name / Unique Id"
          />
        </div>
      </div>
      <div className="mt-2">
        <Table
          data={userFollowingList}
          mapData={userTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"server"}
        />
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={totalFollowingList}
        />
      </div>
    </div>
  );
};

UserFollowingList.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default UserFollowingList;
