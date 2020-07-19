import React, { memo, useCallback } from "react";
import { RendererProps, isNull, CellInterface } from "@rowsncolumns/grid";
import {
  DARK_MODE_COLOR_LIGHT,
  luminance,
  DEFAULT_FONT_SIZE,
  castToString,
  INVALID_COLOR
} from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION,
  VERTICAL_ALIGNMENT,
  FormatType
} from "./../types";
import { CellConfig } from "../Spreadsheet";
import { Shape, Text, Arrow } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";
import FilterIcon from "./../FilterIcon";
import ListArrow from "./../ListArrow";
import Checkbox from "./../Checkbox";

import { FILTER_ICON_DIM } from "../FilterIcon/FilterIcon";

export interface CellProps extends RendererProps, CellConfig {
  formatter?: FormatType;
  showStrokeOnFill?: boolean;
  isSelected?: boolean;
  isLightMode?: boolean;
  showFilter?: boolean;
  isFilterActive?: boolean;
  onFilterClick?: (cell: CellInterface) => void;
  onEdit?: (cell: CellInterface) => void;
  onCheck?: (cell: CellInterface, value: boolean) => void;
}

export interface CellRenderProps extends Omit<CellProps, "text"> {
  text?: string;
  showStrokeOnFill?: boolean;
  isSelected?: boolean;
  selectionFill?: string;
}

const DEFAULT_WRAP = "none";
const ERROR_TAG_WIDTH = 6.5;

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = memo(props => {
  const {
    datatype,
    decimals,
    percent,
    currency,
    formatter,
    isLightMode
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
    dataValidation,
    ...cellProps
  } = props;
  const cellType = dataValidation?.type;
  const checked =
    cellType === "boolean"
      ? props.text === dataValidation?.formulae?.[0]
      : false;
  const text = formatter
    ? formatter(props.text, datatype, {
        decimals,
        percent,
        currency,
        format,
        currencySymbol
      })
    : castToString(props.text);
  return (
    <DefaultCell
      isLightMode={isLightMode}
      {...cellProps}
      text={text}
      type={cellType}
      checked={checked}
    />
  );
});

/**
 * Default cell renderer
 */
const DefaultCell: React.FC<CellRenderProps> = memo(props => {
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
    verticalAlign = VERTICAL_ALIGNMENT.BOTTOM,
    underline,
    strike,
    fontFamily,
    padding = 4,
    fontSize = DEFAULT_FONT_SIZE,
    wrap = DEFAULT_WRAP,
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
    scale,
    rotation,
    valid,
    type,
    onEdit,
    checked,
    onCheck
  } = props;
  const isBoolean = datatype === DATATYPE.Boolean;
  const textWrap = wrap === "wrap" ? "word" : DEFAULT_WRAP;
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
  /* Because of 1px + 0.5px (gridline width + spacing )*/
  const cellSpacingY = 1.5;
  const cellSpacingX = 1;
  const showArrow = type === "list";
  const textWidth =
    showFilter || showArrow
      ? width - FILTER_ICON_DIM - cellSpacingX
      : width - cellSpacingX;
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
    [hasFill, userFill, isSelected, defaultFill]
  );
  return (
    <>
      {showRect ? (
        <Shape
          visible={showRect}
          x={x}
          y={y}
          width={width}
          height={height}
          sceneFunc={fillFunc}
        />
      ) : null}
      {isBoolean ? (
        <Checkbox
          x={x}
          y={y}
          width={width}
          height={height}
          checked={checked}
          onChange={onCheck}
          rowIndex={props.rowIndex}
          columnIndex={props.columnIndex}
        />
      ) : hasText ? (
        <Text
          visible={hasText}
          x={x + cellSpacingX}
          y={y + cellSpacingY}
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
          wrap={textWrap}
          fontSize={fontSize * scale}
          lineHeight={lineHeight}
          hitStrokeWidth={0}
          perfectDrawEnabled={false}
          listening={false}
          rotation={rotation}
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
      ) : showArrow ? (
        <ListArrow
          onClick={onEdit}
          rowIndex={props.rowIndex}
          columnIndex={props.columnIndex}
          x={x}
          y={y}
          height={height}
          width={width}
        />
      ) : null}
      {valid === false ? (
        <ErrorTag x={x + width - ERROR_TAG_WIDTH} y={y + 1} />
      ) : null}
    </>
  );
});

/**
 * Error tag
 * @param param0
 */
export const ErrorTag: React.FC<ShapeConfig> = ({
  x,
  y,
  color = INVALID_COLOR
}) => {
  return (
    <Shape
      x={x}
      y={y}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.setAttr("fillStyle", color);
        context.moveTo(0, 0);
        context.lineTo(ERROR_TAG_WIDTH, 0);
        context.lineTo(ERROR_TAG_WIDTH, ERROR_TAG_WIDTH);
        context.closePath();
        context.fill();
      }}
    />
  );
};

export default Cell;
