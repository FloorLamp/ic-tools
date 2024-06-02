import { curveMonotoneX } from "d3";
import { DateTime } from "luxon";
import React, { useMemo } from "react";
import useTransactionCounts from "../../lib/hooks/useTransactionCounts";
import { formatNumber } from "../../lib/numbers";
import MultiLineChart from "../Charts/MultiLineChart";
import { ChartContainer } from "./ChartContainer";

const TransactionsOverTimeChart = ({
  isFull = false,
  heading,
}: {
  isFull?: boolean;
  heading: string;
}) => {
  const { data } = useTransactionCounts();

  const series = useMemo(() => {
    if (!data) return null;
    return data.reduce(
      ([counts, sums], d) => {
        const x = DateTime.fromISO(d.day).toJSDate();
        return [
          counts.concat({
            x,
            y: d.count,
          }),
          sums.concat({
            x,
            y: Number(d.sum),
          }),
        ];
      },
      [[], []]
    );
  }, [data]);

  const height = isFull ? 400 : 250;

  return (
    <ChartContainer
      chartId={"transactions"}
      isFull={isFull}
      heading={heading}
      dataKey={"transactions"}
      isLoading={!data}
    >
      <MultiLineChart
        data={series}
        xTooltipFormat={(x) =>
          DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL)
        }
        yTooltipFormat={(i, { y }) =>
          `${i === 0 ? "Count" : "Sum"}: ${formatNumber(y, 2)}`
        }
        height={height}
        curve={curveMonotoneX}
      />
    </ChartContainer>
  );
};

export default TransactionsOverTimeChart;
