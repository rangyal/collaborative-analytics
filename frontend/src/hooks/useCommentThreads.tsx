import { useEffect, useState } from "react";

import { getCommentThreads } from "../api";
import { Comment, CommentThread } from "../types";

type CommentThreadWithComments = CommentThread & {
  comments?: Comment[];
};

function createOrUpdateCommentThread(
  commentThreads: CommentThreadWithComments[],
  commentThread: CommentThreadWithComments
) {
  let threadIndex = commentThreads.findIndex(
    ({ id }) => commentThread.id === id
  );

  if (threadIndex < 0) {
    threadIndex = commentThreads.length;
  }

  return [
    ...commentThreads.slice(0, threadIndex),
    commentThread,
    ...commentThreads.slice(threadIndex + 1),
  ];
}

export default function useCommentThreads() {
  const [commentThreads, setCommentThreads] =
    useState<CommentThreadWithComments[]>();
  const [error, setError] = useState<any>(undefined);

  const setCommentThread = (commentThread: CommentThread) =>
    setCommentThreads((currentCommentThreads) => {
      if (!currentCommentThreads) {
        return currentCommentThreads;
      }

      return createOrUpdateCommentThread(currentCommentThreads, commentThread);
    });

  useEffect(() => {
    setCommentThreads(undefined);
    setError(undefined);

    getCommentThreads().then(setCommentThreads).catch(setError);
  }, []);

  return [commentThreads, error, setCommentThread] as const;
}
