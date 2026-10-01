import { basePath } from "@/utils/config";
import RootLayout from "@/component/layout/Layout";
import RoleDialog from "@/component/role/RoleDialog";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/TogggleSwitch";
import Searching from "@/extra/Searching";
import Title from "@/extra/Title";
import { openDialog } from "@/store/dialogSlice";
import {
  Role,
  deleteRole,
  getRoles,
  toggleRoleState,
} from "@/store/roleSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import CommonDialog from "@/utils/CommonDialog";

import PermissionViewDialog from "@/component/role/PermissionViewDialog";
import React, { useEffect, useState } from "react";
import { usePersistedPagination } from "@/hooks/usePersistedPagination";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { usePermission } from "@/context/PermissionContext";
import { formatDateTime } from "@/utils/date";
import RoleShimmer from "@/component/Shimmer/RoleShimmer";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";

const RoleList = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { can, canSee } = usePermission();
  
  const { roles, total } = useSelector((state: RootStore) => state.role);

  const { page, setPage, rowsPerPage, changeRowsPerPage } = usePersistedPagination({
    storageKey: "role:list",
    defaultRowsPerPage: 10,
  });
  const [search, setSearch] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] =
    useState<boolean>(false);

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      search,
    };
    dispatch(getRoles(payload));
  }, [dispatch, page, rowsPerPage, search]);

  useEffect(() => {
    if (!canSee("Role")) {
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
      dispatch(deleteRole(selectedId));
      setShowDialog(false);
    }
  };

  const handleDelete = (id: string) => {
    
    setSelectedId(id);
    setShowDialog(true);
  };

  const showRoleActions =
    can("Role", "Edit") || can("Role", "Delete") || canSee("Role");

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionDialog(true);
  };

  const handleClosePermissions = () => {
    setShowPermissionDialog(false);
    setSelectedRole(null);
  };

  const columns = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span> {(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Role Name",
      Cell: ({ row }: { row: Role }) => (
        <span className="text-capitalize maintext" style={{ fontWeight: "500", fontSize: "14px" }}>{row?.name || "-"}</span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: Role }) => {
        return (
          <span className="text-nowrap">{formatDateTime(row?.createdAt)}</span>
        );
      },
    },
    {
      Header: "Updated At",
      Cell: ({ row }: { row: Role }) => {
        return (
          <span className="text-nowrap">{formatDateTime(row?.updatedAt)}</span>
        );
      },
    },
    {
      Header: "Active",
      body: "isActive",
      Cell: ({ row }: { row: Role }) => (
        <ToggleSwitch
          value={Boolean(row?.isActive)}
          onClick={() => {
            if (!row._id) return;
            dispatch(toggleRoleState(row._id));
          }}
        />
      ),
    },
    ...(showRoleActions
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: Role }) => (
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
                  can("Role", "Edit")
                    ? {
                      id: "edit",
                      label: "Edit",
                      icon: IconEdit,
                      color: "#666666",
                      onClick: () => {
                        if (
                          row?._id === "69a94a17b69f0f498a832c74"
                        )
                        dispatch(openDialog({ type: "role", data: row }));
                      },
                    }
                    : undefined,
                  can("Role", "Delete")
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
      {dialogueType === "role" && <RoleDialog />}
      <PermissionViewDialog
        open={showPermissionDialog}
        onClose={handleClosePermissions}
        subjectName={selectedRole?.name}
        permissions={selectedRole?.permissions}
      />
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />
      <div className="userTable">
        <div className="d-flex justify-content-between align-items-center">
          <Title name="Roles" />

          <div className="betBox">
            {can("Role", "Create") && (
              <Button
                className={`bg-button p-10 text-white`}
                bIcon={`${basePath}/images/bannerImage.png`}
                text="Create Role"
                onClick={() => {
                  
                  dispatch(openDialog({ type: "role" }));
                }}
              />
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-2">
          <div>

          </div>
          <div className="col-4 mt-2">
            <Searching
              type={"server"}
              data={roles}
              setData={() => { }}
              column={columns}
              serverSearching={handleFilterData}
              placeholder={"Search by Role Name"}
            />
          </div>
        </div>

        <div className="mt-2">
          <div style={{ maxHeight: "1000px", overflowY: "auto" }}>
            <Table
              data={roles}
              mapData={columns}
              PerPage={rowsPerPage}
              Page={page}
              type={"server"}
              shimmer={<RoleShimmer />}
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

RoleList.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default RoleList;

