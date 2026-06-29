import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing Page <span className="font-bold text-gray-800 dark:text-gray-200">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 transition focus:z-20"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  className={`relative inline-flex items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition focus:z-20 ${
                    currentPage === pageNum
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                      : 'text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 bg-white dark:bg-gray-900'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 transition focus:z-20"
            >
              <span className="sr-only">Next</span>
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
