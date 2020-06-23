
export enum FORMATTING_TYPE {
  BOLD = "bold",
  ITALIC = "italic",
  HORIZONTAL_ALIGN = "horizontalAlign",
  VERTICAL_ALIGN = "verticalAlign",
  STRIKE = 'strike',
  UNDERLINE = 'underline',
  FILL = 'fill',
  COLOR = 'color',
}

export enum FONT_WEIGHT {
  BOLD = "bold",
  NORMAL = "normal"
}

export enum FONT_STYLE {
  ITALIC = "italic",
  NORMAL = "normal"
}

export enum TEXT_DECORATION {
  STRIKE = "line-through",
  NONE = "",
  UNDERLINE = 'underline'
}

export enum VERTICAL_ALIGNMENT {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom'
}

export enum HORIZONTAL_ALIGNMENT {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}


export enum DATATYPE {
  NUMBER = "number",
  STRING = "string"
}

export interface CellFormatting {
  datatype?: DATATYPE;
  [FORMATTING_TYPE.BOLD]?: boolean;
  [FORMATTING_TYPE.COLOR]?: string;
  italic?: boolean;
  horizontalAlignment?: HORIZONTAL_ALIGNMENT
  verticalAlignment?: VERTICAL_ALIGNMENT;
  underline?: boolean;
  strike?: boolean;
  fill?: string;
  percent?: boolean;
  decimals?: number
}