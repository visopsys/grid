import React from "react";
import { Line, Rect } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";

interface BoxProps extends ShapeConfig {
  onCrosshairMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCrosshairMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCrosshairMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

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
  key,
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
    <React.Fragment key={key}>
      {lines}
      {fill && (
        <Rect
          fill={fill}
          x={x}
          y={y}
          width={width}
          height={height}
          {...commonProps}
        />
      )}
    </React.Fragment>
  );
};

export const FillHandle: React.FC<BoxProps> = ({
  x = 0,
  y = 0,
  stroke,
  onMouseDown,
}) => {
  if (x === 0 || y === 0) return null;
  const crossHairSize = 8;
  const crossHairBorderSize = 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x - crossHairSize / 2,
        top: y - crossHairSize / 2,
        width: crossHairSize,
        height: crossHairSize,
        border: `${crossHairBorderSize}px white solid`,
        background: stroke,
        cursor: "crosshair",
      }}
      onMouseDown={onMouseDown}
    />
  );
};

export const createHTMLBox = ({
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
  key,
  strokeStyle = "solid",
}: BoxProps) => {
  const commonProps = {};
  width = width - Math.floor(strokeWidth);
  y = y - Math.ceil(strokeWidth / 2);
  const lines = [
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: strokeTopWidth,
        borderWidth: 0,
        borderColor: strokeTopColor,
        borderTopWidth: strokeTopWidth,
        borderStyle: strokeStyle,
      }}
      key="top"
      {...commonProps}
    />,
    <div
      style={{
        position: "absolute",
        left: x + width,
        top: y,
        width: strokeRightWidth,
        height: height,
        borderWidth: 0,
        borderColor: strokeRightColor,
        borderRightWidth: strokeRightWidth,
        borderStyle: strokeStyle,
      }}
      key="right"
      {...commonProps}
    />,
    ,
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + height,
        width: width + strokeTopWidth,
        height: strokeBottomWidth,
        borderWidth: 0,
        borderColor: strokeBottomColor,
        borderBottomWidth: strokeBottomWidth,
        borderStyle: strokeStyle,
      }}
      key="bottom"
      {...commonProps}
    />,
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: strokeLeftWidth,
        height: height,
        borderWidth: 0,
        borderColor: strokeLeftColor,
        borderLeftWidth: strokeLeftWidth,
        borderStyle: strokeStyle,
      }}
      key="left"
      {...commonProps}
    />,
  ];

  return (
    <React.Fragment key={key}>
      {lines}
      {fill && (
        <div
          style={{
            position: "absolute",
            top: y,
            left: x,
            height,
            width,
            backgroundColor: fill,
            userSelect: "none",
            pointerEvents: "none",
          }}
          {...commonProps}
        />
      )}
    </React.Fragment>
  );
};
