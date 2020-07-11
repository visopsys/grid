import React, { memo, useCallback } from "react";
import { RendererProps, isNull, CellInterface } from "@rowsncolumns/grid";
import {
  DARK_MODE_COLOR_LIGHT,
  luminance,
  DEFAULT_FONT_SIZE,
  castToString,
} from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION,
  VERTICAL_ALIGNMENT,
  FormatType,
} from "./../types";
import { CellConfig } from "../Spreadsheet";
import { Shape, Text } from "react-konva";
import FilterIcon from "./../FilterIcon";
import { FILTER_ICON_DIM } from "../FilterIcon/FilterIcon";

export interface CellProps extends RendererProps, CellConfig {
  formatter?: FormatType;
  showStrokeOnFill?: boolean;
  isSelected?: boolean;
  isLightMode?: boolean;
  showFilter?: boolean;
  isFilterActive?: boolean;
  onFilterClick?: (cell: CellInterface) => void;
}

export interface CellRenderProps extends Omit<CellProps, "text"> {
  text?: string;
  showStrokeOnFill?: boolean;
  isSelected?: boolean;
  selectionFill?: string;
}

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = memo((props) => {
  const {
    datatype,
    decimals,
    percent,
    currency,
    formatter,
    isLightMode,
  } = props;
  const {
    stroke,
    strokeTopColor,
    strokeRightColor,
    strokeBottomColor,
    strokeLeftColor,
    strokeDash,
    strokeTopDash,
    strokeRightDash,
    strokeBottomDash,
    strokeLeftDash,
    strokeWidth,
    strokeTopWidth,
    strokeRightWidth,
    strokeBottomWidth,
    strokeLeftWidth,
    lineCap,
    format,
    currencySymbol,
    ...cellProps
  } = props;
  const text = formatter
    ? formatter(props.text, datatype, {
        decimals,
        percent,
        currency,
        format,
        currencySymbol,
      })
    : castToString(props.text);
  return <DefaultCell isLightMode={isLightMode} {...cellProps} text={text} />;
});

/**
 * Default cell renderer
 */
const DefaultCell: React.FC<CellRenderProps> = memo((props) => {
  const {
    x = 0,
    y = 0,
    width,
    height,
    isMergedCell,
    fill,
    datatype,
    color: userColor,
    italic,
    bold,
    horizontalAlign,
    verticalAlign = VERTICAL_ALIGNMENT.TOP,
    underline,
    strike,
    fontFamily,
    padding = 4,
    fontSize = DEFAULT_FONT_SIZE,
    wrap = "none",
    lineHeight = 1,
    isLightMode,
    text,
    showStrokeOnFill = true,
    isSelected,
    selectionFill = "rgb(14, 101, 235, 0.1)",
    plaintext,
    showFilter,
    isFilterActive,
    onFilterClick,
  } = props;
  const textDecoration = `${underline ? TEXT_DECORATION.UNDERLINE + " " : ""}${
    strike ? TEXT_DECORATION.STRIKE : ""
  }`;
  const userFill = isSelected ? selectionFill : fill;
  const fontWeight = bold ? FONT_WEIGHT.BOLD : FONT_WEIGHT.NORMAL;
  const fontStyle = italic ? FONT_STYLE.ITALIC : FONT_STYLE.NORMAL;
  const textStyle = `${fontWeight} ${fontStyle}`;
  const vAlign = verticalAlign;
  const hAlign =
    horizontalAlign === void 0
      ? datatype === DATATYPE.Number && !plaintext
        ? HORIZONTAL_ALIGNMENT.RIGHT
        : HORIZONTAL_ALIGNMENT.LEFT
      : horizontalAlign;
  const defaultFill = isLightMode ? "white" : DARK_MODE_COLOR_LIGHT;
  const textColor = userColor ? userColor : isLightMode ? "#333" : "white";
  const showRect = !isNull(userFill) || isMergedCell;
  const hasFill = !isNull(userFill) || isSelected;
  const hasText = !isNull(text);
  const textWidth = showFilter ? width - FILTER_ICON_DIM : width;
  /* Because of 1px + 0.5px (gridline width + spacing )*/
  const cellSpacingAdjustment = 1.5;
  /**
   * Fill function
   */
  const fillFunc = useCallback(
    (context, shape) => {
      context.beginPath();
      context.setAttr("fillStyle", userFill || defaultFill);
      context.fillRect(1, 1, shape.width() - 1, shape.height() - 1);
      if (hasFill) {
        context.setAttr(
          "strokeStyle",
          showStrokeOnFill ? luminance(userFill, -20) : userFill
        );
        context.strokeRect(0.5, 0.5, shape.width(), shape.height());
      }
    },
    [hasFill, userFill, isSelected]
  );
  return (
    <>
      {showRect ? (
        <Shape x={x} y={y} width={width} height={height} sceneFunc={fillFunc} />
      ) : null}
      {hasText ? (
        <Text
          x={x + cellSpacingAdjustment}
          y={y + cellSpacingAdjustment}
          height={height}
          width={textWidth}
          text={text}
          fill={textColor}
          verticalAlign={vAlign}
          align={hAlign}
          fontFamily={fontFamily}
          fontStyle={textStyle}
          textDecoration={textDecoration}
          padding={padding}
          wrap={wrap}
          fontSize={fontSize}
          lineHeight={lineHeight}
          hitStrokeWidth={0}
          perfectDrawEnabled={false}
          listening={false}
        />
      ) : null}
      {showFilter ? (
        <FilterIcon
          isActive={isFilterActive}
          onClick={onFilterClick}
          rowIndex={props.rowIndex}
          columnIndex={props.columnIndex}
          x={x}
          y={y}
          height={height}
          width={width}
        />
      ) : null}
    </>
  );
});

export default Cell;
