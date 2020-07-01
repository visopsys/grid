import React, { memo } from "react";
import { RendererProps, isNull } from "@rowsncolumns/grid";
import {
  DARK_MODE_COLOR,
  DARK_MODE_COLOR_LIGHT,
  format as defaultFormat,
  luminance
} from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION,
  VERTICAL_ALIGNMENT
} from "./../types";
import { useColorMode, useTheme } from "@chakra-ui/core";
import { CellConfig } from "../Spreadsheet";
import { Shape, Text } from "react-konva";

export interface CellProps extends RendererProps, CellConfig {
  text?: string;
  isHidden?: boolean;
}

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = memo(props => {
  const { colorMode } = useColorMode();
  const {
    datatype,
    decimals,
    percent,
    currency,
    format = defaultFormat,
    isHidden
  } = props;
  if (isHidden) return null;
  const text = format(props.text, datatype, { decimals, percent, currency });
  const isLightMode = colorMode === "light";

  return <CellComponent {...props} text={text} isLightMode={isLightMode} />;
});

const CellComponent: React.FC<CellProps> = memo(props => {
  const {
    x = 0,
    y = 0,
    width,
    height,
    isMergedCell,
    stroke,
    strokeTopColor = stroke,
    strokeRightColor = stroke,
    strokeBottomColor = stroke,
    strokeLeftColor = stroke,
    strokeDash = [],
    strokeTopDash = strokeDash,
    strokeRightDash = strokeDash,
    strokeBottomDash = strokeDash,
    strokeLeftDash = strokeDash,
    strokeWidth = 1,
    strokeTopWidth = strokeWidth,
    strokeRightWidth = strokeWidth,
    strokeBottomWidth = strokeWidth,
    strokeLeftWidth = strokeWidth,
    fill: userFill,
    datatype,
    color: userColor,
    formatting,
    italic,
    bold,
    horizontalAlign,
    verticalAlign = VERTICAL_ALIGNMENT.BOTTOM,
    underline,
    strike,
    decimals,
    percent,
    currency,
    format = defaultFormat,
    isHidden,
    fontFamily,
    padding = 5,
    fontSize = 12,
    wrap = "none",
    lineCap = "square",
    lineHeight = 0.6,
    isLightMode,
    text
  } = props;
  const textDecoration = `${underline ? TEXT_DECORATION.UNDERLINE + " " : ""}${
    strike ? TEXT_DECORATION.STRIKE : ""
  }`;
  const fontWeight = bold ? FONT_WEIGHT.BOLD : FONT_WEIGHT.NORMAL;
  const fontStyle = italic ? FONT_STYLE.ITALIC : FONT_STYLE.NORMAL;
  const textStyle = `${fontWeight} ${fontStyle}`;
  const vAlign = verticalAlign;
  const hAlign =
    horizontalAlign === void 0
      ? datatype === DATATYPE.NUMBER
        ? HORIZONTAL_ALIGNMENT.RIGHT
        : HORIZONTAL_ALIGNMENT.LEFT
      : horizontalAlign;
  const defaultFill = isLightMode ? "white" : DARK_MODE_COLOR_LIGHT;
  const textColor = userColor ? userColor : isLightMode ? "#333" : "white";
  const showRect = !isNull(userFill) || isMergedCell;
  const userStroke =
    strokeTopColor || strokeRightColor || strokeBottomColor || strokeLeftColor;
  const hasFill = !isNull(userFill);
  const hasStroke = !isNull(userStroke) || hasFill;
  const hasText = !isNull(text);
  return (
    <>
      {showRect ? (
        <Shape
          x={x}
          y={y}
          width={width}
          height={height}
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.setAttr("fillStyle", userFill || defaultFill);
            context.fillRect(1, 1, shape.width() - 1, shape.height() - 1);
          }}
        />
      ) : null}
      {hasStroke ? (
        <Shape
          x={x}
          y={y}
          width={width}
          height={height}
          sceneFunc={(context, shape) => {
            if (hasFill) {
              context.setAttr("strokeStyle", luminance(userFill, -20));
              context.strokeRect(0.5, 0.5, shape.width(), shape.height());
            }
            if (userStroke) {
              /* Top border */
              if (strokeTopColor) {
                context.beginPath();
                context.moveTo(0.5, 0.5);
                context.lineTo(shape.width(), 0.5);
                context.setAttr("strokeStyle", strokeTopColor);
                context.setAttr("lineWidth", strokeTopWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeTopDash);
                context.stroke();
              }
              /* Right border */
              if (strokeRightColor) {
                context.beginPath();
                context.moveTo(shape.width() + 0.5, 0.5);
                context.lineTo(shape.width() + 0.5, shape.height() + 0.5);
                context.setAttr("strokeStyle", strokeRightColor);
                context.setAttr("lineWidth", strokeRightWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeRightDash);
                context.stroke();
              }
              /* Bottom border */
              if (strokeBottomColor) {
                context.beginPath();
                context.moveTo(shape.width() + 0.5, shape.height() + 0.5);
                context.lineTo(0.5, shape.height() + 0.5);
                context.setAttr("lineWidth", strokeBottomWidth);
                context.setAttr("strokeStyle", strokeBottomColor);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeBottomDash);
                context.stroke();
              }
              /* Left border */
              if (strokeLeftColor) {
                context.beginPath();
                context.moveTo(0.5, shape.height() + 0.5);
                context.lineTo(0.5, 0.5);
                context.setAttr("strokeStyle", strokeLeftColor);
                context.setAttr("lineWidth", strokeLeftWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeLeftDash);
                context.stroke();
              }
            }
          }}
        />
      ) : null}
      {hasText ? (
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
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
        />
      ) : null}
    </>
  );
});

export default Cell;
