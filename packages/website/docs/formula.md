---
id: formula
title: Formula
---

You can use existing parsers like [Hot formula Parser](https://github.com/handsontable/formula-parser)

To format a value in SpreadSheet Grid, `formatter` prop lets you easily hook into the rendering output.

```jsx
import SpreadSheet from '@rowsncolumns/spreadsheet'
import { Parser as FormulaParser } from 'hot-formula-parser';
const parser = new FormulaParser();

<SpreadSheet
  formatter={(value) => {
    if (value && value.startsWith('=')) {
      const output = parser.parse(value.substr(1))
      return output.result || output.error
    }
    return value
  }}
/>
```

### Demo

import SpreadSheet from "@rowsncolumns/spreadsheet"
import { Parser as FormulaParser } from 'hot-formula-parser';
const parser = new FormulaParser();
const initialSheets = [
  {
    id: '0',
    name: 'Hello',
    activeCell: {
      rowIndex: 1,
      columnIndex: 1,
    },
    cells: {
      1: {
        1: {
          text: '=SUM(1,2)'
        }
      }
    }
  }
]

<SpreadSheet
  sheets={initialSheets}
  formatter={(value) => {
    if (value && value.startsWith('=')) {
      const output = parser.parse(value.substr(1))
      return output.result || output.error
    }
    return value
  }}
/>

## Multi-selection mode

Multi-selection mode allows user to select multiple cells and selections when user is in formula mode.

:::note
Multi-selection in Formula mode is currently under development. 
:::