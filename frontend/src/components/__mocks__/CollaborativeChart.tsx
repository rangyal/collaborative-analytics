import { ComponentProps } from "react";

const CollaborativeChart = jest.requireActual("../CollaborativeChart").default;

// Elements doesn't have dimensions in jsdom.
// This adds width and high to `CollaborativeChart` component,
// to make sure that it gets rendered in the tests.
export default function CollaborativeChartWithFixedSize(
  props: ComponentProps<typeof CollaborativeChart>
) {
  return <CollaborativeChart {...props} width={800} height={800} />;
}
