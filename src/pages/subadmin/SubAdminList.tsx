import RootLayout from "@/component/layout/Layout";
import SubAdminDialog from "@/component/subadmin/SubAdminDialog";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/TogggleSwitch";
import Searching from "@/extra/Searching";
import Title from "@/extra/Title";
import { openDialog } from "@/store/dialogSlice";
import {
  expungeSubAdmin,
  regulateSubAdminState,
  trackSubAdmins,
} from "@/store/adminSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import CommonDialog from "@/utils/CommonDialog";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import { usePermission } from "@/context/PermissionContext";
import PermissionViewDialog from "@/component/role/PermissionViewDialog";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import SubAdminShimmer from "@/component/Shimmer/SubAdminShimmer";

const SubAdminList = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { subAdmins, total } = useSelector(
    (state: RootStore) => state.admin.subAdmin
  );
  const { can, canSee } = usePermission();
  

  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "subadmin:list",
    defaultRowsPerPage: 10,
  });
  const [search, setSearch] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<any>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      search,
    };
    dispatch(trackSubAdmins(payload));
  }, [dispatch, page, rowsPerPage, search]);

  useEffect(() => {
    if (!canSee("Staff")) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  const handleChangePage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    const perPage = parseInt(value, 10);
    changeRowsPerPage(perPage, total);
  };

  const handleFilterData = (filteredData: any) => {
    setPage(1);
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    }
  };

  const confirmDelete = () => {
    if (selectedId) {
      dispatch(expungeSubAdmin(selectedId));
      setShowDialog(false);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const handleOpenPermissions = (subAdmin: any) => {
    setSelectedSubAdmin(subAdmin);
    setShowPermissionDialog(true);
  };

  const handleClosePermissions = () => {
    setShowPermissionDialog(false);
    setSelectedSubAdmin(null);
  };

  const showStaffActions =
    can("Staff", "Edit") || can("Staff", "Delete") || canSee("Staff");

  const columns = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize maintext" style={{ fontWeight: "500", fontSize: "14px" }}>{row?.name || "-"}</span>
      ),
    },
    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="text-lowercase">{row?.email || "-"}</span>
      ),
    },
    {
      Header: "Role",
      Cell: ({ row }: { row: any }) => {
        const roleField = row?.role;
        const roleName =
          typeof roleField === "string"
            ? roleField
            : roleField?.name || "-";
        return (
          <span className="text-capitalize">
            {roleName}
          </span>
        );
      },
    },
    {
      Header: "Last Login IP",
      Cell: ({ row }: { row: any }) => (
        <span className="text-lowercase">{row?.lastLoginIp || "-"}</span>
      ),
    },
    {
      Header: "Last Login At",
      Cell: ({ row }: { row: any }) => {
        if (!row?.lastLoginAt) {
          return <span className="text-nowrap">-</span>;
        }

        const date = new Date(row.lastLoginAt);
        const formattedDateTime = isNaN(date.getTime())
          ? "-"
          : date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

        return <span className="text-nowrap">{formattedDateTime}</span>;
      },
    },
    {
      Header: "Active",
      body: "isActive",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={Boolean(row?.isActive)}
          onClick={() => {
            if (!row._id) return;
            dispatch(regulateSubAdminState(row._id));
          }}
        />
      ),
    },
    ...(showStaffActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: any }) => (
            <div className="d-flex justify-content-center mx-auto">
              <TableActionIcons
                size={22}
                gap={8}
                actions={[
                  {
                    id: "permissions",
                    label: "Permissions",
                    title: "Permissions",
                    icon: IconInfoCircle,
                    color: "#666666",
                    onClick: () => handleOpenPermissions(row),
                  },
                  can("Staff", "Edit")
                    ? {
                      id: "edit",
                      label: "Edit",
                      icon: IconEdit,
                      color: "#666666",
                      onClick: () => {                        
                        dispatch(openDialog({ type: "subAdmin", data: row }));
                      },
                    }
                    : undefined,
                  can("Staff", "Delete")
                    ? {
                      id: "delete",
                      label: "Delete",
                      icon: IconTrash,
                      color: "#EF4444",
                      onClick: () => row._id && handleDelete(row._id),
                    }
                    : undefined,
                ].filter((action) => action !== undefined) as TableActionIconAction[]}
              />
            </div>
          ),
        },
      ]
      : []),
  ];

  return (
    <>
      {dialogueType === "subAdmin" && <SubAdminDialog />}
      <PermissionViewDialog
        open={showPermissionDialog}
        onClose={handleClosePermissions}
        subjectName={selectedSubAdmin?.role?.name || selectedSubAdmin?.role}
        permissions={selectedSubAdmin?.role?.permissions || []}
      />
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />
      <div className="userTable">
        <div className="d-flex justify-content-between align-items-center">
          <Title name="Sub Admin" />

          <div className="betBox">
            {can("Staff", "Create") && (
              <Button
                className={`bg-button p-10 text-white`}
                bIcon={`/images/bannerImage.png`}
                text="Create Sub Admin"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "subAdmin" }));
                }}
              />
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-2">

          <div></div>
          <div className="col-4 mt-2">
            <Searching
              type={"server"}
              data={subAdmins}
              setData={() => { }}
              column={columns}
              serverSearching={handleFilterData}
              placeholder={"Search by Name / Email"}
            />
          </div>
        </div>

        <div className="mt-2">
          <div style={{ maxHeight: "1000px", overflowY: "auto" }}>
            <Table
              data={subAdmins}
              mapData={columns}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={<SubAdminShimmer />}
            />
          </div>

          <div style={{padding: "25px 0px"}}>
            <Pagination
              type={"server"}
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

SubAdminList.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default SubAdminList;

