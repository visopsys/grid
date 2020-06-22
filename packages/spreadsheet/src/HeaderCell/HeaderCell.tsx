import React from "react";
import { Cell, RendererProps } from "@rowsncolumns/grid";
import {
  number2Alpha,
  DARK_MODE_COLOR,
  DARK_MODE_COLOR_LIGHT,
} from "../constants";
import { useColorMode, useTheme } from "@chakra-ui/core";

interface HeaderCellProps extends RendererProps {
  isActive?: boolean;
}

const HeaderCell: React.FC<HeaderCellProps> = (props) => {
  const { rowIndex, columnIndex, isActive } = props;
  const isCorner = rowIndex === columnIndex;
  const value = isCorner
    ? ""
    : rowIndex === 0
    ? number2Alpha(columnIndex - 1)
    : rowIndex.toString();
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const isLightMode = colorMode === "light";
  const fill = isLightMode
    ? isActive
      ? "#E9EAED"
      : "#F8F9FA"
    : isActive
    ? theme.colors.gray[700]
    : DARK_MODE_COLOR;
  const textColor = isLightMode ? "#333" : "white";
  const stroke = isLightMode ? theme.colors.gray[400] : theme.colors.gray[600];
  return (
    <Cell
      {...props}
      fill={fill}
      align="center"
      value={value}
      textColor={textColor}
      stroke={stroke}
      fontSize={11}
    />
  );
};

export default HeaderCell;
