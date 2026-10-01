import Button from "@/extra/Button";
import { ExInput } from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import { Role, createRole, updateRole } from "@/store/roleSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { APP_MODULES } from "@/utils/permissionModules";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

type RoleDialogError = {
  name: string;
};

const ALL_ACTIONS = ["List", "Create", "Update", "Delete"];

const ACTION_LABELS: Record<string, string> = {
  List: "List",
  Create: "Create",
  Update: "Edit",
  Delete: "Delete",
};

const MODULE_SECTIONS: {
  id: string;
  title: string;
  modules: string[];
}[] = [
    {
      id: "general",
      title: "GENERAL",
      modules: ["User"],
    },
    {
      id: "host-agency",
      title: "HOST & AGENCY",
      modules: ["Agency", "Host", "Host Request", "Host Tags"],
    },
    {
      id: "gift-rewards",
      title: "GIFT & REWARDS",
      modules: ["Gift Category", "Gift", "Daily CheckIn"],
    },
    {
      id: "packages",
      title: "PACKAGES",
      modules: ["Plan", "Vip Plan Benefits", "Plan History"],
    },
    {
      id: "finance",
      title: "FINANCE",
      modules: ["Withdrawal"],
    },
    {
      id: "app-language-management",
      title: "APP LANGUAGE MANAGEMENT",
      modules: ["App Languages"],
    },
    {
      id: "reports-issues",
      title: "REPORTS & ISSUES",
      modules: ["Report Reason", "Report"],
    },
  ];

const RoleDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { roles } = useSelector((state: RootStore) => state.role);

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Role["permissions"]>([]);
  const [initialName, setInitialName] = useState("");
  const [initialPermissions, setInitialPermissions] = useState<
    Role["permissions"]
  >([]);
  const [error, setError] = useState<RoleDialogError>({ name: "" });

  const isEdit = Boolean(dialogueData && (dialogueData as Role)?._id);

  useEffect(() => {
    if (dialogueData) {
      const role = dialogueData as Role;
      const safeName = role.name || "";
      const safePermissions = role.permissions || [];

      setName(safeName);
      setPermissions(safePermissions);
      setInitialName(safeName);
      setInitialPermissions(safePermissions);
    } else {
      setName("");
      setPermissions([]);
      setInitialName("");
      setInitialPermissions([]);
    }
  }, [dialogueData]);

  const availableModules = useMemo(() => {
    const modules = new Set<string>();

    // Base modules from centralized sidebar/module config
    APP_MODULES.forEach((m) => modules.add(m));

    // Also include any modules that already exist on roles/permissions
    roles?.forEach((r) => {
      r.permissions?.forEach((p) => {
        if (p.module) modules.add(p.module);
      });
    });

    permissions?.forEach((p) => {
      if (p.module) modules.add(p.module);
    });

    return Array.from(modules).sort((a, b) => a.localeCompare(b));
  }, [roles, permissions]);

  const isActionChecked = (module: string, action: string) => {
    const entry = permissions.find((p) => p.module === module);
    return entry?.actions?.includes(action) ?? false;
  };

  const isModuleAllChecked = (module: string) =>
    ALL_ACTIONS.every((action) => isActionChecked(module, action));

  const toggleAction = (module: string, action: string) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.module === module);
      if (!existing) {
        return [...prev, { module, actions: [action] }];
      }

      const hasAction = existing.actions.includes(action);
      const updatedActions = hasAction
        ? existing.actions.filter((a) => a !== action)
        : [...existing.actions, action];

      if (updatedActions.length === 0) {
        return prev.filter((p) => p.module !== module);
      }

      return prev.map((p) =>
        p.module === module ? { ...p, actions: updatedActions } : p
      );
    });
  };

  const toggleModuleAll = (module: string) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.module === module);
      const hasAll =
        existing &&
        ALL_ACTIONS.every((action) => existing.actions.includes(action));

      if (hasAll && existing) {
        const remaining = existing.actions.filter(
          (a) => !ALL_ACTIONS.includes(a)
        );

        if (remaining.length === 0) {
          return prev.filter((p) => p.module !== module);
        }

        return prev.map((p) =>
          p.module === module ? { ...p, actions: remaining } : p
        );
      }

      const nextActions = Array.from(
        new Set([...(existing?.actions || []), ...ALL_ACTIONS])
      );

      if (existing) {
        return prev.map((p) =>
          p.module === module ? { ...p, actions: nextActions } : p
        );
      }

      return [...prev, { module, actions: [...ALL_ACTIONS] }];
    });
  };

  const getSectionModules = (sectionId: string, modules: string[]) => {
    const sectionConfig = MODULE_SECTIONS.find((s) => s.id === sectionId);
    if (!sectionConfig) return [];
    const sectionSet = new Set(sectionConfig.modules);
    return modules.filter((m) => sectionSet.has(m));
  };

  const getUnsectionedModules = (modules: string[]) => {
    const mapped = new Set(
      MODULE_SECTIONS.flatMap((s) => s.modules)
    );
    return modules.filter((m) => !mapped.has(m));
  };

  const isSectionAllChecked = (sectionModules: string[]) => {
    if (sectionModules.length === 0) return false;
    return sectionModules.every((m) => isModuleAllChecked(m));
  };

  const toggleSectionAll = (sectionModules: string[]) => {
    if (sectionModules.length === 0) return;

    setPermissions((prev) => {
      let next = [...prev];

      const sectionHasAll = sectionModules.every((module) => {
        const entry = next.find((p) => p.module === module);
        return (
          entry && ALL_ACTIONS.every((action) => entry.actions.includes(action))
        );
      });

      sectionModules.forEach((module) => {
        const existing = next.find((p) => p.module === module);

        if (sectionHasAll && existing) {
          const remaining = existing.actions.filter(
            (a) => !ALL_ACTIONS.includes(a)
          );
          if (remaining.length === 0) {
            next = next.filter((p) => p.module !== module);
          } else {
            next = next.map((p) =>
              p.module === module ? { ...p, actions: remaining } : p
            );
          }
        } else {
          const merged = Array.from(
            new Set([...(existing?.actions || []), ...ALL_ACTIONS])
          );
          if (existing) {
            next = next.map((p) =>
              p.module === module ? { ...p, actions: merged } : p
            );
          } else {
            next.push({ module, actions: [...ALL_ACTIONS] });
          }
        }
      });

      return next;
    });
  };

  const hasChanges = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedInitialName = initialName.trim();

    if (trimmedName !== trimmedInitialName) return true;

    const currentPerms = permissions || [];
    const originalPerms = initialPermissions || [];

    if (currentPerms.length !== originalPerms.length) return true;

    const serialize = (perms: Role["permissions"]) =>
      JSON.stringify(
        [...perms].map((p) => ({
          module: p.module,
          actions: [...(p.actions || [])].sort(),
        })).sort((a, b) =>
          a.module.localeCompare(b.module)
        )
      );

    return serialize(currentPerms) !== serialize(originalPerms);
  }, [name, initialName, permissions, initialPermissions]);

  const handleSubmit = () => {
    if (isEdit && !hasChanges) return;
    

    if (!name.trim()) {
      setError({ name: "Role name is required" });
      return;
    }

    const cleanedPermissions = permissions.filter(
      (p) => p.module && p.actions && p.actions.length > 0
    );

    const payload = {
      name: name.trim(),
      permissions: cleanedPermissions,
    };

    if (isEdit) {
      const roleId = (dialogueData as Role)._id!;
      dispatch(updateRole({ roleId, ...payload }));
    } else {
      dispatch(createRole(payload));
    }

    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div style={{ width: "1100px" }}>
        <div className="row justify-content-center">
          <div className="col-xl-10 col-md-10 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme fs-26 m0">
                    {isEdit ? "Edit Role" : "Create Role"}
                  </h2>
                </div>

                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => dispatch(closeDialog())}
                    style={{ fontSize: "20px" }}
                  >
                    ✖
                  </div>
                </div>
              </div>

              <div className="row formFooter mt-3">
                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    id="roleName"
                    name="roleName"
                    value={name}
                    label="Role Name"
                    placeholder="Enter role name"
                    errorMessage={error.name}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setName(value);
                      if (!value) {
                        setError({ name: "Role name is required" });
                      } else {
                        setError({ name: "" });
                      }
                    }}
                  />
                </div>

                <div className="col-12">


                  {availableModules.length === 0 ? (
                    <p className="text-muted">
                      No modules detected yet. Once roles exist with
                      permissions, modules will appear here automatically.
                    </p>
                  ) : (
                    <>
                      {MODULE_SECTIONS.map((section) => {
                        const sectionModules = getSectionModules(
                          section.id,
                          availableModules
                        );
                        if (sectionModules.length === 0) return null;

                        const sectionAll = isSectionAllChecked(sectionModules);

                        return (
                          <div className="mb-4" key={section.id}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <h6 className="mb-0">{section.title}</h6>

                              </div>
                              <div className="form-check d-flex align-items-center ">
                                <input
                                  className="form-check-input me-2 mb-2"
                                  type="checkbox"
                                  id={`section-${section.id}-all`}
                                  checked={sectionAll}
                                  onChange={() =>
                                    toggleSectionAll(sectionModules)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`section-${section.id}-all`}
                                >
                                  Grant all in section
                                </label>
                              </div>
                            </div>

                            <div className="table-responsive">
                              <table className="table align-middle">
                                <thead>
                                  <tr>
                                    <th style={{ minWidth: "220px" }}>
                                      Module
                                    </th>
                                    <th className="text-center">All</th>
                                    {ALL_ACTIONS.map((action) => (
                                      <th
                                        key={action}
                                        className="text-center text-capitalize"
                                      >
                                        {ACTION_LABELS[action] || action}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sectionModules.map((module) => {
                                    const moduleAll = isModuleAllChecked(
                                      module
                                    );

                                    return (
                                      <tr key={module}>
                                        <td className="text-capitalize">
                                          <div className="fw-semibold">
                                            {module}
                                          </div>
                                          <div className="text-muted small">
                                            {module} management
                                          </div>
                                        </td>
                                        <td className="text-center">
                                          <input
                                            type="checkbox"
                                            checked={moduleAll}
                                            onChange={() =>
                                              toggleModuleAll(module)
                                            }
                                          />
                                        </td>
                                        {ALL_ACTIONS.map((action) => (
                                          <td
                                            key={action}
                                            className="text-center"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isActionChecked(
                                                module,
                                                action
                                              )}
                                              onChange={() =>
                                                toggleAction(module, action)
                                              }
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}

                    </>
                  )}
                </div>

                <div className="col-12 text-end m0 mt-3">
                  <Button
                    className={`cancelButton text-light`}
                    text={`Cancel`}
                    type={`button`}
                    onClick={() => dispatch(closeDialog())}
                  />
                  <Button
                    type={`submit`}
                    className={` text-white m10-left submitButton`}
                    text={`Submit`}
                    onClick={handleSubmit}
                    disabled={isEdit && !hasChanges}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDialog;

