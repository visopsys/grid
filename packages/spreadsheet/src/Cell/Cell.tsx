import React, { memo } from "react";
import { Cell as DefaultCell, RendererProps, isNull } from "@rowsncolumns/grid";
import {
  DARK_MODE_COLOR,
  DARK_MODE_COLOR_LIGHT,
  format as defaultFormat,
} from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION,
} from "./../types";
import { useColorMode, useTheme } from "@chakra-ui/core";
import { CellConfig } from "../Spreadsheet";

export interface CellProps extends RendererProps, CellConfig {
  text?: string;
}

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = memo((props) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const {
    fill: userFill,
    datatype,
    color: userColor,
    formatting,
    italic,
    bold,
    horizontalAlign,
    verticalAlign,
    underline,
    strike,
    decimals,
    percent,
    currency,
    format = defaultFormat,
    globalCompositeOperation
  } = props;
  const fontWeight = bold ? FONT_WEIGHT.BOLD : FONT_WEIGHT.NORMAL;
  const fontStyle = italic ? FONT_STYLE.ITALIC : FONT_STYLE.NORMAL;
  const text = format(props.text, datatype, { decimals, percent, currency });
  const vAlign = verticalAlign;
  const hAlign =
    horizontalAlign === void 0
      ? datatype === DATATYPE.NUMBER
        ? HORIZONTAL_ALIGNMENT.RIGHT
        : HORIZONTAL_ALIGNMENT.LEFT
      : horizontalAlign;
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
      verticalAlign={vAlign}
      fill={fill}
      globalCompositeOperation={globalCompositeOperation !== void 0 ? globalCompositeOperation : isLightMode ? 'multiply': 'destination-over'}
      stroke={stroke}
      textColor={textColor}
      value={text}
      align={hAlign}
      textDecoration={textDecoration}
    />
  );
});

export default Cell;
