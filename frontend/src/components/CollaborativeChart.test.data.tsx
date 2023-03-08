import { ChartData, CommentThread } from "../types";

export const chartData = [
  {
    country: "FR",
    hotdog: 117,
    burger: 123,
    sandwich: 83,
    kebab: 138,
    fries: 145,
    donut: 27,
  },
  {
    country: "GB",
    hotdog: 137,
    burger: 74,
    sandwich: 50,
    kebab: 68,
    fries: 192,
    donut: 134,
  },
  {
    country: "BE",
    hotdog: 115,
    burger: 195,
    sandwich: 191,
    kebab: 127,
    fries: 35,
    donut: 81,
  },
] as ChartData;

export const commentThreadsData = [
  {
    chartDataPoint: {
      feature: "kebab",
      country: "BE",
    },
    commentsCount: 3,
    id: "05ea2cb2717d414393fa30b36609c118",
  },
  {
    chartDataPoint: {
      feature: "burger",
      country: "GB",
    },
    commentsCount: 2,
    id: "4a905c4edd684130b8b57886fdacf20a",
  },
] as CommentThread[];
