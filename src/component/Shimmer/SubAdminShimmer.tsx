import React from "react";
import "../../assets/scss/Shimmer/SubAdminShimmer.css";

const SubAdminShimmer = () => {
  return (
    <>
      <thead>
        <tr style={{ height: "50px" }}>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <tr key={i} style={{ height: "60px" }}>
              {/* No */}
              <td style={{ paddingLeft: "25px" }}>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "20px", height: "12px" }}
                ></div>
              </td>

              {/* Name */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "100px", height: "14px" }}
                ></div>
              </td>

              {/* Email */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "150px", height: "12px" }}
                ></div>
              </td>

              {/* Role */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "80px", height: "12px" }}
                ></div>
              </td>

              {/* Last Login IP */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "90px", height: "12px" }}
                ></div>
              </td>

              {/* Last Login At */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "110px", height: "12px" }}
                ></div>
              </td>

              {/* Active Toggle */}
              <td>
                <div
                  className="skeleton"
                  style={{
                    width: "40px",
                    height: "20px",
                    borderRadius: "10px",
                  }}
                ></div>
              </td>

              {/* Action (Permissions, Edit, Delete) */}
              <td>
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <div
                    className="skeleton skeleton-circle"
                    style={{ width: "22px", height: "22px" }}
                  ></div>
                  <div
                    className="skeleton skeleton-icon"
                    style={{ width: "22px", height: "22px", borderRadius: "6px" }}
                  ></div>
                  <div
                    className="skeleton skeleton-icon"
                    style={{ width: "22px", height: "22px", borderRadius: "6px" }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </>
  );
};

export default SubAdminShimmer;
