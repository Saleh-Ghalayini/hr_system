import React from "react";
import styles from "./Table.module.css";
import StatusField from "../StatusField";

const Table = ({ headers, data }) => {
  return (
    <div className={styles.tableContainer}>
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
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id ?? index} className={styles.tableRow}>
              {headers.map((header) =>
                header.key === "status" ? (
                  <td key={header.key} className={styles.tableCell}>
                    <StatusField
                      text={row[header.key]}
                      status={row[header.key]}
                    />
                  </td>
                ) : (
                  <td key={header.key} className={styles.tableCell}>
                    {row[header.key]}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
