import Button from "@/extra/Button";
import { ExInput } from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import { getEligibleRoleList } from "@/store/roleSlice";
import {
  enlistSubAdmin,
  polishSubAdmin,
  trackSubAdmins,
} from "@/store/adminSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ErrorState {
  name: string;
  email: string;
  password: string;
  role: string;
}

const SubAdminDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { eligibleRoles } = useSelector((state: RootStore) => state.role);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialName, setInitialName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [initialRoleId, setInitialRoleId] = useState("");
  const [error, setError] = useState<ErrorState>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const isEdit = Boolean(dialogueData && dialogueData._id);

  useEffect(() => {
    dispatch(getEligibleRoleList());
  }, [dispatch]);

  useEffect(() => {
    if (dialogueData) {
      const safeName = dialogueData.name || "";
      const safeEmail = dialogueData.email || "";

      setName(safeName);
      setEmail(safeEmail);
      setPassword("");

      const currentRoleField = dialogueData.role;
      if (currentRoleField) {
        // Try to resolve existing value: it could be an ID string, a name string, or an object { _id, name, ... }
        let resolvedRoleId: string = "";
        
        if (typeof currentRoleField === "object" && currentRoleField._id) {
          resolvedRoleId = currentRoleField._id;
        } else if (typeof currentRoleField === "string") {
          resolvedRoleId = currentRoleField;
          
          // If it's a name instead of an ID, try to match it in eligibleRoles
          const matchById = eligibleRoles?.find(
            (r: any) => r._id === currentRoleField
          );
          if (!matchById) {
            const matchByName = eligibleRoles?.find(
              (r: any) => r.name === currentRoleField
            );
            if (matchByName && typeof matchByName._id === "string") {
              resolvedRoleId = matchByName._id;
            }
          }
        }
        
        setRoleId(resolvedRoleId);
        setInitialRoleId(resolvedRoleId);
      } else {
        setRoleId("");
        setInitialRoleId("");
      }
      setInitialName(safeName);
      setInitialEmail(safeEmail);
    } else {
      setName("");
      setEmail("");
      setRoleId("");
      setPassword("");
      setInitialName("");
      setInitialEmail("");
      setInitialRoleId("");
    }
  }, [dialogueData, eligibleRoles]);

  const hasChanges = (() => {
    if (!isEdit) return true;

    const trimmedName = name.trim();
    const trimmedInitialName = initialName.trim();
    if (trimmedName !== trimmedInitialName) return true;

    const trimmedEmail = email.trim();
    const trimmedInitialEmail = initialEmail.trim();
    if (trimmedEmail !== trimmedInitialEmail) return true;

    if (roleId !== initialRoleId) return true;

    if (password.trim()) return true;

    return false;
  })();

  const validate = () => {
    const newError: ErrorState = {
      name: "",
      email: "",
      password: "",
      role: "",
    };
    let isValid = true;

    if (!name.trim()) {
      newError.name = "Name is required";
      isValid = false;
    }
    if (!email.trim()) {
      newError.email = "Email is required";
      isValid = false;
    }
    if (!isEdit && !password.trim()) {
      newError.password = "Password is required";
      isValid = false;
    }
    if (!roleId) {
      newError.role = "Role is required";
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async () => {
                                                                                                                            
    
    if (isEdit && !hasChanges) return;
    if (isSubmitting) return;
    
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      if (isEdit) {
        const payload: any = {
          subAdminId: dialogueData._id, // id from trackSubAdmins row
        };

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const originalName = (dialogueData.name || "").trim();
        const originalEmail = (dialogueData.email || "").trim();

        // Only send changed fields
        if (trimmedName && trimmedName !== originalName) {
          payload.name = trimmedName;
        }
        if (trimmedEmail && trimmedEmail !== originalEmail) {
          payload.email = trimmedEmail;
        }

        // Only send roleId when user actually changed the role
        if (roleId && roleId !== initialRoleId) {
          payload.roleId = roleId;
        }

        if (password.trim()) {
          payload.password = password.trim();
        }

        await dispatch(polishSubAdmin(payload));
      } else {
        await dispatch(
          enlistSubAdmin({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            roleId,
          })
        );
      }

      // Refresh list so new/updated sub admin appears immediately
      await dispatch(
        trackSubAdmins({
          start: 1,
          limit: 10,
        })
      );

      dispatch(closeDialog());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog">
      <div style={{ width: "1100px" }}>
        <div className="row justify-content-center">
          <div className="col-xl-6 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme fs-26 m0">
                    {isEdit ? "Edit Staff" : "Create Staff"}
                  </h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
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
                    id="name"
                    name="name"
                    value={name}
                    label="Name"
                    placeholder="Enter name"
                    errorMessage={error.name}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setName(value);
                      setError((prev) => ({
                        ...prev,
                        name: value ? "" : "Name is required",
                      }));
                    }}
                  />
                </div>

                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    id="email"
                    name="email"
                    value={email}
                    label="Email"
                    placeholder="Enter email"
                    errorMessage={error.email}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      setEmail(value);
                      setError((prev) => ({
                        ...prev,
                        email: value ? "" : "Email is required",
                      }));
                    }}
                  />
                </div>

                {!isEdit && (
                  <div className="col-12 mb-3">
                    <ExInput
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      label="Password"
                      placeholder="Enter password"
                      errorMessage={error.password}
                      onChange={(e: any) => {
                        const value = e.target.value;
                        setPassword(value);
                        setError((prev) => ({
                          ...prev,
                          password: value ? "" : "Password is required",
                        }));
                      }}
                    />
                  </div>
                )}

                {isEdit && (
                  <div className="col-12 mb-3">
                    <ExInput
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      label="Password (optional)"
                      placeholder="Leave blank to keep current password"
                      errorMessage={error.password}
                      onChange={(e: any) => {
                        const value = e.target.value;
                        setPassword(value);
                        setError((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }}
                    />
                  </div>
                )}

                <div className="col-12 mb-3">
                  <div className="inputData">
                    <label htmlFor="role" className="">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="rounded-2"
                      value={roleId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoleId(value);
                        setError((prev) => ({
                          ...prev,
                          role: value ? "" : "Role is required",
                        }));
                      }}
                    >
                      <option value="">-- Select Role --</option>
                      {eligibleRoles?.map((role: any) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {error.role && (
                      <p className="errorMessage text-start">{error.role}</p>
                    )}
                  </div>
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
                    text={isSubmitting ? `Submitting...` : `Submit`}
                    onClick={handleSubmit}
                    disabled={isSubmitting || (isEdit && !hasChanges)}
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

export default SubAdminDialog;

