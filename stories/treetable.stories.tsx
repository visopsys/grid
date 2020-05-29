// @ts-nocheck
import React, { useRef, useState, useCallback } from "react";
import Grid, { IChildrenProps } from "./../src/Grid";
import useSelection from "./../src/hooks/useSelection";
import useEditable from "./../src/hooks/useEditable";
import useAutoSizer from "./../src/hooks/useAutoSizer";
import { useMeasure } from "react-use";
import { Rect, Text, Group, RegularPolygon } from "react-konva";
import { number } from "@storybook/addon-knobs";

export default {
  title: "Grid/Treetable",
  component: Grid,
};

export const TreeTable: React.FC = () => {
  const width = number("width", 900);
  const height = number("height", 600);
  const frozenRows = 2;
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
    // console.log('called', rowIndex, columnIndex, headers[columnIndex + 1][])
    const text =
      headers[columnIndex] && headers[columnIndex].header[columnIndex - 1].name;
    const [isHovered, setIsHovered] = useState(false);
    const strokeColor = cellStrokeColor;
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
        header: ["id"],
      },
      {
        name: "Aggregate",
        header: [{ name: "Group Header" }, { name: "Aggregated Value" }],
      },
      {
        name: "Aggregate",
        header: [null, { name: "Aggregated Value 2" }],
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
        left: 0,
        right: 0,
        bottom: 1,
      },
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
        mergedCells={mergedCells}
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
