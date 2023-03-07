import { useState } from "react";

import { ChartDataPoint, Comment } from "./types";
import { createCommentThread, createComment, getCommentThread } from "./api";
import Chart from "./components/CollaborativeChart";
import { findCommentThread } from "./utils";
import Comments from "./components/Comments";
import NewComment from "./components/NewComment";
import Share from "./components/Share";
import { useParams } from "react-router-dom";
import useCollaborativeChartData from "./hooks/useCollaborativeChartData";
import useCommentThreads from "./hooks/useCommentThreads";

function App() {
  const { shareToken } = useParams();

  const [chartData, isChartDataLoading, chartDataError] =
    useCollaborativeChartData(shareToken);
  const [commentThreads, , setCommentThread] = useCommentThreads();
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint>();

  const selectedDataPointValue =
    selectedDataPoint &&
    chartData?.find((item) => item.country === selectedDataPoint?.country)?.[
      selectedDataPoint.feature
    ];
  const selectedCommentThread =
    selectedDataPoint &&
    commentThreads &&
    findCommentThread(commentThreads, selectedDataPoint);

  const selectDataPoint = async (dataPoint: ChartDataPoint) => {
    setSelectedDataPoint(dataPoint);

    if (!commentThreads) {
      return;
    }

    const commentThread = findCommentThread(commentThreads, dataPoint);

    if (commentThread?.commentsCount && !commentThread.comments) {
      try {
        setCommentThread(await getCommentThread(commentThread.id));
      } catch {
        alert("Failed to fetch comments");
      }
    }
  };

  const addNewComment = async (comment: Comment) => {
    if (!selectedDataPoint) {
      return;
    }

    try {
      const commentThread = selectedCommentThread
        ? await createComment(comment, selectedCommentThread.id)
        : await createCommentThread(comment, selectedDataPoint);

      setCommentThread(commentThread);
    } catch {
      alert("Failed to add comment");
    }
  };

  if (isChartDataLoading) {
    return <>Loading data</>;
  }

  if (chartDataError) {
    throw chartDataError;
  }

  if (!chartData) {
    return null;
  }

  return (
    <>
      <Chart
        data={chartData}
        commentThreads={commentThreads}
        onDataPointClick={selectDataPoint}
        containerProps={{
          className: "main",
          parentSizeStyles: { overflow: "auto" },
        }}
      />
      <Share style={{ position: "fixed", bottom: 10, left: 10 }} />
      {selectedDataPointValue && (
        <div className="sidebar">
          <div>
            <button
              type="button"
              onClick={() => setSelectedDataPoint(undefined)}
            >
              Close
            </button>
          </div>
          <div>
            <strong>
              <span>{selectedDataPoint.feature}</span> in{" "}
              {selectedDataPoint.country}
            </strong>
            : {selectedDataPointValue}
          </div>
          <hr />
          {selectedCommentThread?.comments && (
            <Comments comments={selectedCommentThread.comments} />
          )}
          <NewComment onNewComment={addNewComment} />
        </div>
      )}
    </>
  );
}

export default App;
