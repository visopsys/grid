import React from "react";
import { Line, Rect } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";

export interface BoxProps extends ShapeConfig {}

export const FillHandle: React.FC<BoxProps> = ({
  x = 0,
  y = 0,
  stroke,
  strokeWidth = 1,
  size = 8,
  ...props
}) => {
  if (x === 0 || y === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2 - strokeWidth,
        top: y - size / 2,
        width: size,
        height: size,
        border: `${strokeWidth}px white solid`,
        background: stroke,
        cursor: "crosshair",
        pointerEvents: "all",
      }}
      {...props}
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
