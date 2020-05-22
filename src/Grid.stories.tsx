// @ts-nocheck
import React, { useRef, useState, useCallback } from "react";
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
  return (
    <Grid
      width={width}
      height={height}
      columnCount={200}
      rowCount={200}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
    >
      {Cell}
    </Grid>
  );
};

export const BaseGridWithSelection: React.FC = () => {
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
      selections={selections}
      columnCount={200}
      rowCount={200}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
    >
      {Cell}
    </Grid>
  );
};

export const VariableSizeGrid: React.FC = () => {
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
    >
      {Cell}
    </Grid>
  );
};

export const LargeGrid: React.FC = () => {
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
    >
      {Cell}
    </Grid>
  );
};

LargeGrid.story = {
  name: "1,000,000 rows and cols",
};

export const DataGrid: React.FC = () => {
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
  const width = 1200;
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
          if (index % 3 === 0) return 200;
          return 100;
        }}
        rowHeight={(index) => {
          if (index % 2 === 0) return 40;
          return 20;
        }}
        showScrollbar={false}
      >
        {(props) => <Cell {...props} header />}
      </Grid>
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        frozenColumns={frozenColumns}
        height={600}
        width={width}
        columnWidth={(index) => {
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
      >
        {Cell}
      </Grid>
    </div>
  );
};

export const GridWithFrozenRow: React.FC = () => {
  const frozenRows = number("frozenRows", 1);
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
      columnCount={200}
      rowCount={200}
      frozenRows={frozenRows}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
    >
      {Cell}
    </Grid>
  );
};
GridWithFrozenRow.story = {
  name: "Frozen rows",
};

export const GridWithFrozenColumns: React.FC = () => {
  const frozenColumns = number("frozenColumns", 1);
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
      columnCount={200}
      rowCount={200}
      frozenColumns={frozenColumns}
      columnWidth={(index) => {
        return 100;
      }}
      rowHeight={(index) => {
        return 20;
      }}
    >
      {Cell}
    </Grid>
  );
};
GridWithFrozenColumns.story = {
  name: "Frozen columns",
};

export const GridWithFrozenEdges: React.FC = () => {
  const frozenRows = number("frozenRows", 1);
  const frozenColumns = number("frozenColumns", 1);
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
    >
      {Cell}
    </Grid>
  );
};

GridWithFrozenEdges.story = {
  name: "Frozen columns and rows",
};
