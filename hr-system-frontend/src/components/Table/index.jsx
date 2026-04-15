import React from "react";
import styles from "./Table.module.css";
import StatusField from "../StatusField";
import Pagination from "../Pagination";

const Table = ({ headers, data, loading, emptyMessage, pagination }) => {
  return (
    <div className={styles.tableContainer}>
      {loading ? (
        <div className="loading-spinner" />
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
              {data.length === 0 ? (
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
                data.map((row, index) => (
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
        </>
      )}
    </div>
  );
};

export default Table;
