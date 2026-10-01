import { isSkeleton } from "@/utils/allSelector";
import React, { useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { useSelector } from "react-redux";

export default function Table(props: any) {
  const roleSkeleton = useSelector(isSkeleton);
  const {
    data,
    mapData,
    Page,
    PerPage,
    onChildValue,
    className,
    id,
    thClick,
    type,
    shimmer,
    sortColumn: propSortColumn,
    sortOrder: propSortOrder,
  } = props;

  const [localSortColumn, setLocalSortColumn] = useState<any>();
  const [localSortOrder, setLocalSortOrder] = useState<any>("asc");

  const sortColumn = type === "server" ? propSortColumn : localSortColumn;
  const sortOrder = type === "server" ? propSortOrder : localSortOrder;

  const tableRows = Array.isArray(data) ? data : [];

  const handleColumnClick = (column: any) => {
    if (type === "server") {
      onChildValue(column);
    } else {
      if (localSortColumn === column) {
        setLocalSortOrder(localSortOrder === "asc" ? "desc" : "asc");
      } else {
        setLocalSortColumn(column);
        setLocalSortOrder("asc");
      }
    }
  };

  const sortedData =
    tableRows.length > 0
      ? [...tableRows].sort((a: any, b: any) => {
          // Creating a new array using spread syntax
          const valueA = a[sortColumn];
          const valueB = b[sortColumn];

          if (valueA < valueB) {
            return sortOrder === "asc" ? -1 : 1;
          }
          if (valueA > valueB) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        })
      : tableRows;

  const handleClick = (value: any) => {
    // Replace with your actual value
    onChildValue(value); // Invoke the callback function in the parent component
  };
  return (
    <>
      <div className="mainTable" id={id}>
        <table width="100%" className={`primeTable  ${className}`}>
          {roleSkeleton ? (
            <>
            
                {shimmer}
            </>
          ) : (
            <>
            {/* {shimmer} */}
                <thead>
                <tr>
                  {mapData.map((res: any, i: number) => {
                    return (
                      <th
                        className={`text-uppercase ${res?.thClass} text-nowrap`}
                        key={i}
                        // width={res.width}
                        onClick={res?.thClick}
                      >
                        {res?.Header}
                        {res?.sorting?.type === "server" && (
                          <i
                            className={
                              sortColumn === res.body
                                ? sortOrder === "asc"
                                  ? "ri-arrow-up-s-fill ms-1"
                                  : "ri-arrow-down-s-fill ms-1"
                                : "ri-expand-up-down-fill deg90 ms-1"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(res.body)}
                          ></i>
                        )}
                        {res?.sorting?.type === "client" && (
                          <i
                            className={
                              sortColumn === res.body
                                ? sortOrder === "asc"
                                  ? "ri-arrow-up-s-fill ms-1"
                                  : "ri-arrow-down-s-fill ms-1"
                                : "ri-expand-up-down-fill deg90 ms-1"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() => handleColumnClick(res.body)}
                          ></i>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedData?.length > 0 ? (
                  <>
                    {type === "client" && (
                      <>
                        {(PerPage > 0
                          ? sortedData.slice(
                              (Page - 1) * PerPage,
                              Page * PerPage
                            )
                          : sortedData
                        ).map((i: any, k: any) => {
                          return (
                            <>
                              <tr key={k}>
                                {mapData?.map((res: any, ind: number) => {
                                  return (
                                    <td key={ind} className={res?.tdClass}>
                                      {res?.Cell ? (
                                        <res.Cell row={i} index={k} />
                                      ) : (
                                        <span>{i[res?.body]}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </>
                          );
                        })}
                      </>
                    )}

                    {type === "server" && (
                      <>
                        {sortedData.map((i: any, k: any) => {
                          return (
                            <>
                              <tr key={k}>
                                {mapData?.map((res: any, ind: number) => {
                                  return (
                                    <td key={ind} className={res.tdClass}>
                                      {res.Cell ? (
                                        <res.Cell row={i} index={k} />
                                      ) : (
                                        <span>{i[res?.body]}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </>
                          );
                        })}

                        {/* Fill remaining rows to reach 10 */}
                        {/* {[...Array(Math.max(0, 15 - sortedData?.length))].map(
                          (_, index) => (
                            <tr
                              key={`empty-${index}`}
                              style={{ height: "62px" }}
                            >
                              {mapData.map((res: any, colIndex: any) => (
                                <td
                                  key={`empty-cell-${colIndex}`}
                                  style={{
                                    borderTop:
                                      "1px solid rgba(216, 216, 216, 0.5)",
                                    borderBottom:
                                      "1px solid rgba(216, 216, 216, 0.5)",
                                    borderInline: "none",
                                  }}
                                />
                              ))}
                            </tr>
                          )
                        )} */}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* {[...Array(9)].map((_, rowIndex) => (
                        <tr key={`nodata-${rowIndex}`} style={{ height: "62px" }}>
                          {rowIndex === 4 ? ( // Center it in the middle row (row 5 of 9)
                            <td
                              colSpan={mapData.length}
                              className="text-center"
                              style={{
                                borderBottom: "none",
                                border: "none",
                                padding: "20px 0",
                              }}
                            >
                              No Data Found!
                            </td>
                          ) : (
                            mapData.map((res: any, colIndex: any) => (
                              <td key={`empty-cell-${colIndex}`} style={{ border: "1px solid #eee" }} />
                            ))
                          )}
                        </tr>
                      ))} */}
                    {[...Array(11)].map((_, rowIndex) => (
                      <tr key={`nodata-${rowIndex}`} style={{ height: "62px" }}>
                        {rowIndex === 4 ? (
                          <td
                            colSpan={mapData.length}
                            className="text-center"
                            style={{
                              borderBottom: "none",
                              border: "none",
                              padding: "20px 0",
                            }}
                          >
                            No Data Found!
                          </td>
                        ) : (
                          mapData.map((res: any, colIndex: any) => (
                            <td
                              key={`empty-cell-${colIndex}`}
                              style={{
                                borderTop: "1px solid #eee",
                                borderBottom: "1px solid #eee",
                                borderLeft: "none",
                                borderRight: "none",
                              }}
                            />
                          ))
                        )}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </>
  );
}
