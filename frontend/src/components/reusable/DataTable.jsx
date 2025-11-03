import React from 'react';

/**
 * Reusable DataTable component for displaying tabular data
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ header, accessor, render }]
 * @param {Array} props.data - Data array to display
 * @param {Function} props.onRowClick - Optional row click handler
 * @param {string} props.emptyMessage - Message to show when no data
 */
export const DataTable = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="table-container">
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner h-8 w-8"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table-base">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-header">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={onRowClick ? 'table-row-hover cursor-pointer' : 'table-row-hover'}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="table-cell">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
