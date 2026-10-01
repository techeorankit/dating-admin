import { basePath } from "@/utils/config";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import image from "@/assets/images/bannerImage.png";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import ImpressionDialog from "@/component/impression/ImpressionDialog";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useRef, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { deleteImpression, getImpression } from "@/store/impressionSlice";
import Image from "next/image";
import DocumentTypeDialog from "@/component/documentType/DocumentTypeDialog";
import { deleteDocumentType, getDocumentType } from "@/store/settingSlice";
import CommonDialog from "@/utils/CommonDialog";
import DocumentShimmer from "@/component/Shimmer/DocumentShimmer";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { isSkeleton } from "@/utils/allSelector";

const DocumentType = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { can } = usePermission();
  const { documentType, total } = useSelector(
    (state: RootStore) => state.setting
  );
  const roleSkeleton = useSelector(isSkeleton);
  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "settings:document-type",
    defaultRowsPerPage: 10,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const documentTypeList = Array.isArray(documentType) ? documentType : [];
  const [fetchSettled, setFetchSettled] = useState(false);
  const fetchCancelled = useRef(false);

  useEffect(() => {
    fetchCancelled.current = false;
    (async () => {
      try {
        await dispatch(getDocumentType()).unwrap();
      } catch {
        /* keep empty list on error */
      } finally {
        if (!fetchCancelled.current) setFetchSettled(true);
      }
    })();
    return () => {
      fetchCancelled.current = true;
    };
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    changeRowsPerPage(parseInt(event, 10), total);
  };

  const handleDelete = (id: any) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteDocumentType(selectedId));
      setShowDialog(false);
    }
  };

  const showDocumentActions =
    can("Setting", "Edit") || can("Setting", "Delete");

  const documentTypeTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Title",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.title || "-"}</span>
      ),
    },

    ...(showDocumentActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => {
            const actions: Array<TableActionIconAction | undefined> = [
              can("Setting", "Edit")
                ? {
                  id: "edit",
                  label: "Edit",
                  icon: IconEdit,
                  // color: "#0EA5E9",
                  onClick: () => {
                    
                    dispatch(openDialog({ type: "impression", data: row }));
                  },
                }
                : undefined,
              can("Setting", "Delete")
                ? {
                  id: "delete",
                  label: "Delete",
                  icon: IconTrash,
                  color: "#EF4444",
                  onClick: () => {
                    
                    handleDelete(row?._id);
                  },
                }
                : undefined,
            ];

            const filteredActions = actions.filter(
              (action): action is TableActionIconAction =>
                action !== undefined
            );

            return (
              <div
                className="action-button"
                style={{ display: "flex", justifyContent: "center" }}
              >
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
      {dialogueType === "impression" && <DocumentTypeDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div
        className="row d-flex align-items-center"
        style={{ marginBottom: "0px" }}
      >
        <div
          className="col-12 col-lg-6 col-md-6 col-sm-12 fs-20 fw-600"
          style={{ color: "#404040" }}
        >
          {/* Identity Proof */}
        </div>
        <div
          className="col-6 new-fake-btn d-flex justify-content-end align-items-center"
          style={{ marginBottom: "0px" }}
        >
          <div className="dashboardHeader primeHeader mb-3 p-0"></div>

          <div className="betBox">
            {can("Setting", "Create") && (
              <Button
                className={`bg-button p-10 text-white m10-bottom `}
                bIcon={`${basePath}/images/bannerImage.png`}
                text="Add Identity Proof"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "impression" }));
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        {!fetchSettled ||
        roleSkeleton ||
        documentTypeList.length > 0 ? (
          <>
            <Table
              data={documentTypeList}
              mapData={documentTypeTable}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={<DocumentShimmer />}
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
          </>
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
              <p className="text-muted mt-2 mb-0" style={{ fontSize: "14px" }}>
                Add an identity proof type using the button above.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

DocumentType.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default DocumentType;
