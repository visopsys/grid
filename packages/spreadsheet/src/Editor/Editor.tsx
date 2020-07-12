import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { EditorProps } from "@rowsncolumns/grid/dist/hooks/useEditable";
import { AutoSizerCanvas } from "@rowsncolumns/grid";
import { KeyCodes, Direction } from "@rowsncolumns/grid/dist/types";
import { useColorMode } from "@chakra-ui/core";
import {
  DARK_MODE_COLOR_LIGHT,
  cellAddress,
  DEFAULT_FONT_FAMILY,
} from "../constants";
import { HORIZONTAL_ALIGNMENT } from "../types";

export interface CustomEditorProps extends EditorProps {
  background?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  wrap?: any;
  horizontalAlign?: any;
}

/**
 * Default cell editor
 * @param props
 */
const Editor: React.FC<CustomEditorProps> = (props) => {
  const {
    rowIndex,
    columnIndex,
    onChange,
    onSubmit,
    onCancel,
    position,
    cell,
    nextFocusableCell,
    value = "",
    activeCell,
    autoFocus = true,
    background: cellBackground,
    color: cellColor,
    fontSize: cellFontSize = 12,
    fontFamily: cellFontFamily = DEFAULT_FONT_FAMILY,
    wrap: cellWrap = "nowrap",
    selections,
    scrollPosition,
    horizontalAlign,
    ...rest
  } = props;
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";
  const backgroundColor =
    cellBackground !== void 0
      ? cellBackground
      : isLight
      ? "white"
      : DARK_MODE_COLOR_LIGHT;
  const color =
    cellColor !== void 0
      ? cellColor
      : isLight
      ? DARK_MODE_COLOR_LIGHT
      : "white";
  const borderWidth = 2;
  const padding = 10; /* 2 + 1 + 1 + 2 + 2 */
  const hasScrollPositionChanged = useRef(false);
  const isMounted = useRef(false);
  const textSizer = useRef(AutoSizerCanvas());
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { x = 0, y = 0, width = 0, height = 0 } = position;
  const getWidth = useCallback(
    (text) => {
      /*  Set font */
      textSizer.current.setFont({
        fontSize: cellFontSize,
        fontFamily: cellFontFamily,
      });

      const textWidth = textSizer.current.measureText(text)?.width || 0;
      return Math.max(textWidth + padding, width + borderWidth / 2);
    },
    [width, cellFontSize, cellFontFamily, cellWrap]
  );
  useEffect(() => {
    setInputWidth(getWidth(value));
  }, [value]);
  const [inputWidth, setInputWidth] = useState(() => getWidth(value));
  useEffect(() => {
    if (!isMounted.current) return;
    hasScrollPositionChanged.current = true;
  }, [scrollPosition]);
  useEffect(() => {
    /* Set mounted ref */
    isMounted.current = true;
    if (!inputRef.current) return;
    if (autoFocus) inputRef.current.focus();
    /* Focus cursor at the end */
    inputRef.current.selectionStart = value.length;
  }, []);
  const address = useMemo(
    () => hasScrollPositionChanged.current && cellAddress(activeCell),
    [activeCell, hasScrollPositionChanged.current]
  );
  const inputHeight = height;
  return (
    <div
      style={{
        top: y,
        left: x,
        position: "absolute",
        width: inputWidth,
        height: inputHeight + borderWidth / 2,
        padding: borderWidth,
        boxShadow: "0 2px 6px 2px rgba(60,64,67,.15)",
        border: "2px #1a73e8 solid",
        background: backgroundColor,
      }}
    >
      {address ? (
        <div
          style={{
            position: "absolute",
            left: -2,
            marginBottom: 4,
            fontSize: 12,
            lineHeight: "14px",
            padding: 6,
            paddingTop: 4,
            paddingBottom: 4,
            boxShadow: "0px 1px 2px rgba(0,0,0,0.5)",
            bottom: "100%",
            background: "#4589eb",
            color: "white",
          }}
        >
          {address}
        </div>
      ) : null}
      <textarea
        rows={1}
        cols={1}
        ref={inputRef}
        value={value}
        style={{
          fontFamily: cellFontFamily,
          fontSize: cellFontSize,
          // lineHeight: 1.2,
          width: "100%",
          height: "100%",
          padding: "0 1px",
          margin: 0,
          boxSizing: "border-box",
          borderWidth: 0,
          outline: "none",
          resize: "none",
          overflow: "hidden",
          verticalAlign: "top",
          background: "transparent",
          color: color,
          whiteSpace: cellWrap,
          textAlign: horizontalAlign,
        }}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e.target.value, cell);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (!inputRef.current) return;
          const isShiftKey = e.nativeEvent.shiftKey;
          const value = inputRef.current.value;

          // Enter key
          if (e.which === KeyCodes.Enter) {
            onSubmit &&
              onSubmit(
                value,
                cell,
                nextFocusableCell(
                  cell,
                  isShiftKey ? Direction.Up : Direction.Down
                )
              );
          }

          if (e.which === KeyCodes.Escape) {
            onCancel && onCancel(e);
          }

          if (e.which === KeyCodes.Tab) {
            // e.preventDefault();
            onSubmit &&
              onSubmit(
                value,
                cell,
                nextFocusableCell(
                  cell,
                  isShiftKey ? Direction.Left : Direction.Right
                )
              );
          }
        }}
        {...rest}
      />
    </div>
  );
};

export default Editor;
