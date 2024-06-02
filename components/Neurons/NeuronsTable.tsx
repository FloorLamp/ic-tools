import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { entries } from "../../lib/enums";
import fetchJSON from "../../lib/fetch";
import { NeuronState } from "../../lib/types/governance";
import BalanceLabel from "../Labels/BalanceLabel";
import IdentifierLink from "../Labels/IdentifierLink";
import { DataTable } from "../Tables/DataTable";
import { SelectColumnFilter } from "../Tables/Table";
import { NeuronLabel } from "./NeuronLabel";

export const neuronsTableColumns = [
  {
    Header: "ID",
    accessor: "id",
    className: "px-2 flex-1 oneline",
    Cell: ({ value, row }) => (
      <>
        <Link href={`/neuron/${value}`}>
          <a className="link-overflow" title={row.original.name}>
            {value}
            {row.original.name && ` (${row.original.name})`}
          </a>
        </Link>
      </>
    ),
    style: { minWidth: "4rem" },
    Filter: SelectColumnFilter,
    filterOptions: [
      ["Genesis...", ""],
      ["Is Genesis", "1"],
      ["Is not Genesis", "0"],
    ],
  },
  {
    Header: "State",
    accessor: "state",
    Cell: ({ value, row }) => <NeuronLabel state={value} />,
    className: "px-2 w-32",
    Filter: SelectColumnFilter,
    filterOptions: [["State...", "" as any]].concat(
      entries(NeuronState).filter(([_, n]) => n > 0)
    ),
  },
  {
    Header: "Proposals",
    accessor: "proposalCount",
    sortDescFirst: true,
    className: "px-2 hidden md:block w-28 text-right",
    Filter: SelectColumnFilter,
    filterOptions: [
      ["Proposals...", ""],
      ["Has Proposals", "1"],
      ["No Proposals", "0"],
    ],
  },
  {
    Header: "Account",
    accessor: "accountId",
    Cell: ({ value, row }) =>
      value ? (
        <IdentifierLink type="account" id={value} />
      ) : (
        <span className="text-gray-500">Unknown</span>
      ),
    className: "px-2 flex-1 flex oneline",
    style: { minWidth: "6rem" },
  },
  {
    Header: "Staked ICP",
    accessor: "stake",
    sortDescFirst: true,
    Cell: ({ value, row }) => (
      <BalanceLabel
        value={
          row.original.account && row.original.state === NeuronState.Dissolved
            ? row.original.account.balance
            : value
        }
      />
    ),
    className: "px-2 w-40 text-right",
  },
  {
    Header: "Dissolve Date",
    accessor: "dissolveDate",
    Cell: ({ value, row }) => {
      if (row.original.state === NeuronState.Dissolved) return "-";
      const date = DateTime.fromISO(value);
      return date.diffNow().toMillis() < 0
        ? "Dissolvable"
        : date.toRelativeCalendar();
    },
    className: "px-2 w-36 text-right",
  },
];

const NeuronsTable = ({ name }: { name: string }) => {
  const initialSort = useMemo(() => [{ id: "stake", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy, filters }) => {
    const stateFilter = filters.find(({ id }) => id === "state");
    const proposalFilter = filters.find(({ id }) => id === "proposalCount");
    const genesisFilter = filters.find(({ id }) => id === "id");
    return fetchJSON(
      "/api/neurons?" +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? {
                orderBy: sortBy[0].id,
                order: sortBy[0].desc ? "desc" : "asc",
              }
            : {}),
          pageSize,
          page: pageIndex,
          ...(stateFilter ? { state: stateFilter.value } : {}),
          ...(proposalFilter ? { hasProposals: proposalFilter.value } : {}),
          ...(genesisFilter ? { isGenesis: genesisFilter.value } : {}),
        })
    );
  };

  return (
    <DataTable
      name={`${name}.neurons`}
      persistState={true}
      style={{ minWidth: 480 }}
      className="text-xs sm:text-base"
      columns={neuronsTableColumns}
      fetchData={fetchData}
      initialSortBy={initialSort}
      useExpand={true}
      useFilter={true}
    />
  );
};

export default NeuronsTable;
