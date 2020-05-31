import React from "react";
import { RendererProps } from "./Grid";
import { Group, Rect, Text } from "react-konva/lib/ReactKonvaCore";

export interface CellProps extends RendererProps {
  value?: string;
  textColor?: string;
  textAlign?: string;
  textOffsetX?: number;
}

/**
 * Default cell component
 * @param props
 */
const Cell: React.FC<CellProps> = (props) => {
  const {
    x,
    y,
    width,
    height,
    value,
    fill = "white",
    strokeWidth = 0.5,
    stroke = "#aaa",
    align = "left",
    verticalAlign = "middle",
    textColor = "#333",
    textOffsetX = 0,
    textAlign = "center",
  } = props;
  return (
    <Group>
      <Rect
        x={x}
        y={y}
        height={height}
        width={width}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Text
        x={x}
        y={y}
        height={height}
        width={width}
        text={value}
        fill={textColor}
        offsetX={textOffsetX}
        verticalAlign="middle"
        align={textAlign}
      />
    </Group>
  );
};

/**
 * Default CellRenderer
 * @param props
 */
const CellRenderer = (props: RendererProps) => {
  return <Cell {...props} />;
};

export default CellRenderer;
export { CellRenderer, Cell };
