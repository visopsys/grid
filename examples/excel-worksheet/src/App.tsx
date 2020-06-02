// @ts-nocheck
import React, { useRef, useState, useCallback, useEffect, memo } from "react";
import {
  Grid,
  RendererProps,
  useSelection,
  useEditable,
  useAutoSizer,
  GridRef,
  CellInterface,
} from "react-konva-grid";
import { Group, Rect, Text } from "react-konva";
import { useMeasure } from "react-use";
import isEqual from "react-fast-compare";

function number2Alpha(i) {
  return (
    (i >= 26 ? number2Alpha(((i / 26) >> 0) - 1) : "") +
    "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
  );
}

const Cell = memo((props: RendererProps) => {
  const { x, y, width, height, rowIndex, columnIndex, key, value } = props;
  return (
    <React.Fragment>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="white"
        stroke="#ddd"
        strokeWidth={1}
      />
      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text={value}
        verticalAlign="middle"
        offsetX={-5}
      />
    </React.Fragment>
  );
}, isEqual);

const Header = memo((props: RendererProps) => {
  const {
    x,
    y,
    width,
    height,
    rowIndex,
    columnIndex,
    key,
    value,
    columnHeader,
  } = props;
  const isCorner = rowIndex === columnIndex;
  const text = isCorner
    ? ""
    : columnHeader
    ? rowIndex
    : number2Alpha(columnIndex - 1).toUpperCase();
  return (
    <React.Fragment>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#eee"
        stroke="#bbb"
        strokeWidth={1}
      />
      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text={text}
        verticalAlign="middle"
        align="center"
      />
    </React.Fragment>
  );
}, isEqual);

const Sheet = ({ data, onChange, name, isActive }) => {
  if (!isActive) return null;
  const gridRef = useRef<GridRef>();
  const [containerRef, { width, height }] = useMeasure();
  const rowCount = 1000;
  const columnCount = 1000;
  const { selections, newSelection, ...selectionProps } = useSelection({
    gridRef,
    rowCount,
    columnCount,
  });
  const getValue = useCallback(
    ({ rowIndex, columnIndex }) => {
      return data[[rowIndex, columnIndex]];
    },
    [data]
  );
  const { editorComponent, ...editableProps } = useEditable({
    gridRef,
    getValue,
    selections,
    onDelete: (selections) => {
      const newValues = selections.reduce((acc, sel) => {
        for (let i = sel.top; i <= sel.bottom; i++) {
          for (let j = sel.left; j <= sel.right; j++) {
            acc[[i, j]] = "";
          }
        }
        return acc;
      }, {});
      onChange(name, newValues);
      gridRef.current.resetAfterIndices(
        { rowIndex: selections[0].top, columnIndex: selections[0].left },
        false
      );
    },
    onSubmit: (value, { rowIndex, columnIndex }, nextActiveCell) => {
      const changes = {
        [[rowIndex, columnIndex]]: value,
      };
      onChange(name, changes);
      gridRef.current.resetAfterIndices({ rowIndex, columnIndex }, false);
      gridRef.current.focus();
      /* Select the next cell */
      newSelection(nextActiveCell);
    },
  });
  const autoSizerProps = useAutoSizer({
    gridRef,
    getValue,
    minColumnWidth: 60,
  });
  const frozenColumns = 1;
  const frozenRows = 1;
  return (
    <div
      style={{ position: "relative", flex: 1, minWidth: 0 }}
      ref={containerRef}
    >
      <Grid
        snap
        width={width}
        height={height}
        ref={gridRef}
        selections={selections}
        columnCount={columnCount}
        rowCount={rowCount}
        itemRenderer={(props) => {
          if (props.rowIndex < frozenRows) {
            return <Header {...props} />;
          }
          if (props.columnIndex < frozenColumns) {
            return <Header {...props} columnHeader />;
          }
          return (
            <Cell
              value={data[[props.rowIndex, props.columnIndex].toString()]}
              {...props}
            />
          );
        }}
        frozenColumns={frozenColumns}
        frozenRows={frozenRows}
        {...selectionProps}
        {...editableProps}
        {...autoSizerProps}
        columnWidth={(columnIndex) => {
          if (columnIndex === 0) return 40;
          return autoSizerProps.columnWidth(columnIndex);
        }}
        onKeyDown={(...args) => {
          selectionProps.onKeyDown(...args);
          editableProps.onKeyDown(...args);
        }}
      />
      {editorComponent}
    </div>
  );
};

const defaultSheets = [
  {
    name: "Sheet 1",
    cells: {
      "1,1": "Hello",
      "1,2": "World",
    },
  },
];
const App = () => {
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheets, setSheets] = useState(defaultSheets);
  const handleChange = useCallback((name, changes) => {
    setSheets((prev) => {
      return prev.map((cur) => {
        if (cur.name === name) {
          return {
            ...cur,
            cells: {
              ...cur.cells,
              ...changes,
            },
          };
        }
        return cur;
      });
    });
  }, []);
  return (
    <div className="Container">
      <div className="Container-Sheet">
        {sheets.map((sheet, i) => {
          return (
            <Sheet
              isActive={i === activeSheet}
              key={sheet.name}
              data={sheet.cells}
              name={sheet.name}
              onChange={handleChange}
            />
          );
        })}
      </div>
      <Tabs
        sheets={sheets}
        onAdd={() => {
          setSheets((prev) =>
            prev.concat({ name: "Sheet" + (prev.length + 1), cells: {} })
          );
          setActiveSheet(sheets.length);
        }}
        active={activeSheet}
        onActive={setActiveSheet}
      />
    </div>
  );
};

const Tabs = ({ sheets, onAdd, active, onActive }) => {
  return (
    <div className="Tabs">
      <button className="Tabs-Button Tabs-Add" onClick={onAdd}>
        Add
      </button>
      {sheets.map((sheet, i) => {
        const className =
          "Tabs-Button " + (i === active ? "Tabs-Button-Active" : "");
        return (
          <button onClick={() => onActive(i)} key={i} className={className}>
            {sheet.name}
          </button>
        );
      })}
    </div>
  );
};

export default App;
