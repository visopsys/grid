import { Sheet, CellConfig, Cells } from "./Spreadsheet";
import {
  DATATYPE,
  CellDataFormatting,
  BORDER_VARIANT,
  BORDER_STYLE,
  CellFormatting,
} from "./types";
import {
  isNull,
  SelectionArea,
  CellInterface,
  AreaProps,
} from "@rowsncolumns/grid";
import SSF from "ssf";

export const COLUMN_HEADER_WIDTH = 46;
export const FORMULABAR_LEFT_CORNER_WIDTH = 47;
export const ROW_HEADER_HEIGHT = 24;
export const DEFAULT_ROW_HEIGHT = 20;
export const DEFAULT_COLUMN_WIDTH = 100;
export const DARK_MODE_COLOR = "rgb(26, 32, 44)";
export const DARK_MODE_COLOR_LIGHT = "#252E3E";
export const EMPTY_ARRAY = [];
export const HEADER_BORDER_COLOR = "#C0C0C0";
export const CELL_BORDER_COLOR = "#E3E2E2";
export const FORMAT_PERCENT = "#.00";
export const FORMAT_CURRENCY = "$#.00";

/**
 * Number to alphabet
 * @param i
 */
export const number2Alpha = (i: number): string => {
  return (
    (i >= 26 ? number2Alpha(((i / 26) >> 0) - 1) : "") +
    "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
  ).toUpperCase();
};

export const cellLocation = (cell: CellInterface | null): string | null => {
  if (!cell) return null;
  return `${number2Alpha(cell.columnIndex - 1)}${cell.rowIndex}`;
};

/**
 * Create a new sheet
 * @param param0
 */
export const createNewSheet = ({ count }: { count: number }): Sheet => ({
  id: uuid(),
  name: `Sheet${count}`,
  cells: {},
  activeCell: null,
  selections: [],
  scrollState: { scrollTop: 0, scrollLeft: 0 },
  columnSizes: {},
  rowSizes: {},
});

/**
 * UUID generator
 */
export const uuid = () => "_" + Math.random().toString(36).substr(2, 9);

/**
 * Converts a value to string
 * @param value
 */
export const castToString = (value: any): string | undefined => {
  if (value === null || value === void 0) return void 0;
  return typeof value !== "string" ? "" + value : value;
};

/**
 * Format a string
 * @param value
 * @param datatype
 * @param formatting
 *
 * More info https://github.com/SheetJS/ssf
 */
export const format = (
  value: React.ReactText | undefined,
  datatype?: DATATYPE,
  formatting?: CellDataFormatting
): string | undefined => {
  if (value === void 0 || isNull(value) || datatype !== DATATYPE.NUMBER)
    return castToString(value);
  if (!formatting) return castToString(value);
  let num = parseFloat(typeof value !== "string" ? value.toString() : value);
  if (formatting.decimals) {
    let fmt = Array.from({ length: formatting.decimals })
      .map((_, i) => "0")
      .join("");
    value = SSF.format(`#.${fmt}`, num);
  }
  if (formatting.percent) {
    value = SSF.format(FORMAT_PERCENT, num);
  }
  if (formatting.currency) {
    value = SSF.format(FORMAT_CURRENCY, num);
  }
  if (formatting.customFormat) {
    value = SSF.format(formatting.customFormat, num);
  }
  return "" + value;
};

/**
 * Check if a cell is numeric
 */
export const isNumeric = (cell: CellConfig) => {
  return cell && cell.datatype === DATATYPE.NUMBER;
};

/**
 * Detect datatype of a string
 * @param value
 */
export const detectDataType = (value?: any): DATATYPE | undefined => {
  if (isNull(value)) return undefined;
  if (!isNaN(Number(value))) return DATATYPE.NUMBER;
  return undefined;
};

export const createBorderStyle = (
  variant?: BORDER_VARIANT,
  borderStyle: BORDER_STYLE = BORDER_STYLE.THIN,
  color?: string
): CellFormatting => {
  if (variant === void 0) return {};
  const thickness =
    borderStyle === BORDER_STYLE.MEDIUM
      ? 2
      : borderStyle === BORDER_STYLE.THICK
      ? 3
      : 1;
  const dash =
    borderStyle === BORDER_STYLE.DASHED
      ? [3, 2]
      : borderStyle === BORDER_STYLE.DOTTED
      ? [1, 1]
      : [];

  const dashEnabled = dash.length > 0;
  const lineCap = dashEnabled ? "butt" : "square";

  switch (variant) {
    case BORDER_VARIANT.OUTER:
      return {
        stroke: color,
        strokeWidth: thickness,
        strokeDash: dash,
        lineCap,
      };

    case BORDER_VARIANT.BOTTOM:
      return {
        strokeBottomColor: color,
        strokeBottomWidth: thickness,
        strokeBottomDash: dash,
        lineCap,
      };

    case BORDER_VARIANT.RIGHT:
      return {
        strokeRightColor: color,
        strokeRightWidth: thickness,
        strokeRightDash: dash,
        lineCap,
      };

    case BORDER_VARIANT.LEFT:
      return {
        strokeLeftColor: color,
        strokeLeftWidth: thickness,
        strokeLeftDash: dash,
        lineCap,
      };
  }
  return {};
};

/**
 * Lighten or darken colors
 * @param color
 * @param amount
 */
export const luminance = (color: string | undefined, amount: number) => {
  if (!color) return color;
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
};

export const cellsInSelectionVariant = (
  selections: SelectionArea[],
  variant: BORDER_VARIANT | undefined,
  borderStyle: BORDER_STYLE = BORDER_STYLE.THIN,
  color?: string,
  boundGetter?: (coords: CellInterface) => AreaProps
) => {
  const thickness =
    borderStyle === BORDER_STYLE.MEDIUM
      ? 2
      : borderStyle === BORDER_STYLE.THICK
      ? 3
      : 1;
  const dash =
    borderStyle === BORDER_STYLE.DASHED
      ? [2, 2]
      : borderStyle === BORDER_STYLE.DOTTED
      ? [1, 1]
      : [];

  const dashEnabled = dash.length > 0;
  const lineCap = dashEnabled ? "butt" : "square";
  const cells: Cells = {};
  for (let i = 0; i < selections.length; i++) {
    const { bounds } = selections[i];
    for (let j = bounds.top; j <= bounds.bottom; j++) {
      cells[j] = cells[j] ?? {};
      for (let k = bounds.left; k <= bounds.right; k++) {
        cells[j][k] = cells[j][k] || {};
        const actualBounds = boundGetter?.({ rowIndex: j, columnIndex: k });
        const { rowIndex, columnIndex } = actualBounds
          ? { rowIndex: actualBounds.top, columnIndex: actualBounds.left }
          : { rowIndex: j, columnIndex: k };

        switch (variant) {
          case BORDER_VARIANT.OUTER:
            if (j === bounds.top) {
              cells[rowIndex][columnIndex] = {
                ...cells[rowIndex][columnIndex],
                strokeTopColor: color,
                strokeTopWidth: thickness,
                strokeTopDash: dash,
                lineCap,
              };
            }
            if (k === bounds.right) {
              cells[rowIndex][columnIndex] = {
                ...cells[rowIndex][columnIndex],
                strokeRightColor: color,
                strokeRightWidth: thickness,
                strokeRightDash: dash,
                lineCap,
              };
            }
            if (j === bounds.bottom) {
              cells[rowIndex][columnIndex] = {
                ...cells[rowIndex][columnIndex],
                strokeBottomColor: color,
                strokeBottomWidth: thickness,
                strokeBottomDash: dash,
                lineCap,
              };
            }
            if (k === bounds.left) {
              cells[rowIndex][columnIndex] = {
                ...cells[rowIndex][columnIndex],
                strokeLeftColor: color,
                strokeLeftWidth: thickness,
                strokeLeftDash: dash,
                lineCap,
              };
            }
            break;

          case BORDER_VARIANT.ALL:
            cells[rowIndex][columnIndex] = {
              strokeTopColor: color,
              strokeTopWidth: thickness,
              strokeTopDash: dash,
              strokeLeftColor: color,
              strokeLeftWidth: thickness,
              strokeLeftDash: dash,
              strokeRightColor: color,
              strokeRightDash: dash,
              strokeRightWidth: thickness,
              strokeBottomColor: color,
              strokeBottomDash: dash,
              strokeBottomWidth: thickness,
              lineCap,
            };
            break;

          case BORDER_VARIANT.INNER:
            cells[rowIndex][columnIndex] = {
              strokeRightColor: color,
              strokeRightWidth: thickness,
              strokeRightDash: dash,
              strokeBottomColor: color,
              strokeBottomDash: dash,
              strokeBottomWidth: thickness,
              lineCap,
            };
            if (k === bounds.right) {
              cells[rowIndex][columnIndex] = {
                strokeBottomColor: color,
                strokeBottomDash: dash,
                strokeBottomWidth: thickness,
                lineCap,
              };
            }
            if (j === bounds.bottom) {
              const {
                strokeBottomColor,
                strokeBottomDash,
                strokeBottomWidth,
                ...rest
              } = cells[j][k];
              cells[rowIndex][columnIndex] = rest;
            }
            break;

          case BORDER_VARIANT.HORIZONTAL:
            cells[rowIndex][columnIndex] = {
              strokeBottomColor: color,
              strokeBottomDash: dash,
              strokeBottomWidth: thickness,
              lineCap,
            };
            if (j === bounds.bottom) {
              cells[rowIndex][columnIndex] = {};
            }
            break;

          case BORDER_VARIANT.VERTICAL:
            cells[rowIndex][columnIndex] = {
              strokeRightColor: color,
              strokeRightDash: dash,
              strokeRightWidth: thickness,
              lineCap,
            };
            if (k === bounds.right) {
              cells[rowIndex][columnIndex] = {};
            }
            break;

          case BORDER_VARIANT.LEFT:
            if (k === bounds.left) {
              cells[rowIndex][columnIndex] = {
                strokeLeftColor: color,
                strokeLeftDash: dash,
                strokeLeftWidth: thickness,
                lineCap,
              };
            }
            break;

          case BORDER_VARIANT.RIGHT:
            if (k === bounds.right) {
              cells[rowIndex][columnIndex] = {
                strokeRightColor: color,
                strokeRightDash: dash,
                strokeRightWidth: thickness,
                lineCap,
              };
            }
            break;

          case BORDER_VARIANT.TOP:
            if (j === bounds.top) {
              cells[rowIndex][columnIndex] = {
                strokeTopColor: color,
                strokeTopDash: dash,
                strokeTopWidth: thickness,
                lineCap,
              };
            }
            break;

          case BORDER_VARIANT.BOTTOM:
            if (j === bounds.bottom) {
              cells[rowIndex][columnIndex] = {
                strokeBottomColor: color,
                strokeBottomDash: dash,
                strokeBottomWidth: thickness,
                lineCap,
              };
            }
            break;
        }
      }
    }
  }
  return cells;
};
