import classNames from "classnames";
import { DateTime, Duration } from "luxon";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import ActiveLink from "../../components/ActiveLink";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import { MetaTags } from "../../components/MetaTags";
import { SecondaryNav } from "../../components/Nav/SecondaryNav";
import NeuronsTable from "../../components/NeuronsTable";
import SimpleTable from "../../components/Tables/SimpleTable";
import { groupBy } from "../../lib/arrays";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";
import { pluralize } from "../../lib/strings";
import {
  GenesisAccountStatus,
  InvestorType,
  NeuronsResponse,
} from "../../lib/types/API";

const formatDuration = (d: Duration) => {
  console.log(d);
  return (
    (d.years > 0 ? `${d.years} ${pluralize("year", d.years)}, ` : "") +
    (d.months > 0 ? `${d.months} ${pluralize("month", d.months)}, ` : "") +
    (d.days > 0 ? `${Math.floor(d.days)} ${pluralize("day", d.days)}` : "")
  );
};

const GenesisAccountPage = () => {
  const router = useRouter();
  const { genesisAccount } = router.query as { genesisAccount: string };
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [neuronData, setNeuronData] = useState<NeuronsResponse>(null);

  useEffect(() => {
    fetchJSON(`/api/genesis/${genesisAccount}`).then(
      (data) => data && setData(data)
    );
    setIsLoading(false);
  }, []);

  const summaryRows = useMemo(() => {
    let stats;
    if (neuronData) {
      const groups = groupBy(neuronData.rows, "state");
      console.log(groups);
      stats = ["1", "2", "3"].map((k) => {
        const [amount, sumTime] = (groups[k] || []).reduce(
          ([amt, ts]: [bigint, number], curr) => [
            amt + BigInt(curr.originalStake),
            ts + DateTime.fromISO(curr.dissolveDate).toSeconds(),
          ],
          [BigInt(0), 0]
        );
        const count = (groups[k] || []).length;
        const avgDuration = DateTime.fromSeconds(sumTime / count).diffNow([
          "years",
          "months",
          "days",
        ]);
        return { amount, count, avgDuration };
      });
    }
    return [
      [
        {
          contents: "Status",
          className: "w-36",
        },
        {
          contents: data ? (
            <span
              className={classNames({
                "text-red-500": data.status === GenesisAccountStatus.Unclaimed,
              })}
            >
              {GenesisAccountStatus[data.status]}
            </span>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "KYC?",
          className: "w-36",
        },
        {
          contents: data ? (data.isKyc ? "Yes" : "No") : "-",
        },
      ],
      [
        {
          contents: "Investor Type",
          className: "w-36",
        },
        {
          contents: data ? InvestorType[data.investorType] : "-",
        },
      ],
      [
        {
          contents: "Locked ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="w-6 pr-2 text-right">{stats[0].count}</strong>
              <div className="w-36 text-right">
                <BalanceLabel value={stats[0].amount} />
              </div>
              {stats[0].count > 0 && (
                <div className="pl-6 text-gray-500">
                  avg. {formatDuration(stats[0].avgDuration)}
                </div>
              )}
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Dissolving ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="w-6 pr-2 text-right">{stats[1].count}</strong>
              <div className="w-36 text-right">
                <BalanceLabel value={stats[1].amount} />
              </div>
              {stats[1].count > 0 && (
                <div className="pl-6 text-gray-500">
                  avg. {formatDuration(stats[1].avgDuration)}
                </div>
              )}
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Dissolved ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="w-6 pr-2 text-right">{stats[2].count}</strong>
              <div className="w-36 text-right">
                <BalanceLabel value={stats[2].amount} />
              </div>
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Total ICP",
          className: "w-36",
        },
        {
          contents: data ? (
            <>
              <strong className="w-6 pr-2 text-right inline-block">
                {data.neuronCount}
              </strong>
              <div className="inline-block w-36 text-right">
                {formatNumber(data.icpts)} <span className="text-xs">ICP</span>
              </div>
            </>
          ) : (
            "-"
          ),
        },
      ],
    ];
  }, [data, neuronData]);

  return (
    <div className="pb-16">
      <MetaTags
        title={`Genesis Neurons ${genesisAccount}`}
        description={`Details for genesis neuron ${genesisAccount} on the Internet Computer.`}
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/neurons">Neurons</ActiveLink>,
          <ActiveLink href="/genesis">Genesis</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl my-8 overflow-hidden">
        Genesis Neuron <small className="text-xl">{genesisAccount}</small>
      </h1>
      <section className="mb-8">
        <SimpleTable
          headers={[{ contents: "Account Details" }]}
          rows={summaryRows}
        />
      </section>
      <NeuronsTable genesisAccount={genesisAccount} onFetch={setNeuronData} />
    </div>
  );
};

export default GenesisAccountPage;
