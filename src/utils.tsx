import React from "react";
import { Line, Rect } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";

interface BoxProps extends ShapeConfig {}

/**
 * Create a box with custom top/right/bottom/left colors and widths
 * @param param0
 */
export const createBox = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  stroke,
  strokeLeftColor = stroke,
  strokeTopColor = stroke,
  strokeRightColor = stroke,
  strokeBottomColor = stroke,
  strokeWidth = 0,
  strokeTopWidth = strokeWidth,
  strokeRightWidth = strokeWidth,
  strokeBottomWidth = strokeWidth,
  strokeLeftWidth = strokeWidth,
}: BoxProps) => {
  const commonProps = {
    perfectDrawEnabled: false,
    shadowForStrokeEnabled: false,
    hitStrokeWidth: 0,
    listening: false,
    lineCap: "square",
  };
  const lines = [
    <Line
      points={[x, y, x + width, y]}
      stroke={strokeTopColor}
      strokeWidth={strokeTopWidth}
      key="top"
      {...commonProps}
    />,
    <Line
      points={[x + width, y, x + width, y + height]}
      stroke={strokeRightColor}
      strokeWidth={strokeRightWidth}
      key="right"
      {...commonProps}
    />,
    <Line
      points={[x + width, y + height, x, y + height]}
      stroke={strokeBottomColor}
      strokeWidth={strokeBottomWidth}
      key="bottom"
      {...commonProps}
    />,
    <Line
      points={[x, y + height, x, y]}
      stroke={strokeLeftColor}
      strokeWidth={strokeLeftWidth}
      key="left"
      {...commonProps}
    />,
  ];

  return (
    <>
      {lines}
      <Rect
        fill={fill}
        x={x}
        y={y}
        width={width}
        height={height}
        {...commonProps}
      />
    </>
  );
};
