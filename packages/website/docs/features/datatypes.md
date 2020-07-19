---
title: Datatypes
---
import SpreadSheet, { uuid, DATATYPE } from "@rowsncolumns/spreadsheet";

SpreadSheet Grid supports the following `datatypes`

```jsx
export enum DATATYPE {
  Null = "null",
  Number = "number",
  String = "string",  
  Boolean = "boolean",
  Error = "error",
  Hyperlink = "hyperlink",
}
```

:::note
We are actively working to add support for these datatables

1. Date
1. Formula
1. RichText
:::

## Number

```jsx
const sheets = [
  {
    name: 'Sheet 1',
    id: uuid(),
    cells: {
      1: {
        1: {
          datatype: DATATYPE.Number,
          text: 200.00,
          format: '\\S$ #.00'
        }
      }
    }
  },
]
```

export const NumberType = () => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: uuid(),
      cells: {
        1: {
          1: {
            datatype: DATATYPE.Number,
            text: 200.00,
            format: '\\S$ #.00'
          }
        }
      }
    },
  ]
  return <SpreadSheet sheets={sheets} />
}

<NumberType />

## String

```jsx
const sheets = [
  {
    name: 'Sheet 1',
    id: uuid(),
    cells: {
      1: {
        1: {
          datatype: DATATYPE.String,
          text: '1'
        }
      }
    }
  },
]
```

export const StringType = () => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: uuid(),
      cells: {
        1: {
          1: {
            datatype: DATATYPE.String,
            text: 'Hello world'
          }
        }
      }
    },
  ]
  return <SpreadSheet sheets={sheets} />
}

<StringType />


## Boolean

Displays a checkbox

```jsx
const sheets = [
  {
    name: 'Sheet 1',
    id: uuid(),
    cells: {
      1: {
        1: {
          text: "TRUE",
          datatype: DATATYPE.Boolean,
          dataValidation: {
            allowBlank: true,
            type: "boolean",
            formulae: ["TRUE", "FALSE"],
          },
        }
      }
    }
  },
]
```

export const Boolean = () => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: uuid(),
      cells: {
        1: {
          1: {
            text: "TRUE",
            datatype: DATATYPE.Boolean,
            dataValidation: {
              allowBlank: true,
              type: "boolean",
              formulae: ["TRUE", "FALSE"],
            },
          }
        }
      }
    },
  ]
  return <SpreadSheet sheets={sheets} />
}

<Boolean />


## Hyperlink

```jsx
const sheets = [
  {
    name: 'Sheet 1',
    id: uuid(),
    cells: {
      1: {
        1: {
          datatype: DATATYPE.Hyperlink,
          text: "Hello world",
          color: "#1155CC",
          underline: true,
          hyperlink: "http://google.com",
        }
      }
    }
  },
]
```

export const HyperLink = () => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: uuid(),
      cells: {
        1: {
          1: {
            datatype: DATATYPE.Hyperlink,
            text: "Hello world",
            color: "#1155CC",
            underline: true,
            hyperlink: "http://google.com",
          }
        }
      }
    },
  ]
  return <SpreadSheet sheets={sheets} />
}

<HyperLink />

## Error

```jsx
const sheets = [
  {
    name: 'Sheet 1',
    id: uuid(),
    cells: {
      1: {
        1: {
          text: 'hello',
          valid: false,
          datatype: DATATYPE.Number,
          dataValidation: {
            type: 'decimal',
            prompt: 'Enter a valid number'
          }
        }
      }
    }
  },
]
```

export const Error = () => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: uuid(),
      cells: {
        1: {
          1: {
            text: 'hello',
            valid: false,
            dataValidation: {
              type: 'decimal',
              prompt: 'Enter a valid number'
            }
          }
        }
      }
    },
  ]
  return <SpreadSheet sheets={sheets} />
}

<Error />