function Pagination({
  currentPage = 0,
  size = 0,
  totalResults = 0,
  totalPages = 0,
  goToPage,
  handleNextPage,
  handlePrevPage,
  pageLength = 10,
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex justify-between flex-1 sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing
            <span className="font-bold">
              {" "}
              {(currentPage - 1) * pageLength + 1}{" "}
            </span>
            to
            <span className="font-bold">
              {" "}
              {Math.min(currentPage * pageLength, totalResults)}{" "}
            </span>
            of
            <span className="font-bold"> {totalResults} </span>
            results
          </p>
        </div>
        <div>
          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm isolate"
            aria-label="Pagination"
          >
            <div
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage > 1 ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={() => {
                if (currentPage > 1) handlePrevPage();
              }}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {pages?.map((page) => {
              return (
                <div
                  key={page}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 cursor-pointer
                      ${
                        currentPage == page + 1
                          ? "z-10 bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }
                    `}
                  onClick={() => goToPage(page + 1)}
                >
                  {page + 1}
                </div>
              );
            })}
            <div
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage < totalPages
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
              onClick={() => {
                if (currentPage < totalPages) handleNextPage();
              }}
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
