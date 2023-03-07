import { ChartDataPoint, CommentThread } from "./types";

function isDatapointEquals(a: ChartDataPoint, b: ChartDataPoint) {
  return a.country === b.country && a.feature === b.feature;
}

export function findCommentThread<T extends CommentThread>(
  commentThreads: T[],
  dataPoint: ChartDataPoint
) {
  return commentThreads.find(({ chartDataPoint: commentThreadDataPoint }) =>
    isDatapointEquals(commentThreadDataPoint, dataPoint)
  );
}
