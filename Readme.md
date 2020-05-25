## Declarative Canvas Grid with React Konva

Canvas grid to render large set of tabular data. Uses virtualization similar to `react-window`

[Demo](https://rmdort.github.io/konva-grid)

<kbd>![Screen capture](screencapture.gif)</kbd>

## Features

- :electron: React powered declarative library
- :100: Virtualized: Only visible cells are rendered
- :bulb: Peformant: Canvas implementation with no DOM nodes
- :scroll: Supports scrolling using native scrollbars
- :computer: Supports both Fixed and Variable sized grids
- :fire: Freeze rows and columns
- :hand: Resizable headers
- :hammer_and_wrench: Fully typed API written in TypeScript
- :muscle: Highly customizable using [react-konva](https://github.com/konvajs/react-konva/)

### Why another canvas grid library

Born out of frustration *at work*, having to deal with complicated imperative canvas libraries, I wanted to create something easy to understand and declarative in nature. React-Konva uses React's custom renderer to expose [konva](https://github.com/konvajs/konva) components. 

## Installation

#### npm
```
yarn add react-konva-grid
```
#### yarn

```
npm install react-konva-grid --save
```

## Compatiblity

Konva grid will work with any browser that supports [react](https://github.com/facebook/react/), [konva](https://konvajs.org/) and canvas element.

## Usage

```js
import { Grid } from 'react-konva-grid'
import { Group, Text, Rect } from 'react-konva'

const App = () => {
  const Cell = ({ rowIndex, columnIndex, x, y, width, height}) => {
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          verticalAlign="middle"
          align="center"
        />
      </Group>
    )
  }

  return (
    <Grid
      rowCount={100}
      columnCount={100}
      width={800}
      height={800}
      rowHeight={(rowIndex) => 20}
      columnWidth={(columnIndex) => 100}
      itemRenderer={Cell}
    />
  )
}
```

## Props
This is the list of props that are meant to be used to customise the `konva-grid` behavior.

| Name | Required | Type | Description | Default |
|------|----------|------|-------------|---------|
| width | true | number | Width of the grid container | 800 |
| height| true | number | Height of the grid container | 800 |
| columnCount | true | number | No of columns in the grid | 200 |
| rowCount | true | number | No of rows in the grid | 200 |
| rowHeight | true | function | Function that returns height of the row based on rowIndex | (rowIndex) => 20 |
| columnWidth | true | function | Function that returns width of the column based on columnIndex | (columnIndex) => 100 |
| itemRenderer | true | Function | React component to render the cell | null |
| scrollbarSize | false | number | Size of the scrollbar | 17 |
| showScrollbar | false | boolean | Always show scrollbar | true |
| selectionBackgroundColor | false | string | Background color of selected cells | rgba(66, 133, 244, 0.3) |
| selectionBorderColor | false | string | Border color of bounding box of selected cells | rgba(66, 133, 244, 1) |
| selections | false | Array | Array of selected cell areas | []|
| frozenRows | false | number | No of frozen rows | 0 |
| frozenColumns | false | number | No of frozen columns | 0 |

## Methods

#### `scrollTo({ scrollLeft, scrollTop }`

Scrolls the grid to a specified `x,y` position relative to the container

#### `resetAfterIndices({ rowIndex, columnIndex })`

Imperatively trigger re-render of the grid after specified `rowIndex` or `columnIndex`

## Storybook

Examples can be found as stories in `Grid.stories.tsx`. To run storybook, enter the following commands

```bash
yarn
yarn run storybook
```

### Contribution

Feel free to fork and submit pull requests

````
git clone https://github.com/rmdort/konva-grid.git
cd konva-grid
yarn
// Run storybook
yarn storybook 
````