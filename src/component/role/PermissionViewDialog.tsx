import React, { useMemo } from "react";
import { Modal } from "@mui/material";
import Button from "@/extra/Button";

type RawPermission = {
  module?: string | null;
  actions?: string[] | null;
};

type PermissionActions = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

type PermissionRow = {
  module: string;
  actions: PermissionActions;
};

export interface PermissionViewDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subjectName?: string;
  permissions?: RawPermission[] | null;
}

const ACTION_LABELS: { key: keyof PermissionActions; label: string }[] = [
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

const buildPermissionRows = (
  raw: RawPermission[] | null | undefined
): PermissionRow[] => {
  if (!raw || raw.length === 0) return [];

  const map = new Map<string, PermissionActions>();

  raw.forEach((entry) => {
    const moduleName = (entry.module || "").trim();
    if (!moduleName) return;

    if (!map.has(moduleName)) {
      map.set(moduleName, {
        view: false,
        add: false,
        edit: false,
        delete: false,
      });
    }

    const current = map.get(moduleName)!;
    (entry.actions || []).forEach((action) => {
      if (!action) return;

      const lower = String(action).trim().toLowerCase();

      if (lower === "list" || lower === "view") {
        current.view = true;
        return;
      }

      if (lower === "create" || lower === "add") {
        current.add = true;
        return;
      }

      if (lower === "update" || lower === "edit") {
        current.edit = true;
        return;
      }

      if (lower === "delete") {
        current.delete = true;
      }
    });
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([module, actions]) => ({ module, actions }));
};

const renderBadge = (allowed: boolean, label: string) => {
  const activeColor = "#0F9D58";
  const inactiveColor = "#A0A0A0";
  const activeBackground = "#E6F7E9";
  const inactiveBackground = "#F5F5F5";

  return (
    <span
      className="px-2 py-1 rounded-pill text-capitalize"
      style={{
        backgroundColor: allowed ? activeBackground : inactiveBackground,
        color: allowed ? activeColor : inactiveColor,
        fontSize: "12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        minWidth: "90px",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "999px",
          backgroundColor: allowed ? activeColor : inactiveColor,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: 10,
        }}
      >
        {allowed ? "✓" : "✕"}
      </span>
      {label}
    </span>
  );
};

const PermissionViewDialog: React.FC<PermissionViewDialogProps> = ({
  open,
  onClose,
  title = "Role Permissions",
  subjectName,
  permissions,
}) => {
  const rows = useMemo(
    () => buildPermissionRows(permissions || []),
    [permissions]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="role-permissions-title"
      aria-describedby="role-permissions-description"
    >
      <div className="dialog">
        <div className="w-100">
          <div className="row justify-content-center">
            <div className="col-xl-7 col-md-10 col-11">
              <div className="mainDiaogBox">
                <div className="row justify-content-between align-items-center formHead">
                  <div className="col-8">
                    <h2
                      id="role-permissions-title"
                      className="text-theme fs-26 m0"
                    >
                      {title}
                    </h2>
                    {subjectName && (
                      <p className="m0 mt-1 text-muted">
                        For role:{" "}
                        <span className="text-capitalize fw-semibold">
                          {subjectName}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="col-4">
                    <div
                      className="closeButton"
                      onClick={onClose}
                      style={{ fontSize: "20px" }}
                    >
                      ✖
                    </div>
                  </div>
                </div>

                <div
                  id="role-permissions-description"
                  className="row formFooter mt-3"
                >
                  <div className="col-12">
                    {rows.length === 0 ? (
                      <p className="text-muted">
                        No permissions configured for this role yet.
                      </p>
                    ) : (
                      <div
                        className="table-responsive"
                        style={{ maxHeight: "60vh", overflowY: "auto" }}
                      >
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th style={{ minWidth: "220px" }}>Module</th>
                              {ACTION_LABELS.map(({ key, label }) => (
                                <th
                                  key={key}
                                  className="text-center text-nowrap"
                                  style={{ minWidth: "110px" }}
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.module}>
                                <td className="text-capitalize">
                                  <div className="fw-semibold">
                                    {row.module}
                                  </div>
                                  <div className="text-muted small">
                                    {row.module} permissions
                                  </div>
                                </td>
                                {ACTION_LABELS.map(({ key, label }) => (
                                  <td
                                    key={key}
                                    className="text-center align-middle"
                                  >
                                    {renderBadge(row.actions[key], label)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="col-12 text-end m0 mt-3">
                    <Button
                      className={`cancelButton text-light`}
                      text={`Close`}
                      type={`button`}
                      onClick={onClose}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionViewDialog;

