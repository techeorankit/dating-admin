import React, { useMemo } from "react";
import { Select } from "./Input";

interface PaginationProps {
  type: string;
  serverPage: number;
  setServerPage: (page: number) => void;
  serverPerPage: number;
  onPageChange: (event: React.MouseEvent | null, page: number) => void;
  onRowsPerPageChange: (value: string) => void;
  totalData: number;
}

/** Up to 3 consecutive page numbers: current in the center when possible (one active, one each side). */
function getCenteredPageRange(currentPage: number, totalPages: number): number[] {
  const range = 3;
  const count = Math.min(range, totalPages);
  let start = Math.max(1, currentPage - Math.floor(range / 2));
  const end = Math.min(start + range - 1, totalPages);
  start = Math.max(1, end - range + 1);
  return Array.from({ length: count }, (_, i) => start + i);
}

const Pagination: React.FC<PaginationProps> = ({
  serverPage,
  setServerPage,
  serverPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalData
}) => {
  // Memoized calculation of pagination details
  const paginationDetails = useMemo(() => {
    const totalPages = Math.ceil(totalData / serverPerPage);
    const currentPage = serverPage; // Already 1-based

    const pageNumbers = getCenteredPageRange(currentPage, totalPages);

    return {
      totalPages,
      currentPage,
      pageNumbers,
      startIndex: (serverPage - 1) * serverPerPage + 1,
      endIndex: Math.min(serverPage * serverPerPage, totalData)
    };
  }, [serverPage, serverPerPage, totalData]);

  // Rows per page options
  const rowsPerPageOptions = [5, 10, 25, 50, 100];

  // Disable state checks
  const isFirstPage = serverPage === 1;
  const isLastPage = serverPage === paginationDetails.totalPages;



  return totalData > 0 ? (
    <div className="pagination">
      <div className="client-pagination betBox w-100">
        {/* Rows per page selector */}
        <div className="tableRang midBox">
          <Select
            key={`rows-${serverPerPage}`}
            id="pagination"
            option={rowsPerPageOptions}
            defaultValue={serverPerPage}
            label="Show"
            onChange={(value: string) => {
              // Convert to string to match your existing handler
              onRowsPerPageChange(value);
            }}
            className="midBox"
            btnClass="mt-0"
            angle={true}
          />
          <p className="count">
            {`${paginationDetails.startIndex} - ${paginationDetails.endIndex} of ${totalData}`}
          </p>
        </div>

        {/* Pagination controls */}
        <div className="tableAccess">
          <div className="d-flex m15-left mainPaginatinBtn">
            {/* First page button */}
            <button
              className={`paginationBtn ${isFirstPage ? 'pageBtnDisable' : ''}`}
              disabled={isFirstPage}
              onClick={() => onPageChange(null, 1)}
              style={{ backgroundColor: "#fff", color: isFirstPage ? "#b7b7b7" : "#000" }}
            >
              {"«"}
            </button>

            {/* Previous page button */}
            <button
              className={`paginationBtn ${isFirstPage ? 'pageBtnDisable' : ''}`}
              disabled={isFirstPage}
              onClick={() => onPageChange(null, serverPage - 1)}
              style={{ backgroundColor: "#fff", color: isFirstPage ? "#b7b7b7" : "#000" }}
            >
              {"‹"}
            </button>

            {/* Page numbers: at most 3 — current centered when possible (only one active) */}
            {paginationDetails.pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(null, pageNum)}
                className={`paginationBtn paginationNumber ${paginationDetails.currentPage === pageNum ? "active" : "active-btn"
                  }`}
              >
                {pageNum}
              </button>
            ))}


            {/* Next page button */}
            <button
              className={`paginationBtn ${isLastPage ? 'pageBtnDisable' : ''}`}
              disabled={isLastPage}
              onClick={() => onPageChange(null, serverPage + 1)}
              style={{ backgroundColor: "#fff", color: isLastPage ? "#b7b7b7" : "#000" }}
            >
              {"›"}
            </button>

            {/* Last page button */}
            <button
              className={`paginationBtn ${isLastPage ? 'pageBtnDisable' : ''}`}
              disabled={isLastPage}
              onClick={() => onPageChange(null, paginationDetails.totalPages)}
              style={{ backgroundColor: "#fff", color: isLastPage ? "#b7b7b7" : "#000" }}
            >
              {"»"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Pagination;