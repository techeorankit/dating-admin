import React from "react";
import "../../assets/scss/Shimmer/impressionShimmer.css";

const ROWS = 10;

/**
 * Skeleton loader for the translations key/value table (same layout as LanguageTranslationsPanel).
 */
export default function TranslationsTableShimmer() {
  return (
    <>
      <thead className="table-light sticky-top">
        <tr>
          <th
            className="text-uppercase text-nowrap small text-muted"
            style={{ width: "35%" }}
          >
            Key
          </th>
          <th className="text-uppercase text-nowrap small text-muted">
            Translation value
          </th>
        </tr>
      </thead>
      <tbody>
        {Array(ROWS)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              <td className="align-middle py-3">
                <div
                  className="skeleton skeleton-text"
                  style={{
                    width: `${100 + (i % 4) * 24}px`,
                    maxWidth: "100%",
                    height: "14px",
                    borderRadius: "6px",
                  }}
                />
              </td>
              <td className="align-middle py-2">
                <div
                  className="skeleton skeleton-text"
                  style={{
                    width: "100%",
                    height: "34px",
                    borderRadius: "6px",
                  }}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </>
  );
}
