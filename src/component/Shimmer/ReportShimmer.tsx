import React from "react";
import "../../assets/scss/Shimmer/ReportShimmer.css";

const ReportShimmer = () => {
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
            <tr key={i} style={{ height: "70px" }}>
              {/* No */}
              <td style={{ paddingLeft: "25px" }}>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "20px", height: "12px" }}
                ></div>
              </td>

              {/* Reporter */}
              <td>
                <div className="d-flex align-items-center gap-2" style={{ width: "250px" }}>
                  <div
                    className="skeleton skeleton-circle"
                    style={{ width: "50px", height: "50px" }}
                  ></div>
                  <div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "100px", height: "14px", marginBottom: "4px" }}
                    ></div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "70px", height: "12px", marginBottom: "4px" }}
                    ></div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "50px", height: "12px" }}
                    ></div>
                  </div>
                </div>
              </td>

              {/* Target */}
              <td>
                <div className="d-flex align-items-center gap-2" style={{ width: "250px" }}>
                  <div
                    className="skeleton skeleton-circle"
                    style={{ width: "50px", height: "50px" }}
                  ></div>
                  <div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "100px", height: "14px", marginBottom: "4px" }}
                    ></div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "70px", height: "12px", marginBottom: "4px" }}
                    ></div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "50px", height: "12px" }}
                    ></div>
                  </div>
                </div>
              </td>

              {/* Reason */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "150px", height: "12px" }}
                ></div>
              </td>

              {/* Status */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "60px", height: "12px" }}
                ></div>
              </td>

              {/* Created At */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "110px", height: "12px" }}
                ></div>
              </td>

              {/* Updated At */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "110px", height: "12px" }}
                ></div>
              </td>

              {/* Action (Solve / Delete) */}
              <td>
                <div className="d-flex justify-content-center align-items-center gap-2">
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

export default ReportShimmer;
