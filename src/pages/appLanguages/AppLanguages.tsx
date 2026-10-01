"use client";
import { basePath } from "@/utils/config";

import LanguageDialog from "@/component/language/LanguageDialog";
import LanguageTranslationsDialog from "@/component/language/LanguageTranslationsDialog";
import UploadTranslationsCsvDialog from "@/component/language/UploadTranslationsCsvDialog";
import RootLayout from "@/component/layout/Layout";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Searching from "@/extra/Searching";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/TogggleSwitch";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import {
  deleteTheLanguage,
  getLanguages,
  toggleTheSwitch,
} from "@/store/languageSlice";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { getAuthToken, getAuthUid } from "@/utils/authToken";
import { baseURL, key } from "@/utils/config";
import CommonDialog from "@/utils/CommonDialog";
import { usePermission } from "@/context/PermissionContext";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatDateTime } from "@/utils/date";
import { getImageUrl } from "@/utils/getImageUrl";

const MODULE_NAME = "Language Management";

const AppLanguages = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { can, canSee } = usePermission();
  
  const { languages, total } = useSelector(
    (state: RootStore) => state.language
  );
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { page, setPage, rowsPerPage, changeRowsPerPage } =
    usePersistedPagination({
      storageKey: "app-languages",
      defaultRowsPerPage: 10,
    });

  const [search, setSearch] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);

  useEffect(() => {
    dispatch(
      getLanguages({
        start: page,
        limit: rowsPerPage,
        search: search.trim(),
      })
    );
  }, [dispatch, page, rowsPerPage, search]);

  const refreshList = useCallback(() => {
    dispatch(
      getLanguages({
        start: page,
        limit: rowsPerPage,
        search: search.trim(),
      })
    );
  }, [dispatch, page, rowsPerPage, search]);

  const handleFilterData = (value: any) => {
    setPage(1);
    if (typeof value === "string") {
      setSearch(value);
    }
  };

  useEffect(() => {
    if (!canSee(MODULE_NAME)) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  const handleChangePage = (_e: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), total);
  };

  const downloadCsv = async () => {
    
    try {
      const token = getAuthToken();
      const adminUid = getAuthUid() || sessionStorage.getItem("uid") || "";
      const res = await fetch(
        `${baseURL}api/admin/translation/downloadAllTranslationsCSV`,
        {
          method: "GET",
          headers: {
            key,
            Authorization: token ? `Bearer ${token}` : "",
            "x-admin-uid": adminUid,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translations-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // toast from fetch layer if any
    }
  };

  const handleToggle = (row: any, toggleType: 1 | 2) => {
    
    const code = row?.languageCode;
    if (!code) return;
    dispatch(
      toggleTheSwitch({
        languageCode: code,
        toggleType,
      })
    ).then((action: any) => {
      if (!action.error && action.payload?.status !== false) {
        refreshList();
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteCode) return;
    dispatch(deleteTheLanguage(deleteCode)).then((action: any) => {
      if (!action.error && action.payload?.status !== false) {
        setShowDelete(false);
        setDeleteCode(null);
        refreshList();
      }
    });
  };

  const errCount = (row: any) =>
    row?.errorCount ?? row?.errors ?? row?.translationErrors ?? 0;

  const table = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Icon",
      Cell: ({ row }: { row: any }) => (
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",


          }}
          className="d-flex align-items-center "
        >
          {row?.languageIcon ? (
            <img
              src={getImageUrl(row.languageIcon)}
              alt=""
              width={60}
              height={60}
              style={{ objectFit: "cover" }}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `${basePath}/images/male.png`;
              }}

            />
          ) : (
            <span className="d-flex align-items-center justify-content-center h-100 text-muted small">
              —
            </span>
          )}
        </div>
      ),
    },
    {
      Header: "Title",
      Cell: ({ row }: { row: any }) => (
        <span className="maintext" style={{ fontWeight: "500", fontSize: "14px" }}>{row?.languageTitle ?? "-"}</span>
      ),
    },
    {
      Header: "Code",
      Cell: ({ row }: { row: any }) => (
        <span className="text-uppercase">{row?.languageCode ?? "-"}</span>
      ),
    },
    {
      Header: "Localized Title",
      Cell: ({ row }: { row: any }) => (
        <span>{row?.localLanguageTitle ?? "-"}</span>
      ),
    },
    {
      Header: "Active",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={Boolean(row?.isActive)}
          onClick={() => handleToggle(row, 1)}
        />
      ),
    },
    {
      Header: "Default",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={Boolean(row?.isDefault)}
          onClick={() => handleToggle(row, 2)}
        />
      ),
    },
    {
      Header: "Errors",
      Cell: ({ row }: { row: any }) => {
        const n = errCount(row);
        return (
          <span >{n}</span>
        );
      },
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => (
        <span className="text-nowrap">{formatDateTime(row?.createdAt)}</span>
      ),
    },
    {
      Header: "Updated At",
      Cell: ({ row }: { row: any }) => (
        <span className="text-nowrap">{formatDateTime(row?.updatedAt)}</span>
      ),
    },
    ...(can(MODULE_NAME, "Edit") || can(MODULE_NAME, "Delete")
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => {
            const actions: Array<TableActionIconAction | undefined> = [
              {
                id: "translations",
                label: "Translations",
                title: "Translations",
                icon: IconInfoCircle,
                color: "#666666",
                onClick: () => {
                  
                  dispatch(
                    openDialog({
                      type: "languageTranslations",
                      data: row,
                    })
                  );
                },
              },
              can(MODULE_NAME, "Edit")
                ?

                {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  color: "#666666",
                  onClick: () => {
                    
                    dispatch(openDialog({ type: "language", data: row }));
                  },
                }
                : undefined,
              can(MODULE_NAME, "Delete")
                ? {
                  id: "delete",
                  label: "Delete",
                  icon: IconTrash,
                  color: "#EF4444",
                  onClick: () => {
                    
                    setDeleteCode(row?.languageCode);
                    setShowDelete(true);
                  },
                }
                : undefined,

            ];

            const filteredActions = actions.filter(
              (action): action is TableActionIconAction =>
                action !== undefined
            );

            return (
              <TableActionIcons
                size={22}
                gap={8}
                actions={filteredActions}
              />
            );
          },
        },
      ]
      : []),
  ];

  return (
    <>
      <CommonDialog
        open={showDelete}
        onCancel={() => {
          setShowDelete(false);
          setDeleteCode(null);
        }}
        onConfirm={confirmDelete}
        text="Delete"
      />
      {dialogue && dialogueType === "language" && (
        <LanguageDialog onSuccess={refreshList} />
      )}
      {dialogue && dialogueType === "uploadTranslationsCsv" && (
        <UploadTranslationsCsvDialog onSuccess={refreshList} />
      )}
      {dialogue && dialogueType === "languageTranslations" && (
        <LanguageTranslationsDialog />
      )}

      <div className="userTable">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Title name="App Languages" />
          <div className="betBox d-flex flex-wrap align-items-center justify-content-end gap-2">
            {can(MODULE_NAME, "Create") && (
              <>
                <Button
                  className="bg-button p-10 text-white m10-bottom text-nowrap"
                  text="Add Language"
                  bIcon={`${basePath}/images/bannerImage.png`}
                  onClick={() => {
                    
                    dispatch(openDialog({ type: "language" }));
                  }}
                />
                <Button
                  className="bg-button p-10 text-white m10-bottom text-nowrap"
                  text="Upload File"
                  bIcon={`${basePath}/images/bannerImage.png`}
                  onClick={() => {
                    
                    dispatch(openDialog({ type: "uploadTranslationsCsv" }));
                  }}
                />
              </>
            )}
            <Button
              className="bg-button p-10 text-white m10-bottom text-nowrap"
              text="Download File"
              bIcon={`${basePath}/images/bannerImage.png`}
              onClick={downloadCsv}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-2">
          <div />
          <div className="col-12 col-md-8 col-lg-5 col-xl-4 mt-2">
            <Searching
              type="server"
              data={languages}
              setData={() => { }}
              column={table}
              serverSearching={handleFilterData}
              placeholder="Search by language code..."
            />
          </div>
        </div>

        <div className="mt-2">
          <div style={{ maxHeight: "1000px", overflowY: "auto" }}>
            <Table
              style={{ width: "100%" }}
              data={languages}
              mapData={table}
              PerPage={rowsPerPage}
              Page={page}
              type="server"
              shimmer={<ImpressionShimmer />}
            />
          </div>
          <div style={{padding: "25px 0px"}}>
            <Pagination
              type="server"
              serverPage={page}
              setServerPage={setPage}
              serverPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalData={total}
            />
          </div>
        </div>
      </div>
    </>
  );
};

AppLanguages.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AppLanguages;
