import React, { useState, useCallback } from "react";
import { Group, Rect, Path } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";
import { KonvaEventObject } from "konva/types/Node";
import { CellInterface } from "@rowsncolumns/grid";

export const FILTER_ICON_DIM = 16;

export interface FilterIconProps extends ShapeConfig {
  rowIndex: number;
  columnIndex: number;
  onClick?: (event: KonvaEventObject<MouseEvent>, cell: CellInterface) => void;
}

/**
 * Filter icon
 * @param param0
 */
const FilterIcon: React.FC<FilterIconProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  rowIndex,
  columnIndex,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const padding = (height - FILTER_ICON_DIM) / 2;
  const posX = x + width - FILTER_ICON_DIM - padding + 0.5;
  const posY = y + padding + 0.5;
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    onClick?.(e, { rowIndex, columnIndex });
  };
  return (
    <Group
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect
        x={posX}
        y={posY}
        width={FILTER_ICON_DIM}
        height={FILTER_ICON_DIM}
        fill={isHovered ? "green" : "white"}
        cornerRadius={2}
      />
      <Path
        data="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
        x={posX + 1}
        y={posY}
        fill={isHovered ? "white" : "green"}
        scaleY={0.6}
        scaleX={0.6}
        listening={false}
      />
    </Group>
  );
};

export default FilterIcon;
