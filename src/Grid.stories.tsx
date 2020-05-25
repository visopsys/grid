// @ts-nocheck
import React, { useRef, useState, useCallback, useEffect } from "react";
import Grid, { IChildrenProps } from "./Grid";
import { Layer, Rect, Text, Group } from "react-konva";
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

export const BaseGridWithSelection: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const selections = [
    {
      top: 2,
      right: 3,
      left: 2,
      bottom: 20,
    },
    {
      top: 2,
      right: 5,
      left: 5,
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
      selections={selections}
      columnCount={200}
      rowCount={200}
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
    key,
    frozenColumns,
    onResize,
  }) => {
    const text = columnIndex < frozenColumns ? "S/No" : `Header ${columnIndex}`;
    const fill = "#eee";
    return (
      <Group key={key}>
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
  }: IChildrenProps) => {
    const text = `${rowIndex}x${columnIndex}`;
    const fill = "white";
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
          fontStyle="normal"
          verticalAlign="middle"
          align="center"
        />
      </>
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
  const frozenRows = number("frozenRows", 1);
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
  return (
    <Grid
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
    />
  );
};

GridWithFrozenEdges.story = {
  name: "Frozen columns and rows",
};

export const EditableGrid: React.FC = () => {
  const getColumnWidth = (columnIndex) => {
    return 100;
  };
  const getRowHeight = (columnIndex) => {
    return 20;
  };

  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    data,
    onSelect,
    onDblClick,
  }: IChildrenProps) => {
    const key = [rowIndex, columnIndex].toString();
    const text = data[key] || `${rowIndex}x${columnIndex}`;
    return (
      <Group
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        onDblClick={onDblClick}
        onMouseDown={onSelect}
      >
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
      </Group>
    );
  };

  const Input = ({ onChange, ...props }) => {
    const inputRef = useRef();
    useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.select();
    }, []);
    return <input type="text" ref={inputRef} onChange={onChange} {...props} />;
  };
  const App = () => {
    const width = number("width", 900);
    const height = number("height", 600);
    const gridRef = useRef();
    const [data, setData] = useState({
      [[1, 2].toString()]: 2,
    });
    const [selections, setSelections] = useState([]);
    const [showEditInput, setShowEditInput] = useState(false);
    const [editPosition, setEditPosition] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rowIndex: null,
      columnIndex: null,
      value: "",
    });
    const [scrollPosition, setScrollPosition] = useState({
      scrollLeft: 0,
      scrollTop: 0,
    });
    const handleSelect = (e) => {
      const { rowIndex, columnIndex } = e.currentTarget.attrs;
      setSelections([
        {
          top: rowIndex,
          left: columnIndex,
          bottom: rowIndex,
          right: columnIndex,
        },
      ]);
    };
    const handleDblClick = (e) => {
      const { rowIndex, columnIndex } = e.currentTarget.attrs;
      const node = e.target;
      const width = node.width();
      const x = node.x();
      const y = node.y();
      const height = node.height();
      setScrollPosition(gridRef.current.getScrollPosition());
      setEditPosition({
        x,
        y,
        width,
        height,
        rowIndex,
        columnIndex,
        value: data[[rowIndex, columnIndex].toString()] || "",
      });
      setShowEditInput(true);
    };

    return (
      <div style={{ position: "relative" }}>
        <Grid
          ref={gridRef}
          width={width}
          height={height}
          columnCount={200}
          rowCount={200}
          columnWidth={getColumnWidth}
          rowHeight={getRowHeight}
          selections={selections}
          itemRenderer={(props) => (
            <Cell
              onSelect={handleSelect}
              onDblClick={handleDblClick}
              data={data}
              {...props}
            />
          )}
          onScroll={setScrollPosition}
        />
        {showEditInput && (
          <Input
            onChange={(e) => {
              const value = e.target.value;
              setEditPosition((prevData) => {
                return {
                  ...prevData,
                  value: value,
                };
              });
            }}
            value={editPosition.value}
            onBlur={() => {
              setShowEditInput(false);
            }}
            style={{
              position: "absolute",
              left: showEditInput ? editPosition.x : -2000,
              top: showEditInput ? editPosition.y : -2000,
              transform: `translate3d(-${scrollPosition.scrollLeft}px, -${scrollPosition.scrollTop}px, 0)`,
              height: editPosition.height,
              width: editPosition.width,
              margin: 0,
              padding: "0 5px",
              boxSizing: "border-box",
              border: "1px rgba(66, 133, 244, 1) solid",
              outline: "none",
              zIndex: 10,
            }}
            onKeyDown={(e) => {
              if (e.which === 13) {
                const value = editPosition.value;
                setData((prevData) => {
                  return {
                    ...prevData,
                    [[
                      editPosition.rowIndex,
                      editPosition.columnIndex,
                    ].toString()]: value,
                  };
                });
                setShowEditInput(false);
              }
            }}
          />
        )}
      </div>
    );
  };

  return <App />;
};

EditableGrid.story = {
  name: "Editable grid",
};
