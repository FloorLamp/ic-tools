import { DateTime } from "luxon";
import React, { useMemo } from "react";
import { formatNumber } from "../../lib/numbers";
import LineBarChart from "../Charts/LineBarChart";
import LineChart from "../Charts/LineChart";
import { ChartId, ChartTypes } from "./ChartIds";
import { ChartContainer } from "./ChartContainer";
import TransactionsOverTimeChart from "./TransactionsOverTimeChart";
import { SubnetResponse } from "../../lib/types/API";
import DonutChart, { DonutSeries } from "../Charts/DonutChart";

type Series = { x: Date; y1: number; y2: number };

const DataOverTimeChart = ({
  chartId,
  isFull = false,
}: {
  chartId: ChartId;
  isFull?: boolean;
}) => {
  const { hook, dataKey, heading, curve } = ChartTypes.find(
    ({ id }) => id === chartId
  );

  const height = isFull ? 400 : 250;

  if (chartId === "transactions") {
    return <TransactionsOverTimeChart heading={heading} isFull={isFull} />;
  }

  const { data } = hook();

  const donutChartSeries: DonutSeries[] = useMemo(() => {
    if (chartId === "canisters-per-subnet")
      return (data as SubnetResponse[])
        ?.map(({ id, canisterCount, subnetType, nodeCount }) => ({
          name: id,
          value: canisterCount,
          subnetType,
          nodeCount,
        }))
        .sort((a, b) => b.value - a.value);
  }, [data]);

  if (chartId === "canisters-per-subnet") {
    return (
      <ChartContainer
        isFull={isFull}
        chartId={chartId}
        heading={heading}
        dataKey={dataKey}
        isLoading={!data}
      >
        <DonutChart isFull={isFull} data={donutChartSeries} />
      </ChartContainer>
    );
  }

  const series: Series[] = useMemo(() => {
    let sum = 0;
    return data
      ?.map((d) => {
        sum += Number(d[dataKey]);
        return {
          x: DateTime.fromISO(d.day).toJSDate(),
          y1: Number(d[dataKey]),
          y2: sum,
        };
      })
      .concat({
        x: new Date(),
        y1: 0,
        y2: sum,
      });
  }, [data]);

  if (chartId === "cycles-minted") {
    return (
      <ChartContainer
        chartId={chartId}
        isFull={isFull}
        heading={heading}
        dataKey={dataKey}
        isLoading={!data}
      >
        <LineChart
          height={height}
          data={series?.map((d) => ({ x: d.x, y: d.y2 }))}
        />
      </ChartContainer>
    );
  }
  return (
    <ChartContainer
      chartId={chartId}
      isFull={isFull}
      heading={heading}
      dataKey={dataKey}
      isLoading={!data}
    >
      <LineBarChart
        data={series}
        xTooltipFormat={(x) =>
          DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL)
        }
        y1TooltipFormat={({ y1 }) => `New: ${formatNumber(y1)}`}
        y2TooltipFormat={({ y2 }) => `Total: ${formatNumber(y2)}`}
        height={height}
        curve={curve}
      />
    </ChartContainer>
  );
};

export default DataOverTimeChart;
