import { Sheet } from "./Spreadsheet";

export const COLUMN_HEADER_WIDTH = 46;
export const ROW_HEADER_HEIGHT = 24;
export const DEFAULT_ROW_HEIGHT = 20;
export const DEFAULT_COLUMN_WIDTH = 100;
export const DARK_MODE_COLOR = "rgb(26, 32, 44)";
export const DARK_MODE_COLOR_LIGHT = "#252E3E";

export const number2Alpha = (i: number): string => {
  return (
    (i >= 26 ? number2Alpha(((i / 26) >> 0) - 1) : "") +
    "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
  ).toUpperCase();
};

export const createNewSheet = ({ count }: { count: number }): Sheet => ({
  id: uuid(),
  name: `Sheet${count}`,
  cells: {},
  activeCell: null,
  selections: [],
  scrollState: { scrollTop: 0, scrollLeft: 0 },
});

export enum FORMATTING {
  FONT_STYLE = "fontStyle",
  FONT_WEIGHT = "fontWeight",
  TEXT_DECORATION = "textDecoration",
}

export enum FONT_WEIGHT {
  BOLD = "bold",
  NORMAL = "normal",
}

export enum FONT_STYLE {
  ITALIC = "italic",
  NORMAL = "normal",
}

export enum TEXT_DECORATION {
  STRIKE = "line-through",
  NONE = "",
}

export const uuid = () => "_" + Math.random().toString(36).substr(2, 9);
