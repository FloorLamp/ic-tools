import { useAtom } from "jotai";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Filters, SortingRule } from "react-table";
import ClientOnly from "../ClientOnly";
import SimpleTablePlaceHolder from "./SimpleTableLoader";
import { CommonTableProps, PAGE_SIZE, TableInner, tablesAtom } from "./Table";

type QueryParams = {
  pageSize: number;
  pageIndex: number;
  sortBy: SortingRule<any>[];
  filters: Filters<any>;
};

type DataTableProps = CommonTableProps & {
  name: string;
  extraQueryParams?: any;
  fetchData?: ({
    pageSize,
    pageIndex,
    sortBy,
    filters,
  }: QueryParams) => Promise<{ count: number; rows: any[] }>;
  staleTime?: number;
};

/** A table that manages data fetching and stores a copy of table state */
export const DataTable = (props: DataTableProps) => {
  return (
    <ClientOnly>
      <DataTableInner {...props} />
    </ClientOnly>
  );
};

const DataTableInner = ({
  name,
  className,
  style,
  tableBodyProps,
  tableHeaderGroupProps,
  columns,
  fetchData,
  useSort,
  manualSortBy,
  initialSortBy,
  usePage,
  manualPagination,
  initialPageSize = PAGE_SIZE,
  useExpand,
  useFilter,
  manualFilters,
  extraQueryParams,
  persistState,
  staleTime,
}: DataTableProps) => {
  const [persistedTableState] = useAtom(tablesAtom);
  const savedTableState = persistedTableState[name];
  const [tableState, setTableState] = useState<QueryParams>(savedTableState);

  const { data, isFetching } = useQuery(
    [name, extraQueryParams, tableState],
    ({ queryKey: [_name, _extra, params] }) => fetchData(params as QueryParams),
    {
      keepPreviousData: true,
      enabled: !!tableState,
      ...(staleTime !== undefined ? { staleTime } : {}),
    }
  );

  return isFetching ? (
    <SimpleTablePlaceHolder />
  ) : (
    <TableInner
      data={data?.rows || []}
      count={data?.count || 0}
      loading={isFetching}
      name={name}
      className={className}
      style={style}
      tableBodyProps={tableBodyProps}
      tableHeaderGroupProps={tableHeaderGroupProps}
      columns={columns}
      useSort={useSort}
      manualSortBy={manualSortBy}
      initialSortBy={initialSortBy}
      usePage={usePage}
      manualPagination={manualPagination}
      initialPageSize={initialPageSize}
      useExpand={useExpand}
      useFilter={useFilter}
      manualFilters={manualFilters}
      onStateChange={setTableState}
      persistState={persistState}
    />
  );
};
