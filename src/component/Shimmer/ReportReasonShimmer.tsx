import React from "react";
import "../../assets/scss/Shimmer/ReportReasonShimmer.css";

const ReportReasonShimmer = () => {
  return (
    <>
      <thead>
        <tr style={{ height: "50px" }}>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <tr key={i} style={{ height: "60px" }} className="d-flex justify-content-between">
              {/* No */}
              <td style={{ paddingLeft: "25px" }}>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "20px", height: "12px" }}
                ></div>
              </td>

              {/* Title */}
              <td>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "150px", height: "14px" }}
                ></div>
              </td>

              {/* Action (Edit, Delete) */}
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

export default ReportReasonShimmer;
