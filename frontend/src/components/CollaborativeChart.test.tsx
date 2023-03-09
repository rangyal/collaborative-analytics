import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentPropsWithoutRef } from "react";
import { ChartDataFeature } from "../types";

import CollaborativeChart from "./CollaborativeChart";
import { chartData, commentThreadsData } from "../fixtures";

const renderChart = (
  props?: Omit<
    ComponentPropsWithoutRef<typeof CollaborativeChart>,
    "data" | "width" | "height"
  >
) =>
  render(
    <CollaborativeChart data={chartData} width={800} height={800} {...props} />
  );

const renderChartWithComments = () =>
  renderChart({ commentThreads: commentThreadsData });

const verifyChartData = async () => {
  for (const { country, ...features } of chartData) {
    for (const feature of Object.keys(features) as ChartDataFeature[]) {
      const bar = screen.getByTestId(`bar-${country}-${feature}`);

      userEvent.hover(bar);
      const tooltip = await screen.findByTestId(
        `tooltip-${country}-${feature}`
      );
      expect(tooltip).toHaveTextContent(
        `${feature} in ${country}: ${features[feature]}`
      );
    }
  }
};

describe("CollaborativeChart", () => {
  it("displays data", async () => {
    renderChart();
    verifyChartData();
  });

  it("calls event handler when a bar is clicked", () => {
    const onDataPointClick = jest.fn();
    renderChart({ onDataPointClick });

    const { country, ...features } = chartData[1];
    const feature = Object.keys(features)[1];

    // TODO check why `userEvent.click` doesn't work
    fireEvent(
      screen.getByTestId(`bar-${country}-${feature}`),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(onDataPointClick).toBeCalledTimes(1);
    expect(onDataPointClick).toBeCalledWith({ country, feature });
  });

  describe("with comments", () => {
    it("displays data", async () => {
      renderChartWithComments();
      verifyChartData();
    });

    it("displays comment markers", () => {
      renderChartWithComments();

      for (const thread of commentThreadsData.filter(
        (thread) => thread.commentsCount > 0
      )) {
        const {
          chartDataPoint: { country, feature },
        } = thread;

        expect(
          screen.getByTestId(`comment-marker-${country}-${feature}`)
        ).toBeInTheDocument();
      }
    });

    it("displays comment counts", async () => {
      renderChartWithComments();

      for (const thread of commentThreadsData.filter(
        (thread) => thread.commentsCount > 0
      )) {
        const {
          commentsCount,
          chartDataPoint: { country, feature },
        } = thread;
        const bar = screen.getByTestId(`bar-${country}-${feature}`);

        userEvent.hover(bar);
        const tooltip = await screen.findByTestId(
          `tooltip-${country}-${feature}`
        );
        expect(tooltip).toHaveTextContent(`Comments: ${commentsCount}`);
      }
    });
  });
});
