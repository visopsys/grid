import { Sheet } from "./Spreadsheet";
import { DATATYPE, CellDataFormatting } from "./types";
import { isNull } from "@rowsncolumns/grid";

export const COLUMN_HEADER_WIDTH = 46;
export const ROW_HEADER_HEIGHT = 24;
export const DEFAULT_ROW_HEIGHT = 20;
export const DEFAULT_COLUMN_WIDTH = 100;
export const DARK_MODE_COLOR = "rgb(26, 32, 44)";
export const DARK_MODE_COLOR_LIGHT = "#252E3E";

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
  rowSizes: {}
});

/**
 * UUID generator
 */
export const uuid = () =>
  "_" +
  Math.random()
    .toString(36)
    .substr(2, 9);

/**
 * Format a string
 * @param value 
 * @param datatype 
 * @param formatting 
 */
export const format = (
  value?: string,
  datatype?: DATATYPE,
  formatting?: CellDataFormatting
): string | undefined => {
  if (value === void 0 || isNull(value) || datatype !== DATATYPE.NUMBER) return value;
  if (!formatting) return value;
  let num = parseFloat(value);
  if (formatting.decimals) {
    value = num.toFixed(formatting.decimals);
  }
  if (formatting.percent) {
    value = (num * 100).toFixed(2);
  }
  if (formatting.currency) {
    value = `${formatting.currencySymbol || '$'}${num.toFixed(2)}`;
  }
  return "" + value;
};

/**
 * Detect datatype of a string
 * @param value 
 */
export const detectDataType = (value?: string): DATATYPE | undefined => {
  if (isNull(value)) return undefined
  if (!isNaN(Number(value))) return DATATYPE.NUMBER
  return undefined
}