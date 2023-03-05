# Collaborative analytics

A chart that allows users to add comments and share the chart.

## Running the backend

### Pre-requisites

Install [Docker](https://www.docker.com/get-started/).

### Installation

Run `docker-compose build` - might take a while for frontend to build.

### Launchnig

Run `docker-compose up` - wait until yo see "frontend | Compiled successfully!" message; loads in around a 2-3 minutes.

Navigate to http://localhost:3000 to view the app.

To launch only the backend - run `docker-compose up backend`

## Project structure

`backend` folder hosts FastAPI backend.

- `test_main.py` has integration tests
- `services/test_comments_service.py` has unit tests for thes comments service
- locks are used to prevent race conditions, e.g. multiple comment threads attached to the same chart data point or overwriting the comments

`frontend` folder hosts React/Typescript frontend.

## Domain Model

Bar chart is used for the test task. Countries are on the X axis, Features are on the Y axis.

**Chart Domain**

- `ChartDataPoint` represents single point on the plot
- `ChartDataFeature` is an enum with all available features
- `Country` is an enum with all available features

**Comment Domain**

- `CommentThread` represents a single thread attached to chart
- `Comment` represents an entry within a thread

## Backend API

Backend API runs on http://localhost:8000

### Common backend-exposed type signatures

```typescript
type ChartDataFeature =
  | "hotdog"
  | "burger"
  | "sandwitch"
  | "kebab"
  | "fries"
  | "donut";

type Country = "FR" | "GB" | "BE" | "DE" | "ES" | "IT";

type ChartDataPoint = {
  feature: ChartDataFeature;
  country: Country;
};

type CommentThread = {
  id: string;
  comments_count: number;
  chart_data_point: ChartDataPoint[];
};

type Comment = {
  user_name: string;
  text: string;
};
```

### `GET /chart/data`

Returns chart data formatted to be ready-for-consumption.

```typescript
type ChartDataResponse = {
  country: Country;
  [key: ChartDataFeature]: number;
}[];
```

### `GET /chart/comment_threads`

Returns a list of comment threads,

```typescript
type CommentThreadsResponse = CommentThread[];
```

### `GET /chart/comment_threads/:thread_id`

Returns a list of comments in a thread

```typescript
type CommentThreadResponse = CommentThread & {
  comments: Comment[];
};
```

### `POST /chart/comment_threads`

Creates a new comment thread, responds with `CommentThreadResponse`

```typescript
type CreateThreadRequest = {
  comment: Comment;
  data_point: ChartDataPoint;
};
``;
```

### `POST /chart/comment_threads/:thread_id/respond`

Posts a new comment to a thread, responds with `CommentThreadResponse`

```typescript
type RespondToCommentThreadRequest = {
  comment: Comment;
};
``;
```

### `GET /share`

Returns a shareable link for a chart

```typescript
type ShareResponse = {
  token: string;
};
```

### `GET /chart/shared/:share_id`

Returns chart data by token, responds with `ChartDataResponse`
