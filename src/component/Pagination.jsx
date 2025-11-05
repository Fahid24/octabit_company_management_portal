import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";
import PropTypes from "prop-types";

const DOTS = "...";

const range = (start, end) => {
  return [...Array(end - start + 1).keys()]?.map((i) => i + start);
};

const Pagination = ({
  totalCount,
  limit,
  currentPage,
  setCurrentPage,
  setLimit,
  className
}) => {
  const totalPageCount = Math.ceil(totalCount / limit);
  const siblingCount = 1;
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [siblingCount, currentPage, totalPageCount]);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm",
        className
      )}
    >
      {totalCount > 0 && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              value={limit}
              className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>1000</option>
              <option value={10000}>10000</option>
            </select>
          </div>
          <span className="text-gray-700">
            {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)} of {totalCount}
          </span>
        </div>
      )}

      {totalPageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "flex items-center justify-center p-2 rounded-md border border-gray-300",
              "hover:bg-gray-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            )}
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>

          {paginationRange?.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span 
                  key={index} 
                  className="flex items-center justify-center w-10 h-10 text-gray-500"
                >
                  {DOTS}
                </span>
              );
            }

            return (
              <button
                key={index}
                onClick={() => setCurrentPage(pageNumber)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-md border",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                  currentPage === pageNumber
                    ? "bg-primary-600 border-primary-600 font-medium shadow-sm"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPageCount}
            className={cn(
              "flex items-center justify-center p-2 rounded-md border border-gray-300",
              "hover:bg-gray-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            )}
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  totalCount: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Pagination;