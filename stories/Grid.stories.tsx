// @ts-nocheck
import React, { useRef, useState, useCallback } from "react";
import Grid, { IChildrenProps } from "./../src/Grid";
import useSelection from "./../src/hooks/useSelection";
import useEditable from "./../src/hooks/useEditable";
import useAutoSizer from "./../src/hooks/useAutoSizer";
import useTooltip from "./../src/hooks/useTooltip";
import { useMeasure } from "react-use";
import { Rect, Text, Group, RegularPolygon } from "react-konva";
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

export const WithTooltip: React.FC = () => {
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
    const gridRef = useRef();
    const { tooltipComponent, ...tooltipProps } = useTooltip({
      gridRef,
      getValue: ({ rowIndex, columnIndex }) => {
        return `You are at: ${rowIndex}, ${columnIndex}`;
      },
    });
    return (
      <div style={{ position: "relative" }}>
        <Grid
          ref={gridRef}
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
          {...tooltipProps}
        />
        {tooltipComponent}
      </div>
    );
  };

  return <App />;
};
