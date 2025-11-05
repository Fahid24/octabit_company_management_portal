import React from "react";
import PropTypes from "prop-types";
import Loader from "./Loader";

const Table = ({ columns, data, isLoading, onRowClick, renderCell }) => {
  return (
    <div className="w-full">
      <div className="py-4">
        <div className=" overflow-x-auto pb-14">
          <div className="inline-block min-w-full ">
            {isLoading ? (
              <div className="flex justify-center h-[70vh] items-center w-full ">
                <Loader />
              </div>
            ) : (
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className=" px-4 py-3 font-bold border-gray-200 text-left text-sm text-gray-700 uppercase tracking-wider"
                      >
                        <p className="grid justify-start text-nowrap">
                          {col}
                          <p className="border-primary border-b-2" />
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.length > 0 ? (
                    data?.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`font-semibold text-gray-500 text-sm hover:bg-gray-200 transition-colors ${rowIndex % 2 === 1 ? "bg-gray-100" : "bg-white"
                          } ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                      >
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-4 py-2 border-none text-sm text-nowrap`}
                          >
                            {renderCell ? renderCell(col, row[col], row) : row[col] || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRowClick: PropTypes.func,
  renderCell: PropTypes.func,
};

export default Table;
