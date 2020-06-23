import React from "react";
import { Cell as DefaultCell, RendererProps, isNull } from "@rowsncolumns/grid";
import { DARK_MODE_COLOR, DARK_MODE_COLOR_LIGHT } from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION
} from "./../types";
import { useColorMode, useTheme } from "@chakra-ui/core";
import { CellConfig } from "../Spreadsheet";

export interface CellProps extends RendererProps, CellConfig {
  text?: string;
}

// export const format = (
//   value?: string,
//   datatype?: DATATYPE,
//   formatting?: Formatting
// ): string | undefined => {
//   if (value == void 0 || datatype !== DATATYPE.NUMBER) return value;
//   if (!formatting) return value;
//   let num = parseFloat(value);
//   if (formatting.decimals) {
//     value = num.toFixed(formatting.decimals);
//   }
//   if (formatting.percent) {
//     value = (num * 100).toFixed(2);
//   }
//   return "" + value;
// };

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = props => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const {
    fill: userFill,
    datatype,
    color: userColor,
    formatting,
    italic,
    bold,
    text,
    horizontalAlignment,
    verticalAlignment,
    underline,
    strike
  } = props;
  const fontWeight = bold ? FONT_WEIGHT.BOLD : FONT_WEIGHT.NORMAL;
  const fontStyle = italic ? FONT_STYLE.ITALIC : FONT_STYLE.NORMAL;
  const verticalAlign = verticalAlignment;
  const horizontalAlign =
    horizontalAlignment === void 0
      ? datatype === DATATYPE.NUMBER
        ? HORIZONTAL_ALIGNMENT.RIGHT
        : HORIZONTAL_ALIGNMENT.LEFT
      : horizontalAlignment;
  const textDecoration = `${underline ? TEXT_DECORATION.UNDERLINE + " " : ""}${
    strike ? TEXT_DECORATION.STRIKE : ""
  }`;
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
      fontWeight={fontWeight}
      fontStyle={fontStyle}
      verticalAlign={verticalAlign}
      fill={fill}
      stroke={stroke}
      textColor={textColor}
      value={text}
      align={horizontalAlign}
      textDecoration={textDecoration}
    />
  );
};

export default Cell;
