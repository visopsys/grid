// @ts-nocheck
import React, { memo } from "react";
import { RendererProps } from "./Grid";
// import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/types/Node";
import { isNull } from "./helpers";
import { Graphics, Text } from "pixi.js";
import { PixiComponent } from "@inlet/react-pixi";

const Rectangle = PixiComponent("Rectangle", {
  create: (props) => new Graphics(),
  applyProps: (instance, oldProps, props) => {
    const { x, y, width, height, fill, alpha } = props;

    if (
      x !== oldProps.x ||
      y !== oldProps.y ||
      width !== oldProps.width ||
      height !== oldProps.height ||
      fill !== oldProps.fill
    ) {
      instance.clear();
      instance.lineStyle(0.5, 0xaaaaaa);
      instance.beginFill(0xffffff);
      instance.drawRect(x, y, width, height);
      instance.endFill();
      instance.isFastRect(true);
    }

    if (alpha !== oldProps.alpha) {
      instance.alpha = alpha;
    }
  },
});

const FastText = PixiComponent("FastText", {
  create: (props) => {
    const style = {
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fill: props.fill,
      padding: props.padding,
    };
    return new Text(props.text, style);
  },
  applyProps: (instance, oldProps, props) => {
    const { x, y, text, fontSize, padding } = props;

    if (x !== oldProps.x || y !== oldProps.y) {
      instance.x = x;
      instance.y = y;
    }

    if (text !== oldProps.text) {
      instance.text = text;
    }

    if (fontSize !== oldProps.fontSize) {
      instance.style.fontSize = fontSize;
    }
  },
});

export interface CellProps extends RendererProps {
  value?: string;
  textColor?: string;
  padding?: number;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
}

/**
 * Default cell component
 * @param props
 */
const Cell: React.FC<CellProps> = memo((props) => {
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
    padding = 5,
    fontFamily = "Arial, sans-serif",
    fontSize = 12,
    children,
    wrap = "none",
    ...rest
  } = props;
  // value = value || `${props.rowIndex}x${props.columnIndex}`
  return (
    <>
      <Rectangle
        x={x}
        y={y}
        height={height}
        width={width}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        shadowForStrokeEnabled={false}
        hitStrokeWidth={0}
      />
      {isNull(value) ? null : (
        <FastText
          x={x}
          y={y}
          height={height}
          width={width}
          text={value}
          fill={textColor}
          verticalAlign={verticalAlign}
          align={align}
          fontFamily={fontFamily}
          fontSize={fontSize}
          padding={padding}
          wrap={wrap}
          hitStrokeWidth={0}
        />
      )}
      {children}
    </>
  );
});

/**
 * Default CellRenderer
 * @param props
 */
const CellRenderer = (props: RendererProps) => {
  return <Cell {...props} />;
};

export default CellRenderer;
export { CellRenderer, Cell };
