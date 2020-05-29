// @ts-nocheck
import React, { useRef, useState, useCallback, useEffect } from "react";
import Grid, { IChildrenProps } from "./../src/Grid";
import useSelection from "./../src/hooks/useSelection";
import useEditable from "./../src/hooks/useEditable";
import useAutoSizer from "./../src/hooks/useAutoSizer";
import { useMeasure } from "react-use";
import { Layer, Rect, Text, Group, RegularPolygon } from "react-konva";
import { number } from "@storybook/addon-knobs";

export default {
  title: "Grid",
  component: Grid,
};

export const BaseGrid: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  const App = () => {
    return (
      <Grid
        width={width}
        height={height}
        columnCount={200}
        rowCount={200}
        columnWidth={(index) => {
          return 100;
        }}
        itemRenderer={(props) => <Cell {...props} />}
        rowHeight={(index) => {
          return 20;
        }}
      />
    );
  };

  return <App />;
};

export const FullWidthGrid: React.FC = () => {
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  const App = () => {
    const [containerRef, { width, height }] = useMeasure();
    return (
      <div
        style={{
          flex: 1,
          width: "100%",
          height: 600,
        }}
        ref={containerRef}
      >
        <Grid
          width={width}
          height={height}
          columnCount={200}
          rowCount={200}
          columnWidth={(index) => {
            return 100;
          }}
          itemRenderer={(props) => <Cell {...props} />}
          rowHeight={(index) => {
            return 20;
          }}
        />
      </div>
    );
  };

  return <App />;
};

export const AutoSizer: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    value,
  }: IChildrenProps) => {
    const text = value || `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          verticalAlign="middle"
          align="left"
          offsetX={-5}
        />
      </>
    );
  };
  const App = () => {
    const [data, setData] = useState({
      [[1, 2]]: "Hello, good morning",
      [[30, 4]]: "lorem asd asd as das dasd asd as da sdasdasda",
      [[2, 15]]: "lorem asd asd as das dasd asd as da sdasdasda",
    });
    const gridRef = useRef(null);
    const getCellValue = useCallback(
      ({ rowIndex, columnIndex }) => data[[rowIndex, columnIndex]],
      [data]
    );
    const autoSizerProps = useAutoSizer({
      gridRef,
      getValue: getCellValue,
    });
    return (
      <Grid
        width={width}
        height={height}
        columnCount={200}
        rowCount={200}
        columnWidth={(index) => {
          return 100;
        }}
        itemRenderer={(props) => (
          <Cell value={data[[props.rowIndex, props.columnIndex]]} {...props} />
        )}
        rowHeight={(index) => {
          return 20;
        }}
        {...autoSizerProps}
      />
    );
  };

  return <App />;
};

export const MergedCells: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  const App = () => {
    const mergedCells = [
      {
        top: 5,
        left: 5,
        right: 6,
        bottom: 5,
      },
      {
        top: 1,
        left: 2,
        right: 4,
        bottom: 5,
      },
    ];
    const gridRef = useRef();
    const { selection, ...selectionProps } = useSelection({ gridRef });
    return (
      <Grid
        width={width}
        height={height}
        columnCount={200}
        rowCount={200}
        ref={gridRef}
        mergedCells={mergedCells}
        columnWidth={(index) => {
          return 100;
        }}
        itemRenderer={(props) => <Cell {...props} />}
        rowHeight={(index) => {
          return 20;
        }}
        selection={selection}
        {...selectionProps}
      />
    );
  };

  return <App />;
};

export const BaseGridWithSelection: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const initialSelections = [
    {
      top: 2,
      right: 3,
      left: 2,
      bottom: 20,
    },
  ];

  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
          listening={false}
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
      </>
    );
  };
  const App = () => {
    const gridRef = useRef();
    const { selections, ...selectionProps } = useSelection({
      initialSelections,
      gridRef,
    });
    return (
      <Grid
        width={width}
        height={height}
        selections={selections}
        columnCount={200}
        rowCount={200}
        ref={gridRef}
        {...selectionProps}
        columnWidth={(index) => {
          return 100;
        }}
        rowHeight={(index) => {
          return 20;
        }}
        itemRenderer={Cell}
      />
    );
  };

  return <App />;
};

export const VariableSizeGrid: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  return (
    <Grid
      width={width}
      height={height}
      columnCount={200}
      rowCount={200}
      columnWidth={(index) => {
        if (index % 3 === 0) return 200;
        return 100;
      }}
      rowHeight={(index) => {
        if (index % 2 === 0) return 40;
        return 20;
      }}
      itemRenderer={Cell}
    />
  );
};

export const LargeGrid: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const fill =
      columnIndex % 2 === 0
        ? rowIndex % 2 === 0
          ? "#f8f8f0"
          : "white"
        : rowIndex % 2
        ? "#f8f8f0"
        : "white";
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  return (
    <Grid
      width={width}
      height={height}
      columnCount={1000000}
      rowCount={1000000}
      columnWidth={(index) => {
        if (index % 3 === 0) return 200;
        return 100;
      }}
      rowHeight={(index) => {
        if (index % 2 === 0) return 40;
        return 20;
      }}
      itemRenderer={Cell}
    />
  );
};

LargeGrid.story = {
  name: "1,000,000 rows and cols",
};

export const DataGrid: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const gridRef = useRef();
  const frozenColumns = number("frozenColumns", 1);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    header,
  }: IChildrenProps) => {
    const text = header
      ? columnIndex < frozenColumns
        ? "S/No"
        : `Header ${columnIndex}`
      : `${rowIndex}x${columnIndex}`;
    const fill = header ? "#eee" : "white";
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke="grey"
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fontStyle={header ? "bold" : "normal"}
          verticalAlign="middle"
          align="center"
        />
      </>
    );
  };
  const columnCount = 100000;
  const rowCount = 100000;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Grid
        columnCount={columnCount}
        height={40}
        rowCount={1}
        frozenColumns={frozenColumns}
        ref={gridRef}
        width={width}
        columnWidth={(index) => {
          if (index === 0) return 80;
          if (index % 3 === 0) return 200;
          return 100;
        }}
        rowHeight={(index) => {
          if (index % 2 === 0) return 40;
          return 20;
        }}
        showScrollbar={false}
        itemRenderer={(props) => <Cell {...props} header />}
      />
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        frozenColumns={frozenColumns}
        height={height}
        width={width}
        columnWidth={(index) => {
          if (index === 0) return 80;
          if (index % 3 === 0) return 200;
          return 100;
        }}
        rowHeight={(index) => {
          if (index % 2 === 0) return 40;
          return 20;
        }}
        onScroll={({ scrollLeft }) => {
          gridRef.current.scrollTo({ scrollLeft });
        }}
        itemRenderer={Cell}
      />
    </div>
  );
};

export const DataGridResize: React.FC = () => {
  const dragHandleWidth = 5;
  const DraggableRect = (props) => {
    return (
      <Rect
        fill="blue"
        draggable
        hitStrokeWidth={20}
        onMouseEnter={() => (document.body.style.cursor = "ew-resize")}
        onMouseLeave={() => (document.body.style.cursor = "default")}
        dragBoundFunc={(pos) => {
          return {
            ...pos,
            y: 0,
          };
        }}
        {...props}
      />
    );
  };
  const HeaderComponent = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    frozenColumns,
    onResize,
  }) => {
    const text = columnIndex < frozenColumns ? "S/No" : `Header ${columnIndex}`;
    const fill = "#eee";
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke="grey"
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fontStyle="bold"
          verticalAlign="middle"
          align="center"
        />
        <DraggableRect
          x={x + width - dragHandleWidth}
          y={y}
          width={dragHandleWidth}
          height={height}
          onDragMove={(e) => {
            const node = e.target;
            const newWidth = node.x() - x + dragHandleWidth;

            onResize(columnIndex, newWidth);
          }}
        />
      </Group>
    );
  };
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    key,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const fill = "white";
    return (
      <React.Fragment key={key}>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke="grey"
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fontStyle="normal"
          verticalAlign="middle"
          align="center"
        />
      </React.Fragment>
    );
  };
  const columnCount = 100000;
  const rowCount = 100000;
  const App = () => {
    const width = number("width", 900);
    const height = number("height", 600);
    const gridRef = useRef();
    const mainGridRef = useRef();
    const frozenColumns = number("frozenColumns", 1);
    const [columnWidthMap, setColumnWidthMap] = useState({});
    const handleResize = (columnIndex, newWidth) => {
      setColumnWidthMap((prev) => {
        return {
          ...prev,
          [columnIndex]: newWidth,
        };
      });
      gridRef.current.resetAfterIndices({ columnIndex });
      mainGridRef.current.resetAfterIndices({ columnIndex });
    };
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Grid
          columnCount={columnCount}
          height={40}
          rowCount={1}
          frozenColumns={frozenColumns}
          ref={gridRef}
          width={width}
          columnWidth={(index) => {
            if (index in columnWidthMap) return columnWidthMap[index];
            if (index === 0) return 80;
            if (index % 3 === 0) return 200;
            return 100;
          }}
          rowHeight={(index) => {
            if (index % 2 === 0) return 40;
            return 20;
          }}
          showScrollbar={false}
          itemRenderer={(props) => (
            <HeaderComponent
              onResize={handleResize}
              frozenColumns={frozenColumns}
              {...props}
            />
          )}
        />
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          frozenColumns={frozenColumns}
          height={height}
          width={width}
          ref={mainGridRef}
          columnWidth={(index) => {
            if (index in columnWidthMap) return columnWidthMap[index];
            if (index === 0) return 80;
            if (index % 3 === 0) return 200;
            return 100;
          }}
          rowHeight={(index) => {
            if (index % 2 === 0) return 40;
            return 20;
          }}
          onScroll={({ scrollLeft }) => {
            gridRef.current.scrollTo({ scrollLeft });
          }}
          itemRenderer={Cell}
        />
      </div>
    );
  };
  return <App />;
};

DataGridResize.story = {
  name: "Grid with resizable headers",
};

export const GridWithFrozenRow: React.FC = () => {
  const frozenRows = number("frozenRows", 1);
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const isFrozen = rowIndex < frozenRows;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={isFrozen ? "lightblue" : "white"}
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  return (
    <Grid
      width={width}
      height={height}
      columnCount={200}
      rowCount={200}
      frozenRows={frozenRows}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
      itemRenderer={Cell}
    />
  );
};
GridWithFrozenRow.story = {
  name: "Frozen rows",
};

export const GridWithFrozenColumns: React.FC = () => {
  const frozenColumns = number("frozenColumns", 1);
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const isFrozen = columnIndex < frozenColumns;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={isFrozen ? "lightblue" : "white"}
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  return (
    <Grid
      width={width}
      height={height}
      columnCount={200}
      rowCount={200}
      frozenColumns={frozenColumns}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
      itemRenderer={Cell}
    />
  );
};
GridWithFrozenColumns.story = {
  name: "Frozen columns",
};

export const GridWithFrozenEdges: React.FC = () => {
  const frozenRows = number("frozenRows", 2);
  const frozenColumns = number("frozenColumns", 2);
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const isFrozen = rowIndex < frozenRows || columnIndex < frozenColumns;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={isFrozen ? "lightblue" : "white"}
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  const App = () => {
    const gridRef = useRef();
    const { selection, ...selectionProps } = useSelection({
      gridRef,
    });
    return (
      <Grid
        ref={gridRef}
        selection={selection}
        width={width}
        height={height}
        columnCount={200}
        rowCount={200}
        frozenColumns={frozenColumns}
        frozenRows={frozenRows}
        columnWidth={(index) => {
          return 100;
        }}
        rowHeight={(index) => {
          return 20;
        }}
        itemRenderer={Cell}
        {...selectionProps}
      />
    );
  };

  return <App />;
};

GridWithFrozenEdges.story = {
  name: "Frozen columns and rows",
};

export const EditableGrid: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    value,
  }: IChildrenProps) => {
    const text = value || `${rowIndex}x${columnIndex}`;
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke="grey"
          strokeWidth={0.5}
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
      </>
    );
  };
  const App = () => {
    const [data, setData] = useState({
      [[1, 2]]: "Hello",
      [[30, 4]]: "lorem asd asd as das dasd asd as da sdasdasda",
      [[2, 15]]: "lorem asd asd as das dasd asd as da sdasdasda",
    });
    const gridRef = useRef(null);
    const getCellValue = useCallback(
      ({ rowIndex, columnIndex }) => data[[rowIndex, columnIndex]],
      [data]
    );
    const { selections, ...selectionProps } = useSelection({ gridRef });
    const { editorComponent, ...editableProps } = useEditable({
      gridRef,
      getValue: getCellValue,
      onChange: (value, { rowIndex, columnIndex }) => {
        setData((prev) => ({ ...prev, [[rowIndex, columnIndex]]: value }));
        gridRef.current.resetAfterIndices({ rowIndex, columnIndex }, false);
      },
    });
    const autoSizerProps = useAutoSizer({
      gridRef,
      getValue: getCellValue,
    });
    return (
      <div style={{ position: "relative" }}>
        <Grid
          width={width}
          height={height}
          columnCount={200}
          rowCount={200}
          ref={gridRef}
          selections={selections}
          columnWidth={(index) => {
            return 100;
          }}
          itemRenderer={(props) => (
            <Cell
              value={data[[props.rowIndex, props.columnIndex]]}
              {...props}
            />
          )}
          rowHeight={(index) => {
            return 20;
          }}
          {...editableProps}
          {...selectionProps}
          {...autoSizerProps}
        />
        {editorComponent}
      </div>
    );
  };

  return <App />;
};

export const TreeTable: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const frozenRows = 1;
  const frozenColumns = 1;
  const cellStrokeColor = "#ccc";
  const textColor = "#333";
  const ColumnHeader = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    data,
    headers,
    onToggleNode,
    treeState,
  }: IChildrenProps) => {
    const column = headers[columnIndex] && headers[columnIndex].name;
    const datapoint = data[rowIndex - frozenRows];
    const text =
      column && data[rowIndex - frozenRows]
        ? data[rowIndex - frozenRows]["text"]
        : null;
    const hasKids = datapoint && datapoint.kids;
    const isOpen = data[rowIndex - frozenRows]
      ? treeState.open.includes(data[rowIndex - frozenRows].id)
      : false;
    const depth = data[rowIndex - frozenRows]?.depth;
    const paddingLeft = 8 + 12 * (depth || 0);
    const arrowWidth = 8;
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke={cellStrokeColor}
          strokeWidth={0.5}
        />
        {hasKids && (
          <RegularPolygon
            x={x + paddingLeft}
            y={y + 10}
            sides={3}
            radius={5}
            rotation={isOpen ? 180 : 90}
            fill={textColor}
            onClick={() =>
              onToggleNode(data[rowIndex - frozenRows].id, !isOpen)
            }
            hitStrokeWidth={20}
          />
        )}
        {text && (
          <Text
            x={x + paddingLeft + arrowWidth}
            y={y}
            height={height}
            width={width}
            text={text}
            verticalAlign="middle"
            align="left"
          />
        )}
      </Group>
    );
  };

  const RowHeader = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    headers,
  }: IChildrenProps) => {
    const text = headers[columnIndex] && headers[columnIndex].name; // `${rowIndex}x${columnIndex}`;
    const [isHovered, setIsHovered] = useState(false);
    const strokeColor = isHovered ? "black" : cellStrokeColor;
    const fillColor = "#eee";
    return (
      <Group
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={0.5}
        />
        {text && (
          <>
            {/* <RegularPolygon
              x={x + 10}
              y={y + 10}
              sides={3}
              radius={5}
              rotation={90}
              fill={textColor}
            /> */}
            <Text
              x={x}
              y={y}
              height={height}
              width={width}
              text={text}
              verticalAlign="middle"
              align="center"
            />
          </>
        )}
      </Group>
    );
  };
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    isHovered,
    data,
    headers,
    frozenRows,
  }: IChildrenProps) => {
    const column = headers[columnIndex] && headers[columnIndex].name;
    const text =
      column && data[rowIndex - frozenRows]
        ? data[rowIndex - frozenRows][column]
        : null;
    const fill = isHovered ? "blue" : "white";
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="white"
          stroke={cellStrokeColor}
          strokeWidth={0.5}
        />
        {text && (
          <Text
            x={x}
            y={y}
            offsetX={10}
            height={height}
            width={width}
            text={text}
            verticalAlign="middle"
            align="right"
          />
        )}
      </>
    );
  };
  const EmptyCell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const fillColor = "#eee";
    return (
      <>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fillColor}
          stroke={cellStrokeColor}
          strokeWidth={0.5}
        />
      </>
    );
  };
  const App = () => {
    const [treeState, setTreeState] = useState({ open: [] });
    const initialData = [
      {
        id: "Parent",
        text: "Parent",
        Aggregate: 0.2012312312,
        parent: "",
        leaf: false,
        kids: true,
        depth: 0,
      },
      {
        id: "Parent_Child",
        text: "Child",
        Aggregate: 12.02,
        parent: "Parent",
        leaf: true,
        kids: true,
        depth: 1,
      },
      {
        id: "Parent_Child_GrandChild",
        text: "Grandchild",
        Aggregate: 12.02,
        parent: "Parent_Child",
        leaf: true,
        kids: false,
        depth: 2,
      },
    ];

    const headers = [
      {
        name: "id",
        headers: ["id"],
      },
      {
        name: "Aggregate",
        headers: ["Aggregate"],
      },
    ];

    const data = initialData.filter((item) => {
      const grandParents = item.parent
        .split("_")
        .reduce((acc, item, index, arr) => {
          let prev = arr[index - 1] ? arr[index - 1] + "_" : "";
          acc.push(prev + item);
          return acc;
        }, []);
      if (!item.parent) return true;
      const isAnyParentsClosed = grandParents.some(
        (id) => !treeState.open.includes(id)
      );
      if (isAnyParentsClosed) return false;
      return treeState.open.includes(item.parent);
    });
    const gridRef = useRef();
    const [hoveredCell, setHoveredCell] = useState({
      rowIndex: 0,
      columnIndex: 0,
    });
    const { selection, ...selectionProps } = useSelection({ gridRef });
    const mergedCells = [
      {
        top: 0,
        left: 1,
        right: 2,
        bottom: 0,
      },
    ];
    const onToggleNode = useCallback((id, isOpen) => {
      setTreeState((prev) => {
        return {
          ...prev,
          open: isOpen
            ? prev.open.concat(id)
            : prev.open.filter((item) => item !== id),
        };
      });
    }, []);

    return (
      <Grid
        ref={gridRef}
        width={width}
        height={height}
        columnCount={headers.length + 1}
        rowCount={data.length + frozenRows}
        selection={selection}
        frozenRows={frozenRows}
        frozenColumns={1}
        // mergedCells={mergedCells}
        columnWidth={(index) => {
          return 150;
        }}
        onMouseMove={(_, rowIndex, columnIndex) =>
          setHoveredCell({ rowIndex, columnIndex })
        }
        itemRenderer={(props) => {
          if (props.rowIndex < frozenRows && props.columnIndex < frozenColumns)
            return <EmptyCell {...props} />;
          if (props.rowIndex < frozenRows)
            return <RowHeader headers={headers} {...props} />;
          if (props.columnIndex < frozenColumns)
            return (
              <ColumnHeader
                treeState={treeState}
                data={data}
                headers={headers}
                onToggleNode={onToggleNode}
                {...props}
              />
            );
          return (
            <Cell
              frozenRows={frozenRows}
              data={data}
              headers={headers}
              {...props}
            />
          );
        }}
        rowHeight={(index) => {
          return 20;
        }}
        {...selectionProps}
      />
    );
  };

  return <App />;
};
