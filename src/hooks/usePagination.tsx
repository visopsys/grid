import React, { useState, useEffect } from "react";

export interface PaginationProps {
  pageSize: number;
  initialCurrentPage?: number;
  total: number;
  onChange?: (page: number) => void;
  component?: React.ReactNode;
}

export interface PaginationResults {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  paginationComponent: React.ReactNode;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  goToPage: (page: number) => void;
}

/**
 * Pagination hook
 * @param props
 */
const usePagination = (props: PaginationProps): PaginationResults => {
  const { initialCurrentPage = 1, pageSize = 10, total = 0, onChange } = props;
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const totalPages = Math.ceil(total / pageSize);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToPage = (page: number) => setCurrentPage(page);

  useEffect(() => {
    onChange && onChange(currentPage);
  }, [currentPage]);

  const pageProps: Omit<PaginationResults, "paginationComponent"> = {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    goToPage,
    pageSize,
  };

  const paginationComponent = React.createElement(
    PaginationComponent,
    pageProps
  );

  return {
    paginationComponent,
    ...pageProps,
  };
};

const PaginationComponent: React.FC<Omit<
  PaginationResults,
  "paginationComponent"
>> = ({
  currentPage,
  goToFirst,
  goToLast,
  goToPage,
  totalPages,
  nextPage,
  prevPage,
}) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    const isActive = currentPage === i;
    pages.push(
      <button onClick={() => goToPage(i)}>
        {isActive ? <strong>{i}</strong> : i}
      </button>
    );
  }
  return (
    <div>
      <button onClick={goToFirst} disabled={currentPage === 1}>
        First page
      </button>
      <button onClick={prevPage} disabled={currentPage === 1}>
        Prev page
      </button>
      {pages}
      <button onClick={nextPage} disabled={currentPage === totalPages}>
        Next page
      </button>
      <button onClick={goToLast} disabled={currentPage === totalPages}>
        Last page
      </button>
    </div>
  );
};

export default usePagination;
