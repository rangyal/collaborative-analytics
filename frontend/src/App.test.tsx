import { fireEvent, render, screen, within } from "@testing-library/react";
import { createServer } from "miragejs";
import { MemoryRouter } from "react-router-dom";

import App from "./App";
import { chartData, commentThreadsData, commentThreadData } from "./fixtures";

createServer({
  routes() {
    this.logging = false;
    this.urlPrefix = "http://localhost:8000";
    this.get("chart/data", () => chartData);
    this.get("chart/comment_threads", () => commentThreadsData);
    this.get(
      `chart/comment_threads/${commentThreadData.id}`,
      () => commentThreadData
    );
    this.get("share", () => ({ token: "share-token" }));
  },
});

jest.mock("./components/CollaborativeChart");

const renderApp = () =>
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

describe("App", () => {
  it("renders with the Chart", async () => {
    renderApp();

    const { country, ...features } = chartData[1];
    const feature = Object.keys(features)[1];

    expect(
      await screen.findByTestId(`bar-${country}-${feature}`)
    ).toBeInTheDocument();
  });

  it("shows sidebar with comments when clicking on a bar", async () => {
    renderApp();

    const {
      comments,
      chartDataPoint: { country, feature },
    } = commentThreadData;

    fireEvent(
      await screen.findByTestId(`bar-${country}-${feature}`),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );

    const commentListEl = await screen.findByRole("list");
    const commentEls = within(commentListEl).getAllByRole("listitem");

    expect(commentEls.length).toBe(commentThreadData.comments.length);

    for (let i = 0; i < comments.length; i++) {
      const { userName, text } = comments[i];

      expect(commentEls[i]).toHaveTextContent(`${userName}: ${text}`);
    }
  });
});
