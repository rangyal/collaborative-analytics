import { SVGProps } from "react";

type Props = Omit<
  SVGProps<SVGPathElement>,
  "x" | "y" | "width" | "height" | "fill" | "children"
> & {
  x?: number;
  y?: number;
  size?: number;
  direction?: "left" | "right";
};

export function CommentMarkerPath({
  x = 0,
  y = 0,
  size = 15,
  direction = "right",
  ...props
}: Props) {
  let x1 = x;
  let x2 = x;

  if (direction === "left") {
    x1 = x - size;
  } else {
    x2 = x + size;
  }

  return (
    <path
      d={`M ${x1},${y} L ${x2},${y} L ${x2},${y + size} Z`}
      fill="darkviolet"
      {...props}
    />
  );
}

export function CommentMarkerIcon(props: Props) {
  const { size = 15 } = props;
  return (
    <svg width={size} height={size}>
      <CommentMarkerPath {...props} />
    </svg>
  );
}
