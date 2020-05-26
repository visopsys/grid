import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useReducer,
  memo,
} from "react";
import { Stage, Layer, Rect, Group } from "react-konva/lib/ReactKonvaCore";
import {
  getRowStartIndexForOffset,
  getRowStopIndexForStartIndex,
  getColumnStartIndexForOffset,
  getColumnStopIndexForStartIndex,
  itemKey,
  getRowOffset,
  getColumnOffset,
  getColumnWidth,
  getRowHeight,
  getEstimatedTotalHeight,
  getEstimatedTotalWidth,
  getBoundedCells,
  cellIndentifier,
} from "./helpers";

export interface IProps {
  width: number;
  height: number;
  columnCount: number;
  rowCount: number;
  rowHeight: TItemSize;
  columnWidth: TItemSize;
  children: RenderComponent;
  scrollbarSize: number;
  estimatedColumnWidth?: number;
  estimatedRowHeight?: number;
  onScroll: ({ scrollLeft, scrollTop }: TScrollCoords) => void;
  showScrollbar: boolean;
  selectionBackgroundColor: string;
  selectionBorderColor: string;
  selections: IArea[];
  mergedCells: IArea[];
  frozenRows: number;
  frozenColumns: number;
  itemRenderer: (props: IChildrenProps) => React.ReactNode;
  onMouseDown: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onMouseUp: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onMouseMove: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onMouseEnter: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onMouseLeave: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onClick: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onDoubleClick: (
    e: React.MouseEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
}

export type TScrollCoords = {
  scrollTop: number;
  scrollLeft: number;
};

export type TForceUpdate = {
  shouldForceUpdate: boolean;
};

const defaultRowHeight = () => 20;
const defaultColumnWidth = () => 100;
const defaultProps = {
  width: 800,
  height: 800,
  rowCount: 200,
  columnCount: 200,
  rowHeight: defaultRowHeight,
  columnWidth: defaultColumnWidth,
  scrollbarSize: 17,
  showScrollbar: true,
  selectionBackgroundColor: "rgb(14, 101, 235, 0.1)",
  selectionBorderColor: "#1a73e8",
  selections: [],
  mergedCells: [],
  frozenRows: 0,
  frozenColumns: 0,
};

export type RenderComponent = React.FC<IChildrenProps>;

export interface IChildrenProps extends ICell {
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
}

export type TItemSize = (index?: number) => number;

export interface IArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ICell {
  rowIndex: number;
  columnIndex: number;
}

export interface IInstanceProps {
  columnMetadataMap: TCellMetaDataMap;
  rowMetadataMap: TCellMetaDataMap;
  lastMeasuredColumnIndex: number;
  lastMeasuredRowIndex: number;
  estimatedRowHeight: number;
  estimatedColumnWidth: number;
}

export type TCellMetaDataMap = Record<number, TCellMetaData>;
export type TCellMetaData = {
  offset: number;
  size: number;
};

export type MergedCellMap = Map<string, IArea>;

const DEFAULT_ESTIMATED_ITEM_SIZE = 50;

/**
 * Grid component using React Konva
 * @param props
 */
const Grid: React.FC<IProps> = memo(
  forwardRef((props, forwardedRef) => {
    const {
      width: containerWidth,
      height: containerHeight,
      estimatedColumnWidth,
      estimatedRowHeight,
      rowHeight,
      columnWidth,
      rowCount,
      columnCount,
      scrollbarSize,
      onScroll,
      showScrollbar,
      selectionBackgroundColor,
      selectionBorderColor,
      selections,
      frozenRows,
      frozenColumns,
      itemRenderer,
      mergedCells,
      onMouseDown,
      onClick,
      onDoubleClick,
      onMouseMove,
      onMouseUp,
      onMouseEnter,
      onMouseLeave,
    } = props;
    /* Expose some methods in ref */
    useImperativeHandle(forwardedRef, () => {
      return {
        scrollTo,
        stage: stageRef.current,
        resetAfterIndices,
        getScrollPosition,
        isMergedCell,
        getCellBounds,
        getCellCoordsFromOffsets,
      };
    });
    const instanceProps = useRef<IInstanceProps>({
      columnMetadataMap: {},
      rowMetadataMap: {},
      lastMeasuredColumnIndex: -1,
      lastMeasuredRowIndex: -1,
      estimatedColumnWidth: estimatedColumnWidth || DEFAULT_ESTIMATED_ITEM_SIZE,
      estimatedRowHeight: estimatedRowHeight || DEFAULT_ESTIMATED_ITEM_SIZE,
    });
    const stageRef = useRef(null);
    const verticalScrollRef = useRef<HTMLDivElement>(null);
    const wheelingRef = useRef<number | null>(null);
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const [_, forceRender] = useReducer((s) => s + 1, 0);
    const [scrollTop, setScrollTop] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);

    const getScrollPosition = useCallback(() => {
      return {
        scrollTop,
        scrollLeft,
      };
    }, [scrollTop, scrollLeft]);

    /* Redraw grid imperatively */
    const resetAfterIndices = useCallback(
      ({
        columnIndex,
        rowIndex,
        shouldForceUpdate = true,
      }: ICell & TForceUpdate) => {
        if (typeof columnIndex === "number") {
          instanceProps.current.lastMeasuredColumnIndex = Math.min(
            instanceProps.current.lastMeasuredColumnIndex,
            columnIndex - 1
          );
        }
        if (typeof rowIndex === "number") {
          instanceProps.current.lastMeasuredRowIndex = Math.min(
            instanceProps.current.lastMeasuredRowIndex,
            rowIndex - 1
          );
        }

        if (shouldForceUpdate) forceRender();
      },
      []
    );

    /**
     * Create a map of merged cells
     * [rowIndex, columnindex] => [parentRowIndex, parentColumnIndex]
     */
    const mergedCellMap = useMemo((): MergedCellMap => {
      const mergedCellMap = new Map();
      for (let i = 0; i < mergedCells.length; i++) {
        const bounds = mergedCells[i];
        const { top, left } = bounds;
        for (const cell of getBoundedCells(bounds)) {
          mergedCellMap.set(cell, bounds);
        }
      }
      return mergedCellMap;
    }, [mergedCells]);

    /* Check if a cell is part of a merged cell */
    const isMergedCell = useCallback(
      (rowIndex: number, columnIndex: number) => {
        return mergedCellMap.has(cellIndentifier(rowIndex, columnIndex));
      },
      [mergedCellMap]
    );

    /* Get top, left bounds of a cell */
    const getCellBounds = useCallback(
      (rowIndex: number, columnIndex: number): IArea | undefined => {
        const isMerged = isMergedCell(rowIndex, columnIndex);
        if (isMerged)
          return mergedCellMap.get(cellIndentifier(rowIndex, columnIndex));
        return {
          top: rowIndex,
          left: columnIndex,
          right: columnIndex,
          bottom: rowIndex,
        } as IArea;
      },
      [mergedCellMap]
    );

    /* Handle vertical scroll */
    const handleScroll = useCallback(
      (e) => {
        setScrollTop(e.target.scrollTop);
        /* Scroll callbacks */
        onScroll && onScroll({ scrollTop: e.target.scrollTop, scrollLeft });
      },
      [scrollLeft]
    );

    /* Handle horizontal scroll */
    const handleScrollLeft = useCallback(
      (e) => {
        setScrollLeft(e.target.scrollLeft);
        /* Scroll callbacks */
        onScroll && onScroll({ scrollLeft: e.target.scrollLeft, scrollTop });
      },
      [scrollTop]
    );

    /* Scroll based on left, top position */
    const scrollTo = useCallback(
      ({ scrollTop, scrollLeft }: TScrollCoords) => {
        /* If scrollbar is visible, lets update it which triggers a state change */
        if (showScrollbar) {
          if (horizontalScrollRef.current)
            horizontalScrollRef.current.scrollLeft = scrollLeft;
          if (verticalScrollRef.current)
            verticalScrollRef.current.scrollTop = scrollTop;
        } else {
          scrollLeft !== void 0 && setScrollLeft(scrollLeft);
          scrollTop !== void 0 && setScrollTop(scrollTop);
        }
      },
      [showScrollbar]
    );

    const handleWheel = useCallback((event: React.WheelEvent) => {
      if (wheelingRef.current) return;
      const { deltaX, deltaY, deltaMode } = event.nativeEvent;
      let dx = deltaX;
      let dy = deltaY;

      if (deltaMode === 1) {
        dy = dy * 17;
      }
      if (!horizontalScrollRef.current || !verticalScrollRef.current) return;
      const x = horizontalScrollRef.current?.scrollLeft;
      const y = verticalScrollRef.current?.scrollTop;
      wheelingRef.current = window.requestAnimationFrame(() => {
        wheelingRef.current = null;
        if (horizontalScrollRef.current)
          horizontalScrollRef.current.scrollLeft = x + dx;
        if (verticalScrollRef.current)
          verticalScrollRef.current.scrollTop = y + dy;
      });
    }, []);

    const rowStartIndex = useMemo(
      () =>
        getRowStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: scrollTop,
        }),
      [scrollTop]
    );

    const rowStopIndex = useMemo(
      () =>
        getRowStopIndexForStartIndex({
          startIndex: rowStartIndex,
          rowCount,
          rowHeight,
          columnWidth,
          scrollTop,
          containerHeight,
          instanceProps: instanceProps.current,
        }),
      [rowStartIndex, scrollTop, containerHeight]
    );

    const columnStartIndex = useMemo(
      () =>
        getColumnStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: scrollLeft,
        }),
      [scrollLeft]
    );

    const columnStopIndex = useMemo(
      () =>
        getColumnStopIndexForStartIndex({
          startIndex: columnStartIndex,
          columnCount,
          rowHeight,
          columnWidth,
          scrollLeft,
          containerWidth,
          instanceProps: instanceProps.current,
        }),
      [columnStartIndex, scrollLeft, containerWidth]
    );

    const estimatedTotalHeight = getEstimatedTotalHeight(
      rowCount,
      instanceProps.current.estimatedRowHeight,
      instanceProps.current
    );
    const estimatedTotalWidth = getEstimatedTotalWidth(
      columnCount,
      instanceProps.current.estimatedColumnWidth,
      instanceProps.current
    );

    /* Draw all cells */
    const cells = [];
    if (columnCount > 0 && rowCount) {
      for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
        /* Skip frozen rows */
        if (rowIndex < frozenRows) {
          continue;
        }
        for (
          let columnIndex = columnStartIndex;
          columnIndex <= columnStopIndex;
          columnIndex++
        ) {
          /* Skip frozen columns */
          if (
            columnIndex < frozenColumns ||
            isMergedCell(rowIndex, columnIndex)
          ) {
            continue;
          }
          const width = getColumnWidth(columnIndex, instanceProps.current);
          const x = getColumnOffset({
            index: columnIndex,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          });
          const height = getRowHeight(rowIndex, instanceProps.current);
          const y = getRowOffset({
            index: rowIndex,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          });
          cells.push(
            itemRenderer({
              x,
              y,
              width,
              height,
              rowIndex,
              columnIndex,
              key: itemKey({ rowIndex, columnIndex }),
            })
          );
        }
      }
    }

    /* Draw merged cells */
    const mergedCellAreas = useMemo(() => {
      const areas = [];
      for (let i = 0; i < mergedCells.length; i++) {
        const { top: rowIndex, left: columnIndex, right, bottom } = mergedCells[
          i
        ];
        const x = getColumnOffset({
          index: columnIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        const y = getRowOffset({
          index: rowIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        const width =
          getColumnOffset({
            index: right + 1,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          }) - x;
        const height =
          getRowOffset({
            index: bottom + 1,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          }) - y;

        areas.push(
          itemRenderer({
            x,
            y,
            width,
            height,
            rowIndex,
            columnIndex,
            key: itemKey({ rowIndex, columnIndex }),
          })
        );
      }
      return areas;
    }, [
      mergedCells,
      rowStartIndex,
      rowStopIndex,
      columnStartIndex,
      columnStopIndex,
    ]);

    /* Draw frozen rows */
    const frozenRowCells = [];
    for (
      let rowIndex = 0;
      rowIndex < Math.min(columnStopIndex, frozenRows);
      rowIndex++
    ) {
      for (
        let columnIndex = columnStartIndex;
        columnIndex <= columnStopIndex;
        columnIndex++
      ) {
        const width = getColumnWidth(columnIndex, instanceProps.current);
        const x = getColumnOffset({
          index: columnIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        const height = getRowHeight(rowIndex, instanceProps.current);
        const y = getRowOffset({
          index: rowIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        frozenRowCells.push(
          itemRenderer({
            x,
            y,
            width,
            height,
            rowIndex,
            columnIndex,
            key: itemKey({ rowIndex, columnIndex }),
          })
        );
      }
    }

    /* Draw frozen columns */
    const frozenColumnCells = [];
    for (
      let columnIndex = 0;
      columnIndex < Math.min(columnStopIndex, frozenColumns);
      columnIndex++
    ) {
      for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
        const width = getColumnWidth(columnIndex, instanceProps.current);
        const x = getColumnOffset({
          index: columnIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        const height = getRowHeight(rowIndex, instanceProps.current);
        const y = getRowOffset({
          index: rowIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        frozenColumnCells.push(
          itemRenderer({
            x,
            y,
            width,
            height,
            rowIndex,
            columnIndex,
            key: itemKey({ rowIndex, columnIndex }),
          })
        );
      }
    }

    /* Draw frozen intersection cells */
    const frozenIntersectionCells = [];
    for (
      let rowIndex = 0;
      rowIndex < Math.min(rowStopIndex, frozenRows);
      rowIndex++
    ) {
      for (
        let columnIndex = 0;
        columnIndex < Math.min(columnStopIndex, frozenColumns);
        columnIndex++
      ) {
        const width = getColumnWidth(columnIndex, instanceProps.current);
        const x = getColumnOffset({
          index: columnIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        const height = getRowHeight(rowIndex, instanceProps.current);
        const y = getRowOffset({
          index: rowIndex,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        frozenIntersectionCells.push(
          itemRenderer({
            x,
            y,
            width,
            height,
            rowIndex,
            columnIndex,
            key: itemKey({ rowIndex, columnIndex }),
          })
        );
      }
    }

    /**
     * Convert selections to area
     */
    const selectionAreas = useMemo(() => {
      const areas = [];
      for (let i = 0; i < selections.length; i++) {
        const { top, left, right, bottom } = selections[i];
        const selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
        const actualBottom = Math.min(rowStopIndex, bottom);
        const actualRight = Math.min(columnStopIndex, right);
        selectionBounds.y = getRowOffset({
          index: top,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });
        selectionBounds.height =
          getRowOffset({
            index: actualBottom,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          }) -
          selectionBounds.y +
          getRowHeight(actualBottom, instanceProps.current);

        selectionBounds.x = getColumnOffset({
          index: left,
          rowHeight,
          columnWidth,
          instanceProps: instanceProps.current,
        });

        selectionBounds.width =
          getColumnOffset({
            index: actualRight,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          }) -
          selectionBounds.x +
          getColumnWidth(actualRight, instanceProps.current);

        areas.push(
          <Rect
            key={i}
            stroke={selectionBorderColor}
            x={selectionBounds.x}
            y={selectionBounds.y}
            width={selectionBounds.width}
            height={selectionBounds.height}
            fill={selectionBackgroundColor}
            shadowForStrokeEnabled={false}
            listening={false}
            hitStrokeWidth={0}
          />
        );
      }

      return areas;
    }, [selections, rowStopIndex, columnStopIndex]);

    /**
     * Get cell cordinates from current mouse x/y positions
     */
    const getCellCoordsFromOffsets = useCallback(
      (x, y) => {
        const rowIndex = getRowStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: y + scrollTop,
        });
        const columnIndex = getColumnStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: x + scrollLeft,
        });

        return [rowIndex, columnIndex];
      },
      [scrollLeft, scrollTop]
    );

    /* Mouse down */
    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onMouseDown && onMouseDown(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* Mouse up */
    const handleMouseUp = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onMouseUp && onMouseUp(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* Click */
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onClick && onClick(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* Dbl Click */
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onDoubleClick && onDoubleClick(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* onMouseMove */
    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onMouseMove && onMouseMove(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* onMouseEnter */
    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          e.clientX,
          e.clientY
        );

        onMouseEnter && onMouseEnter(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    /* onMouseLeave */
    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const { clientX, clientY } = e;
        const [rowIndex, columnIndex] = getCellCoordsFromOffsets(
          clientX,
          clientY
        );

        onMouseLeave && onMouseLeave(e, rowIndex, columnIndex);
      },
      [scrollLeft, scrollTop]
    );

    return (
      <div style={{ position: "relative", width: containerWidth }}>
        <div
          onWheel={handleWheel}
          tabIndex={-1}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Stage width={containerWidth} height={containerHeight} ref={stageRef}>
            <Layer>
              <Group offsetY={scrollTop} offsetX={scrollLeft}>
                {cells}
                {mergedCellAreas}
              </Group>
              <Group offsetY={scrollTop} offsetX={0}>
                {frozenColumnCells}
              </Group>
              <Group offsetY={0} offsetX={scrollLeft}>
                {frozenRowCells}
              </Group>
              <Group offsetY={0} offsetX={0}>
                {frozenIntersectionCells}
              </Group>
            </Layer>
            <Layer listening={false} offsetY={scrollTop} offsetX={scrollLeft}>
              {selectionAreas}
            </Layer>
          </Stage>
        </div>
        {showScrollbar ? (
          <>
            <div
              style={{
                height: containerHeight,
                overflow: "scroll",
                position: "absolute",
                right: 0,
                top: 0,
                width: scrollbarSize,
              }}
              onScroll={handleScroll}
              ref={verticalScrollRef}
            >
              <div
                style={{
                  position: "absolute",
                  height: estimatedTotalHeight,
                  width: 1,
                }}
              />
            </div>
            <div
              style={{
                overflow: "scroll",
                position: "absolute",
                bottom: 0,
                left: 0,
                width: containerWidth,
                height: scrollbarSize,
              }}
              onScroll={handleScrollLeft}
              ref={horizontalScrollRef}
            >
              <div
                style={{
                  position: "absolute",
                  width: estimatedTotalWidth,
                  height: 1,
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  })
);

Grid.defaultProps = defaultProps;

export default Grid;
