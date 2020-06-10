export enum KeyCodes {
  Right = 39,
  Left = 37,
  Up = 38,
  Down = 40,
  Escape = 27,
  Tab = 9,
  Meta = 91,
  Delete = 9,
  BackSpace = 8,
  Enter = 13,
  A = 65,
  SPACE = 32,
  ALT = 18,
  C = 67,
  Home = 36,
  End = 35,
  PageDown = 34,
  PageUp = 33,
}

export enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

export enum Movement {
  forwards = "forwards",
  backwards = "backwards",
  downwards = "downwards",
}

export enum MimeType {
  html = "text/html",
  csv = "text/csv",
  plain = "text/plain",
  json = "application/json",
}

export enum SelectionMode {
  continuous = "continuous",
  discrete = "discrete",
}
