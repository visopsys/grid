import React from "react";
import { ShapeConfig } from "konva/types/Shape";

/**
 * Fill handle component
 */
const FillHandle: React.FC<ShapeConfig> = ({
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

export default FillHandle;
