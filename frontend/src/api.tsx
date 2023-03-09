import snakecaseKeys from "snakecase-keys";
import { ChartData, ChartDataPoint, CommentThread, Comment } from "./types";

// TODO this should come from an environment variable instead
const API_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

async function fetchJSON(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args);

  if (!response.ok) {
    throw response;
  }

  return response.json();
}

export class HttpError extends Error {
  statusCode: number;

  constructor(code: number, message?: string) {
    super(message || code.toString());
    this.statusCode = code;
  }
}

export function getChartData(): Promise<ChartData> {
  return fetchJSON(`${API_URL}/chart/data`);
}

export async function getCommentThreads(): Promise<CommentThread[]> {
  return fetchJSON(`${API_URL}/chart/comment_threads`);
}

type CommentThreadResponse = CommentThread & {
  comments: Comment[];
};

export async function getCommentThread(
  threadId: string
): Promise<CommentThreadResponse> {
  return fetchJSON(`${API_URL}/chart/comment_threads/${threadId}`);
}

export async function createCommentThread(
  comment: Comment,
  dataPoint: ChartDataPoint
): Promise<CommentThreadResponse> {
  return fetchJSON(`${API_URL}/chart/comment_threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snakecaseKeys({ dataPoint, comment })),
  });
}

export async function createComment(
  comment: Comment,
  threadId: string
): Promise<CommentThreadResponse> {
  return fetchJSON(`${API_URL}/chart/comment_threads/${threadId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snakecaseKeys({ comment })),
  });
}

type ShareResponse = {
  token: string;
};

export async function getShareToken(): Promise<ShareResponse> {
  return fetchJSON(`${API_URL}/share`);
}

export async function getSharedChart(token: string): Promise<ChartData> {
  return fetchJSON(`${API_URL}/chart/shared/${token}`);
}
