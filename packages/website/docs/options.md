---
id: options
title: Configuration
---

These are some of the available options to customize SpreadSheet Grid

### `sheets`

Initial sheets that will be displayed in the grid

```ts
interface Sheet {
  id: string;
  name: string;
  cells: Cells;
  activeCell: CellInterface | null;
  selections?: SelectionArea[];
  scrollState?: ScrollCoords;
  columnSizes?: SizeType;
  rowSizes?: SizeType;
  mergedCells?: AreaProps[];
  frozenRows?: number;
  frozenColumns?: number;
}

type Cells = Record<string, Cell>;
type Cell = Record<string, CellConfig>;
interface CellConfig extends CellFormatting {
  text?: string | number;
}

const sheets = [
  {
    name: 'Sheet 1',
    id: 0,
    cells: {
      1, {
        1: {
          text: 'value'
        }
      }
    }
  }
]
```

And initialize the grid by passing the `sheets` prop

```jsx
<SpreadSheet sheets={sheets}>
```

### `activeSheet`

Initial active sheet id

### `onChange`

Callback when sheets is changed

```jsx
<SpreadSheet
  sheets={sheets}
  onChange={(sheets: Sheet[]) => {
    // Persist in your data model
  }}
>
```

### `onChangeSelectedSheet`

Callback fired when selected sheet changes

```jsx
<SpreadSheet
  onChangeSelectedSheet={(sheetId: string) => {
    // Persist in your data model
  }}
>
```

### `onChangeCells`

Callback fired when a cell or group of cells change

```jsx
<SpreadSheet
  onChangeCells={(sheetId: string, cells: Cells) => {
    // Persist in your data model
  }}
>
```

### `CellRenderer`

React component to customize cell rendering

```jsx
import SpreadSheet, { RendererProps } from '@rowsncolumns/spreadsheet'
import { Rect, Text } from 'react-konva'

const Cell = (props: RendererProps) => {
  const { x, y, width, height, rowIndex, columnIndex, text } = props
  if (!text) return null
  return (
    <>
      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text={text}
      >
    </>
  )
}

function App () {
  return (
    <SpreadSheet
      CellRenderer={Cell}
    >
  )
}

```

### `HeaderCellRenderer`

Customize header cell component

```jsx
import SpreadSheet, { RendererProps } from '@rowsncolumns/spreadsheet'
import { Rect, Text } from 'react-konva'

const HeaderCell = (props: RendererProps) => {
  const { x, y, width, height, rowIndex, columnIndex, text } = props
  if (!text) return null
  return (
    <>
      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text={text}
      >
    </>
  )
}

function App () {
  return (
    <SpreadSheet
      HeaderCellRenderer={HeaderCell}
    >
  )
}

```

### `hiddenRows`

Array of rowIndexes to be hidden

### `hiddenColumns`

Array of columnIndexes to be hidden

### `showFormulabar`

Boolean to show hide formula bar

### `showToolbar`

Boolean to show hide bottom toolbar

### `showGridLines`

Boolean to show hide grid lines

### `minHeight`

Min height of the Sheet

### `fontFamily`

Font family of text that is rendered on the grid. Defaults to system font

### `formattter`

Formatter function that will be run for each cell. 

```jsx
import SpreadSheet from '@rowsncolumns/spreadsheet'

<SpreadSheet
  formattter={(value, datatype) => {
    if (datatype === 'number') return value.toFixed(2)
    return value
  }}
/>
```

### `allowMultipleSelection`

Boolean to enable to disable multiple cell selection

### `onActiveCellChange`

Callback fired when activeCell changes

```jsx
<SpreadSheet
  onActiveCellChange={(sheetId: string, cell: CellInterface) => {
    console.log(cell.rowIndex, cell.columnIndex)
  }}
>
```

### `onSelectionChange?: (sheetId: string, activeCell: CellInterface | null, selections: SelectionArea[]) => void;`

Callback fired when selection changes

### `selectionMode`

One of `row|cell|column`. Highlights the selected cell area