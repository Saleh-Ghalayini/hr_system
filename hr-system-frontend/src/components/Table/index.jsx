import React from "react";
import styles from "./Table.module.css";
import StatusField from "../StatusField";
import Pagination from "../Pagination";

const Table = ({ headers, data, loading, emptyMessage, pagination }) => {
  const rows = Array.isArray(data) ? data : [];
  const hasRows = rows.length > 0;
  const showBlockingLoader = loading && !hasRows;
  const showOverlayLoader = loading && hasRows;

  return (
    <div className={`${styles.tableContainer} ${showOverlayLoader ? styles.isLoading : ""}`}>
      {showBlockingLoader ? (
        <div className={styles.loadingWrap}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header.key} className={styles.tableHeader}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-animate-rows">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className={styles.tableCell}
                    style={{ textAlign: "center", padding: "32px" }}
                  >
                    {emptyMessage ?? "No data available"}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id ?? index} className={styles.tableRow}>
                    {headers.map((header) => {
                      if (typeof header.render === "function") {
                        return (
                          <td key={header.key} className={styles.tableCell}>
                            {header.render(row)}
                          </td>
                        );
                      }

                      if (header.key === "status") {
                        return (
                          <td key={header.key} className={styles.tableCell}>
                            <StatusField
                              text={row[header.key]}
                              status={row[header.key]}
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={header.key} className={styles.tableCell}>
                          {row[header.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          )}
          {showOverlayLoader && (
            <div className={styles.loadingOverlay} aria-hidden="true">
              <div className="loading-spinner" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;
