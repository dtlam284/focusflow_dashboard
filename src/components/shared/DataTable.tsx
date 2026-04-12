import React, { useMemo, useState } from "react"

import { motion } from "motion/react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/utils"
import { useIsMobile } from "@/hooks/useMobile"
import { useI18n } from "@/contexts/I18nContext"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import { Button } from "../ui/button"

import { EmptyState } from "@/components/shared/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  tooltip?: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

export type DataTableFilterType = "text" | "select" | "number" | "date";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilterField {
  key: string;
  label: string;
  type?: DataTableFilterType;
  value?: string | number | boolean | null;
  placeholder?: string;
  options?: DataTableFilterOption[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
  filters?: DataTableFilterField[];
  onFilterChange?: (key: string, value: string | null) => void;
  onClearFilters?: () => void;
  filterDialogTitle?: string;
  filterDialogDescription?: string;
  searchPlaceholder?: string;
  mobileRenderCard?: (item: T) => React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  prioritizeMeaningfulColumns?: boolean;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  actions,
  filters,
  onFilterChange,
  onClearFilters,
  filterDialogTitle,
  filterDialogDescription,
  searchPlaceholder,
  mobileRenderCard,
  searchValue,
  onSearchChange,
  page = 1,
  limit = 50,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  prioritizeMeaningfulColumns = true,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [internalSearch, setInternalSearch] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(Math.max(1, limit || 50));

  const search = searchValue ?? internalSearch;
  const hasSearch = Boolean(onSearchChange || searchValue !== undefined);
  const isServerPagination = Boolean(onPageChange);
  const availableFilters = useMemo(() => filters ?? [], [filters]);
  const activeFilters = useMemo(
    () => availableFilters.filter((filter) => hasFilterValue(filter.value)),
    [availableFilters],
  );

  const totalItems = isServerPagination ? (total ?? data.length) : data.length;
  const safeLimit = Math.max(1, limit || 50);
  const selectedLimit = isServerPagination ? safeLimit : Math.max(1, localLimit);
  const selectedPage = isServerPagination ? Math.max(1, page || 1) : Math.max(1, localPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / selectedLimit));
  const boundedPage = Math.min(selectedPage, totalPages);
  const start = totalItems === 0 ? 0 : (boundedPage - 1) * selectedLimit + 1;
  const end = totalItems === 0 ? 0 : Math.min(boundedPage * selectedLimit, totalItems);
  const hasPreviousPage = boundedPage > 1;
  const hasNextPage = boundedPage < totalPages;
  const hasToolbar = hasSearch || availableFilters.length > 0 || Boolean(actions);

  const filterDialogTitleText = t(filterDialogTitle || "More filters");
  const filterDialogDescriptionText = t(
    filterDialogDescription ||
      "Refine the table data by selecting one or more filter conditions.",
  );
  const searchPlaceholderText = t(searchPlaceholder || "Search...");
  const tableRows = isServerPagination
    ? data
    : data.slice((boundedPage - 1) * selectedLimit, boundedPage * selectedLimit);

  const visiblePages = useMemo(() => {
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, boundedPage - half);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    startPage = Math.max(1, endPage - maxVisible + 1);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [boundedPage, totalPages]);

  const orderedColumns = useMemo(() => {
    if (!prioritizeMeaningfulColumns) {
      return columns;
    }

    return columns
      .map((column, index) => ({
        column,
        index,
        priority: getColumnPriority(column),
      }))
      .sort((a, b) => a.priority - b.priority || a.index - b.index)
      .map((item) => item.column);
  }, [columns, prioritizeMeaningfulColumns]);

  const clearAllFilters = () => {
    onClearFilters?.();

    if (!onFilterChange) {
      return;
    }

    availableFilters.forEach((filter) => {
      if (hasFilterValue(filter.value)) {
        onFilterChange(filter.key, null);
      }
    });
  };

  React.useEffect(() => {
    if (isServerPagination) {
      setLocalLimit(Math.max(1, limit || 50));
      return;
    }

    if (localPage > totalPages) {
      setLocalPage(totalPages);
    }
  }, [isServerPagination, limit, localPage, totalPages]);

  const goToPage = (nextPage: number) => {
    if (isServerPagination) {
      onPageChange?.(nextPage);
      return;
    }

    setLocalPage(nextPage);
  };

  const emptyTitleText = t(emptyTitle || "No results found.");
  const emptyDescriptionText = t(
    emptyDescription ||
      "Try adjusting your search or filters to find what you are looking for.",
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {hasToolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
            {hasSearch ? (
              <div className="relative w-full sm:min-w-[260px] sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={search}
                  aria-label={searchPlaceholderText}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (onSearchChange) {
                      onSearchChange(nextValue);
                      return;
                    }

                    setInternalSearch(nextValue);
                  }}
                  placeholder={searchPlaceholderText}
                  className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            ) : null}

            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={() => onFilterChange?.(filter.key, null)}
              >
                <span>
                  {t(filter.label)}: {formatFilterValue(filter, t)}
                </span>
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
            {availableFilters.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t("More Filters")}
              </Button>
            ) : null}

            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </div>
      ) : null}

      <div className="cms-scrollbar relative flex-1 overflow-auto min-h-[400px]">
        {tableRows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={isLoading ? t("Loading...") : emptyTitleText}
              description={isLoading ? undefined : emptyDescriptionText}
              action={!isLoading ? emptyAction : undefined}
            />
          </div>
        ) : isMobile && mobileRenderCard ? (
          <div className="space-y-3 p-3">
            {tableRows.map((item, i) => (
              <motion.div
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onRowClick?.(item)}
              >
                {mobileRenderCard(item)}
              </motion.div>
            ))}
          </div>
        ) : (
          <table className="w-full whitespace-nowrap text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm dark:bg-slate-900/80">
              <tr>
                {orderedColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "border-b border-slate-200 px-4 py-3 font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300",
                      col.width,
                    )}
                  >
                    {col.tooltip ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-slate-300 decoration-dashed underline-offset-4 focus:outline-none">
                          {t(col.header)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{col.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      t(col.header)
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {tableRows.map((item, i) => (
                <motion.tr
                  key={keyExtractor(item)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                      : "",
                  )}
                >
                  {orderedColumns.map((col) => (
                    <td key={`${keyExtractor(item)}-${col.key}`} className="px-4 py-3">
                      {col.render(item)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 sm:text-sm">
        <div>
          {t("Showing")} {start} {t("to")} {end} {t("of")} {totalItems} {t("results")}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{t("Rows")}</span>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              value={selectedLimit}
              disabled={isServerPagination && !onPageSizeChange}
              onChange={(event) => {
                const nextSize = Math.max(1, Number(event.target.value) || selectedLimit);

                if (isServerPagination) {
                  onPageSizeChange?.(nextSize);
                  onPageChange?.(1);
                  return;
                }

                setLocalLimit(nextSize);
                setLocalPage(1);
              }}
            >
              {Array.from(
                new Set([...pageSizeOptions.filter((size) => size > 0), selectedLimit]),
              ).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasPreviousPage || (isServerPagination && !onPageChange)}
            onClick={() => goToPage(boundedPage - 1)}
          >
            {t("Previous")}
          </Button>

          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === boundedPage ? "default" : "outline"}
              size="sm"
              disabled={isServerPagination && !onPageChange}
              onClick={() => goToPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || (isServerPagination && !onPageChange)}
            onClick={() => goToPage(boundedPage + 1)}
          >
            {t("Next")}
          </Button>
        </div>
      </div>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-2xl" closeLabel={t("Close")}>
          <DialogHeader>
            <DialogTitle>{filterDialogTitleText}</DialogTitle>
            <DialogDescription>{filterDialogDescriptionText}</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {availableFilters.map((filter) => {
              const filterType = filter.type ?? "text";
              const value = toFilterInputValue(filter.value);

              return (
                <label key={filter.key} className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {t(filter.label)}
                  </span>

                  {filterType === "select" ? (
                    <select
                      value={value}
                      onChange={(event) =>
                        onFilterChange?.(
                          filter.key,
                          normalizeFilterChangeValue(event.target.value),
                        )
                      }
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <option value="">{t(filter.placeholder || "All")}</option>
                      {(filter.options ?? []).map((option) => (
                        <option key={`${filter.key}-${option.value}`} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={filterType}
                      value={value}
                      onChange={(event) =>
                        onFilterChange?.(
                          filter.key,
                          normalizeFilterChangeValue(event.target.value),
                        )
                      }
                      placeholder={
                        filter.placeholder
                          ? t(filter.placeholder)
                          : t("Filter by {label}", {
                              label: t(filter.label).toLowerCase(),
                            })
                      }
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    />
                  )}
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={clearAllFilters}>
              {t("Reset Filters")}
            </Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>{t("Done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const hasFilterValue = (value: DataTableFilterField["value"]): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  return false;
};

const toFilterInputValue = (value: DataTableFilterField["value"]): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const normalizeFilterChangeValue = (value: string): string | null => {
  const normalized = value.trim();
  return normalized ? value : null;
};

const formatFilterValue = (
  filter: DataTableFilterField,
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ) => string,
): string => {
  const value = toFilterInputValue(filter.value);
  if (!value) {
    return t("Any");
  }

  if (filter.type === "select") {
    const option = filter.options?.find((item) => item.value === value);
    return option ? t(option.label) : value;
  }

  return value;
};

const getColumnPriority = <T,>(column: Column<T>): number => {
  const key = `${column.key} ${column.header}`.toLowerCase();

  if (/(action|actions|operation|ops|tools)/.test(key)) {
    return 90;
  }

  if (/(\bid\b|_id|^id$)/.test(key) && !/(name|title|email|label|slug)/.test(key)) {
    return 70;
  }

  if (/(name|title|email|username|label|slug|code)/.test(key)) {
    return 0;
  }

  if (/(status|state)/.test(key)) {
    return 20;
  }

  if (/(created|updated|date|time)/.test(key)) {
    return 30;
  }

  return 40;
};
