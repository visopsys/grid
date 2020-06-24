
export enum FORMATTING_TYPE {
  BOLD = "bold",
  ITALIC = "italic",
  HORIZONTAL_ALIGN = "horizontalAlign",
  VERTICAL_ALIGN = "verticalAlign",
  STRIKE = 'strike',
  UNDERLINE = 'underline',
  FILL = 'fill',
  COLOR = 'color',
  PERCENT = 'percent',
  DECIMALS = 'decimals',
  CURRENCY = 'currency',
  CURRENCY_SYMBOL = 'currencySymbol'
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

export interface CellFormatting extends CellDataFormatting {
  datatype?: DATATYPE;
  [FORMATTING_TYPE.BOLD]?: boolean;
  [FORMATTING_TYPE.COLOR]?: string;
  [FORMATTING_TYPE.ITALIC]?: boolean;
  [FORMATTING_TYPE.HORIZONTAL_ALIGN]?: HORIZONTAL_ALIGNMENT
  [FORMATTING_TYPE.VERTICAL_ALIGN]?: VERTICAL_ALIGNMENT;
  [FORMATTING_TYPE.UNDERLINE]?: boolean;
  [FORMATTING_TYPE.STRIKE]?: boolean;
  [FORMATTING_TYPE.FILL]?: string;    
}

export interface CellDataFormatting {
  [FORMATTING_TYPE.PERCENT]?: boolean;
  [FORMATTING_TYPE.DECIMALS]?: number;
  [FORMATTING_TYPE.CURRENCY]?: boolean;
  [FORMATTING_TYPE.CURRENCY_SYMBOL]?: string
}

export enum AXIS {
  X = 'x',
  Y = 'y'
}

export enum BORDER_VARIANT {
  ALL = 'all',
  INNER = 'inner',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  OUTER = 'outer',
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  TOP = 'top',
  NONE = 'none'
}