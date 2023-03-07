import { Fragment } from "react";
import { BarStack } from "@visx/shape";
import { SeriesPoint } from "@visx/shape/lib/types";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { withTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";
import { schemeSet3 } from "d3-scale-chromatic";
import ParentSize, {
  ParentSizeProps,
} from "@visx/responsive/lib/components/ParentSize";

import {
  ChartData,
  ChartDataFeature,
  ChartDataPoint,
  CommentThread,
} from "../types";
import { findCommentThread } from "../utils";
import { CommentMarkerIcon, CommentMarkerPath } from "./CommentMarker";

const margin = { top: 60, left: 60, right: 60, bottom: 60 };

const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "rgba(0,0,0,0.9)",
  color: "white",
};

function getFeatures(data: ChartData) {
  const { country, ...featureData } = data[0];
  return Object.keys(featureData) as ChartDataFeature[];
}

type TooltipData = {
  bar: SeriesPoint<ChartData[0]>;
  key: ChartDataFeature;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};

type SizeProps = {
  width: number;
  height: number;
};

type ResponsiveChartProps = {
  data: ChartData;
  commentThreads?: CommentThread[];
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  containerProps?: Omit<ParentSizeProps, "children">;
};

type ChartProps = ResponsiveChartProps & SizeProps;

const CollaborativeChart = withTooltip<ChartProps, TooltipData>(
  ({
    data,
    commentThreads,
    onDataPointClick,
    width,
    height,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  }) => {
    if (!data.length) {
      return <>No data to display</>;
    }

    const keys = getFeatures(data);

    const featureTotals = data.map(({ country, ...features }) =>
      Object.values(features).reduce((a, b) => a + b)
    );

    const countryScale = scaleBand({
      domain: data.map((item) => item.country),
      padding: 0.3,
    });

    const featureScale = scaleLinear<number>({
      domain: [0, Math.max(...featureTotals)],
    });

    const colorScale = scaleOrdinal({
      domain: keys,
      range: [...schemeSet3],
    });

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    countryScale.rangeRound([0, xMax]);
    featureScale.rangeRound([yMax, 0]);

    let tooltipTimeout: number;

    return width < 10 ? null : (
      <div style={{ position: "relative" }}>
        <svg width={width} height={height}>
          <rect width={width} height={height} fill="#eeeeee" />
          <Group top={margin.top} left={margin.left}>
            <BarStack<ChartData[0], ChartDataFeature>
              data={data}
              keys={keys}
              height={yMax}
              xScale={countryScale}
              yScale={featureScale}
              color={colorScale}
              x={(item) => item.country}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map((bar) => (
                    <Fragment key={`barstack-${barStack.index}-${bar.index}`}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                        role={onDataPointClick ? "button" : undefined}
                        aria-label={
                          onDataPointClick
                            ? `Select ${bar.key} in ${bar.bar.data.country}`
                            : undefined
                        }
                        onClick={() =>
                          onDataPointClick?.({
                            country: bar.bar.data.country,
                            feature: bar.key,
                          })
                        }
                        onMouseLeave={() => {
                          tooltipTimeout = window.setTimeout(() => {
                            hideTooltip();
                          }, 300);
                        }}
                        onMouseEnter={() => {
                          if (tooltipTimeout) clearTimeout(tooltipTimeout);
                          const top = bar.y + margin.top;
                          const left = bar.x + bar.width + margin.left;
                          showTooltip({
                            tooltipData: bar,
                            tooltipTop: top,
                            tooltipLeft: left,
                          });
                        }}
                      />
                      {commentThreads &&
                        findCommentThread(commentThreads, {
                          country: bar.bar.data.country,
                          feature: bar.key,
                        })?.commentsCount && (
                          <CommentMarkerPath
                            x={bar.x + bar.width}
                            y={bar.y}
                            direction="left"
                            style={{
                              clipPath: `inset(0 0 ${Math.max(
                                15 - bar.height,
                                0
                              )}px ${Math.max(15 - bar.width, 0)}px)`,
                            }}
                          />
                        )}
                    </Fragment>
                  ))
                )
              }
            </BarStack>
            <AxisLeft
              scale={featureScale}
              tickLabelProps={() => ({
                fontSize: 11,
                textAnchor: "end",
                dy: "0.33em",
              })}
            />
            <AxisBottom
              top={yMax}
              scale={countryScale}
              tickLabelProps={() => ({
                fontSize: 11,
                textAnchor: "middle",
              })}
            />
          </Group>
        </svg>
        <div
          style={{
            position: "absolute",
            top: margin.top / 2 - 10,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          <LegendOrdinal
            scale={colorScale}
            direction="row"
            labelMargin="0 16px 0 0"
          />
          {/* TODO use visx's LegendItem component instead, if possible */}
          <div
            style={{ marginRight: 16, display: "flex", alignItems: "center" }}
          >
            <div style={{ display: "flex", margin: "2px 4px 2px 0" }}>
              <CommentMarkerIcon />
            </div>
            has comments
          </div>
        </div>
        {tooltipOpen && tooltipData && (
          <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
            <strong>
              <span style={{ color: colorScale(tooltipData.key) }}>
                {tooltipData.key}
              </span>{" "}
              in {tooltipData.bar.data.country}
            </strong>
            <div style={{ marginTop: "8px" }}>
              {tooltipData.bar.data[tooltipData.key]}
            </div>
            {commentThreads && (
              <div style={{ marginTop: "8px" }}>
                <small>
                  Comments:{" "}
                  {findCommentThread(commentThreads, {
                    country: tooltipData.bar.data.country,
                    feature: tooltipData.key,
                  })?.commentsCount || 0}
                </small>
              </div>
            )}
          </Tooltip>
        )}
      </div>
    );
  }
);

export default function ResponsiveCollaborativeChart({
  containerProps,
  ...props
}: ResponsiveChartProps) {
  return (
    <ParentSize {...containerProps}>
      {({ width, height }) => (
        <CollaborativeChart width={width} height={height} {...props} />
      )}
    </ParentSize>
  );
}
