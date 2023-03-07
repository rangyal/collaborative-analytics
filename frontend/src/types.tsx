export type ChartDataFeature =
  | "hotdog"
  | "burger"
  | "sandwitch"
  | "kebab"
  | "fries"
  | "donut";

export type Country = "FR" | "GB" | "BE" | "DE" | "ES" | "IT";

export type ChartDataPoint = {
  feature: ChartDataFeature;
  country: Country;
};

export type CommentThread = {
  id: string;
  commentsCount: number;
  chartDataPoint: ChartDataPoint;
};

export type Comment = {
  userName: string;
  text: string;
};

type ChartDataItem = {
  country: Country;
} & { [key in ChartDataFeature]: number };

export type ChartData = ChartDataItem[];
