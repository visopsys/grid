import React from "react";
import { Cell as DefaultCell, RendererProps } from "@rowsncolumns/grid";
import { DARK_MODE_COLOR, DARK_MODE_COLOR_LIGHT } from "../constants";
import { useColorMode, useTheme } from "@chakra-ui/core";

export interface CellProps extends RendererProps {
  text?: string;
}

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = (props) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const { text, fill: userFill, color: userColor } = props;
  const isLightMode = colorMode === "light";
  const fill = userFill
    ? userFill
    : isLightMode
    ? "white"
    : DARK_MODE_COLOR_LIGHT;
  const stroke = isLightMode ? theme.colors.gray[300] : theme.colors.gray[600];
  const textColor = userColor ? userColor : isLightMode ? "#333" : "white";
  return (
    <DefaultCell
      {...props}
      fill={fill}
      stroke={stroke}
      textColor={textColor}
      value={text}
    />
  );
};

export default Cell;
