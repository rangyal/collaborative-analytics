import { useEffect, useState } from "react";

import { getChartData, getSharedChart } from "../api";
import { ChartData } from "../types";

export default function useCollaborativeChartData(shareToken?: string) {
  const [chartData, setChartData] = useState<ChartData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>();

  useEffect(() => {
    setChartData(undefined);
    setIsLoading(true);
    setError(undefined);

    const dataAsync = shareToken ? getSharedChart(shareToken) : getChartData();

    dataAsync
      .then(setChartData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [shareToken]);

  return [chartData, isLoading, error] as const;
}
