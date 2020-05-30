import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useReducer,
  memo,
  useEffect,
  Key,
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
import { ShapeConfig } from "konva/types/Shape";

export interface GridProps {
  /**
   * Width of the grid
   */
  width?: number;
  /**
   * Height of the grid
   */
  height?: number;
  /**
   * No of columns in the grid
   */
  columnCount: number;
  /**
   * No of rows in the grid
   */
  rowCount: number;
  /**
   * Should return height of a row at an index
   */
  rowHeight?: ItemSizer;
  /**
   * Should return width of a column at an index
   */
  columnWidth?: ItemSizer;
  /**
   * Size of the scrollbar. Default is 13
   */
  scrollbarSize?: number;
  /**
   * Helps in lazy grid width calculation
   */
  estimatedColumnWidth?: number;
  /**
   * Helps in lazy grid height calculation
   */
  estimatedRowHeight?: number;
  /**
   * Called when user scrolls the grid
   */
  onScroll?: ({ scrollLeft, scrollTop }: ScrollCoords) => void;
  /**
   * Show scrollbars on the left and right of the grid
   */
  showScrollbar?: boolean;
  /**
   * Background of selection
   */
  selectionBackgroundColor?: string;
  /**
   * Border color of selected area
   */
  selectionBorderColor?: string;
  /**
   * Array of selected cell areas
   */
  selections?: AreaProps[];
  /**
   * Array of merged cells
   */
  mergedCells?: AreaProps[];
  /**
   * Number of frozen rows
   */
  frozenRows?: number;
  /**
   * Number of frozen columns
   */
  frozenColumns?: number;
  /**
   * Snap to row when scrolling
   */
  snapToRow?: boolean;
  /**
   * Snap to column when scrolling
   */
  snapToColumn?: boolean;
  /**
   * Cell renderer. Must be a Konva Component eg: Group, Rect etc
   */
  itemRenderer: (props: RendererProps) => React.ReactNode;
  /**
   * Allow users to customize selected cells design
   */
  selectionRenderer?: (props: SelectionProps) => React.ReactNode;
  /**
   * Fired when scroll viewport changes
   */
  onViewChange?: (view: ViewPortProps) => void;
  /**
   * Called right before a row is being rendered.
   * Will be called for frozen cells and merged cells
   */
  onBeforeRenderRow?: (rowIndex: number) => void;
}

type RefAttribute = {
  ref?: React.MutableRefObject<GridRef>;
};

export interface SelectionProps extends ShapeConfig {}

export type ScrollCoords = {
  scrollTop: number;
  scrollLeft: number;
};

export type ForceUpdateType = {
  shouldForceUpdate: boolean;
};

const defaultRowHeight = () => 20;
const defaultColumnWidth = () => 100;
const defaultSelectionRenderer = (props: SelectionProps) => {
  return (
    <Rect
      shadowForStrokeEnabled={false}
      listening={false}
      hitStrokeWidth={0}
      {...props}
    />
  );
};

export type RenderComponent = React.FC<RendererProps>;
export interface CellPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface RendererProps extends CellInterface, CellPosition {
  key: Key;
}

export type ItemSizer = (index: number) => number;

export interface AreaProps {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface CellInterface {
  rowIndex: number;
  columnIndex: number;
}

export interface ViewPortProps {
  rowStartIndex: number;
  rowStopIndex: number;
  columnStartIndex: number;
  columnStopIndex: number;
}

export interface InstanceInterface {
  columnMetadataMap: CellMetaDataMap;
  rowMetadataMap: CellMetaDataMap;
  lastMeasuredColumnIndex: number;
  lastMeasuredRowIndex: number;
  estimatedRowHeight: number;
  estimatedColumnWidth: number;
}

export type CellMetaDataMap = Record<number, CellMetaData>;
export type CellMetaData = {
  offset: number;
  size: number;
};

export type GridRef = {
  scrollTo: (scrollPosition: ScrollCoords) => void;
  stage: typeof Stage | null;
  resetAfterIndices: (coords: CellInterface & ForceUpdateType) => void;
  getScrollPosition: () => ScrollCoords;
  isMergedCell: (coords: CellInterface) => boolean;
  getCellBounds: (coords: CellInterface) => AreaProps;
  getCellCoordsFromOffset: (x: number, y: number) => CellInterface;
  getCellOffsetFromCoords: (coords: CellInterface) => CellPosition;
};

export type MergedCellMap = Map<string, AreaProps>;

const DEFAULT_ESTIMATED_ITEM_SIZE = 50;

/**
 * Grid component using React Konva
 * @param props
 */
const Grid: React.FC<GridProps & RefAttribute> = memo(
  forwardRef<GridRef, GridProps>((props, forwardedRef) => {
    const {
      width: containerWidth = 800,
      height: containerHeight = 600,
      estimatedColumnWidth,
      estimatedRowHeight,
      rowHeight = defaultRowHeight,
      columnWidth = defaultColumnWidth,
      rowCount = 0,
      columnCount = 0,
      scrollbarSize = 13,
      onScroll,
      showScrollbar = true,
      selectionBackgroundColor = "rgb(14, 101, 235, 0.1)",
      selectionBorderColor = "#1a73e8",
      selections = [],
      frozenRows = 0,
      frozenColumns = 0,
      itemRenderer,
      mergedCells = [],
      snapToRow = false,
      snapToColumn = false,
      onViewChange,
      selectionRenderer = defaultSelectionRenderer,
      onBeforeRenderRow,
      ...rest
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
        getCellCoordsFromOffset,
        getCellOffsetFromCoords,
      };
    });

    const instanceProps = useRef<InstanceInterface>({
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
      }: CellInterface & ForceUpdateType) => {
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
      ({ rowIndex, columnIndex }: CellInterface) => {
        return mergedCellMap.has(cellIndentifier(rowIndex, columnIndex));
      },
      [mergedCellMap]
    );

    /* Get top, left bounds of a cell */
    const getCellBounds = useCallback(
      ({ rowIndex, columnIndex }: CellInterface): AreaProps => {
        const isMerged = isMergedCell({ rowIndex, columnIndex });
        if (isMerged)
          return mergedCellMap.get(
            cellIndentifier(rowIndex, columnIndex)
          ) as AreaProps;
        return {
          top: rowIndex,
          left: columnIndex,
          right: columnIndex,
          bottom: rowIndex,
        } as AreaProps;
      },
      [mergedCellMap]
    );

    const rowStartIndex = getRowStartIndexForOffset({
      rowHeight,
      columnWidth,
      rowCount,
      columnCount,
      instanceProps: instanceProps.current,
      offset: scrollTop,
    });

    const rowStopIndex = getRowStopIndexForStartIndex({
      startIndex: rowStartIndex,
      rowCount,
      rowHeight,
      columnWidth,
      scrollTop,
      containerHeight,
      instanceProps: instanceProps.current,
    });

    const columnStartIndex = getColumnStartIndexForOffset({
      rowHeight,
      columnWidth,
      rowCount,
      columnCount,
      instanceProps: instanceProps.current,
      offset: scrollLeft,
    });

    const columnStopIndex = getColumnStopIndexForStartIndex({
      startIndex: columnStartIndex,
      columnCount,
      rowHeight,
      columnWidth,
      scrollLeft,
      containerWidth,
      instanceProps: instanceProps.current,
    });

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

    /* Handle vertical scroll */
    const handleScroll = useCallback(
      (e) => {
        var { scrollTop } = e.target;
        if (snapToRow) {
          /* Get the height of the next row */
          var nextRowHeight = getRowHeight(
            Math.min(rowStartIndex + 1, rowCount - 1),
            instanceProps.current
          );
          scrollTop = Math.round(scrollTop / nextRowHeight) * nextRowHeight;
        }
        setScrollTop(scrollTop);
        /* Scroll callbacks */
        onScroll && onScroll({ scrollTop, scrollLeft });
      },
      [scrollLeft, rowStartIndex, snapToRow, rowCount]
    );

    /* Handle horizontal scroll */
    const handleScrollLeft = useCallback(
      (e) => {
        var { scrollLeft } = e.target;
        if (snapToColumn) {
          /* Get the height of the next row */
          var nextColumnWidth = getColumnWidth(
            Math.min(columnStartIndex + 1, columnCount - 1),
            instanceProps.current
          );
          scrollLeft =
            Math.round(scrollLeft / nextColumnWidth) * nextColumnWidth;
        }
        setScrollLeft(scrollLeft);
        /* Scroll callbacks */
        onScroll && onScroll({ scrollLeft, scrollTop });
      },
      [scrollTop, columnStartIndex, snapToColumn, columnCount]
    );

    /* Scroll based on left, top position */
    const scrollTo = useCallback(
      ({ scrollTop, scrollLeft }: ScrollCoords) => {
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

    /**
     * Fired when user tries to scroll the canvas
     */
    const handleWheel = useCallback((event: React.WheelEvent) => {
      if (wheelingRef.current) return;
      const { deltaX, deltaY, deltaMode } = event.nativeEvent;
      let dx = deltaX;
      let dy = deltaY;

      if (deltaMode === 1) {
        dy = dy * scrollbarSize;
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

    /* Callback when visible rows or columns have changed */
    useEffect(() => {
      onViewChange &&
        onViewChange({
          rowStartIndex,
          rowStopIndex,
          columnStartIndex,
          columnStopIndex,
        });
    }, [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex]);

    /* Draw all cells */
    const cells = [];
    if (columnCount > 0 && rowCount) {
      for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
        /* Skip frozen rows */
        if (rowIndex < frozenRows) {
          continue;
        }
        /**
         * Do any pre-processing of the row before being renderered.
         * Useful for `react-table` to call `prepareRow(row)`
         */
        onBeforeRenderRow && onBeforeRenderRow(rowIndex);

        for (
          let columnIndex = columnStartIndex;
          columnIndex <= columnStopIndex;
          columnIndex++
        ) {
          /* Skip frozen columns and merged cells */
          if (
            columnIndex < frozenColumns ||
            isMergedCell({ rowIndex, columnIndex })
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
    const [
      mergedCellAreas,
      frozenColumnMergedCellAreas,
      frozenRowMergedCellAreas,
      frozenIntersectionMergedCells,
    ] = useMemo(() => {
      const areas = [];
      const frozenColumnAreas = [];
      const frozenRowAreas = [];
      const frozenIntersectionCells = [];
      for (let i = 0; i < mergedCells.length; i++) {
        const { top: rowIndex, left: columnIndex, right, bottom } = mergedCells[
          i
        ];
        const isLeftBoundFrozen = columnIndex < frozenColumns;
        const isTopBoundFrozen = rowIndex < frozenRows;
        const isIntersectionFrozen =
          rowIndex < frozenRows && columnIndex < frozenColumns;
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

        const cellRenderer = itemRenderer({
          x,
          y,
          width,
          height,
          rowIndex,
          columnIndex,
          key: itemKey({ rowIndex, columnIndex }),
        });

        if (isLeftBoundFrozen) {
          frozenColumnAreas.push(cellRenderer);
        }

        if (isTopBoundFrozen) {
          frozenRowAreas.push(cellRenderer);
        }

        if (isIntersectionFrozen) [frozenIntersectionCells.push(cellRenderer)];

        areas.push(cellRenderer);
      }
      return [
        areas,
        frozenColumnAreas,
        frozenRowAreas,
        frozenIntersectionCells,
      ];
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
      /**
       * Do any pre-processing of the row before being renderered.
       * Useful for `react-table` to call `prepareRow(row)`
       */
      onBeforeRenderRow && onBeforeRenderRow(rowIndex);

      for (
        let columnIndex = columnStartIndex;
        columnIndex <= columnStopIndex;
        columnIndex++
      ) {
        /* Skip merged cells columns */
        if (isMergedCell({ rowIndex, columnIndex })) {
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
    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      /**
       * Do any pre-processing of the row before being renderered.
       * Useful for `react-table` to call `prepareRow(row)`
       */
      onBeforeRenderRow && onBeforeRenderRow(rowIndex);

      for (
        let columnIndex = 0;
        columnIndex < Math.min(columnStopIndex, frozenColumns);
        columnIndex++
      ) {
        /* Skip merged cells columns */
        if (isMergedCell({ rowIndex, columnIndex })) {
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
      /**
       * Do any pre-processing of the row before being renderered.
       * Useful for `react-table` to call `prepareRow(row)`
       */
      onBeforeRenderRow && onBeforeRenderRow(rowIndex);

      for (
        let columnIndex = 0;
        columnIndex < Math.min(columnStopIndex, frozenColumns);
        columnIndex++
      ) {
        /* Skip merged cells columns */
        if (isMergedCell({ rowIndex, columnIndex })) {
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
     * Removed useMemo as changes to lastMeasureRowIndex, lastMeasuredColumnIndex,
     * does not trigger useMemo
     * Dependencies : [selections, rowStopIndex, columnStopIndex, instanceProps]
     */
    const selectionAreas = [];
    const selectionAreasFrozenColumns = [];
    const selectionAreasFrozenRows = [];
    const selectionAreasIntersection = [];
    for (let i = 0; i < selections.length; i++) {
      const { top, left, right, bottom } = selections[i];
      const selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
      const actualBottom = Math.min(rowStopIndex, bottom);
      const actualRight = Math.min(columnStopIndex, right);
      const isLeftBoundFrozen = left < frozenColumns;
      const isTopBoundFrozen = top < frozenRows;
      const isIntersectionFrozen = top < frozenRows && left < frozenColumns;

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

      if (isLeftBoundFrozen) {
        const frozenColumnSelectionWidth = Math.min(
          selectionBounds.width,
          getColumnOffset({
            index: frozenColumns - left,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
        );
        selectionAreasFrozenColumns.push(
          selectionRenderer({
            key: i,
            stroke: selectionBorderColor,
            fill: selectionBackgroundColor,
            x: selectionBounds.x,
            y: selectionBounds.y,
            width: frozenColumnSelectionWidth,
            height: selectionBounds.height,
          })
        );
      }

      if (isTopBoundFrozen) {
        const frozenRowSelectionHeight = Math.min(
          selectionBounds.height,
          getRowOffset({
            index: frozenRows - top,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
        );
        selectionAreasFrozenRows.push(
          selectionRenderer({
            key: i,
            stroke: selectionBorderColor,
            fill: selectionBackgroundColor,
            x: selectionBounds.x,
            y: selectionBounds.y,
            width: selectionBounds.width,
            height: frozenRowSelectionHeight,
          })
        );
      }

      if (isIntersectionFrozen) {
        const frozenIntersectionSelectionHeight = Math.min(
          selectionBounds.height,
          getRowOffset({
            index: frozenRows - top,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
        );

        const frozenIntersectionSelectionWidth = Math.min(
          selectionBounds.width,
          getColumnOffset({
            index: frozenColumns - left,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
        );

        selectionAreasIntersection.push(
          selectionRenderer({
            key: i,
            stroke: selectionBorderColor,
            fill: selectionBackgroundColor,
            x: selectionBounds.x,
            y: selectionBounds.y,
            width: frozenIntersectionSelectionWidth,
            height: frozenIntersectionSelectionHeight,
          })
        );
      }

      selectionAreas.push(
        selectionRenderer({
          key: i,
          stroke: selectionBorderColor,
          fill: selectionBackgroundColor,
          x: selectionBounds.x,
          y: selectionBounds.y,
          width: selectionBounds.width,
          height: selectionBounds.height,
        })
      );
    }

    /**
     * Get cell offset position from rowIndex, columnIndex
     */
    const getCellOffsetFromCoords = useCallback(
      ({ rowIndex, columnIndex }: CellInterface): CellPosition => {
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

        return {
          x,
          y,
          width,
          height,
        };
      },
      []
    );

    /* Find frozen column boundary */
    const isWithinFrozenColumnBoundary = (x: number) => {
      return (
        frozenColumns > 0 &&
        x <
          getColumnOffset({
            index: frozenColumns,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
      );
    };

    /* Find frozen row boundary */
    const isWithinFrozenRowBoundary = (y: number) => {
      return (
        frozenRows > 0 &&
        y <
          getRowOffset({
            index: frozenRows,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
          })
      );
    };

    /**
     * Get cell cordinates from current mouse x/y positions
     */
    const getCellCoordsFromOffset = useCallback(
      (x: number, y: number): CellInterface => {
        const rowIndex = getRowStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: isWithinFrozenRowBoundary(y) ? y : y + scrollTop,
        });
        const columnIndex = getColumnStartIndexForOffset({
          rowHeight,
          columnWidth,
          rowCount,
          columnCount,
          instanceProps: instanceProps.current,
          offset: isWithinFrozenColumnBoundary(x) ? x : x + scrollLeft,
        });

        return { rowIndex, columnIndex };
      },
      [scrollLeft, scrollTop, rowCount, columnCount]
    );
    /**
     * Prevents drawing hit region when scrolling
     */
    const isScrolling = !!wheelingRef.current;
    const listenToEvents = !isScrolling;
    return (
      <div style={{ position: "relative", width: containerWidth }}>
        <div onWheel={handleWheel} tabIndex={-1} {...rest}>
          <Stage
            width={containerWidth}
            height={containerHeight}
            ref={stageRef}
            listening={listenToEvents}
          >
            <Layer>
              <Group offsetY={scrollTop} offsetX={scrollLeft}>
                {cells}
                {mergedCellAreas}
              </Group>
            </Layer>

            <Layer>
              <Group offsetY={scrollTop} offsetX={scrollLeft} listening={false}>
                {selectionAreas}
              </Group>
              <Group offsetY={0} offsetX={scrollLeft}>
                {frozenRowCells}
                {frozenRowMergedCellAreas}
              </Group>
              <Group offsetY={0} offsetX={scrollLeft} listening={false}>
                {selectionAreasFrozenRows}
              </Group>
              <Group offsetY={scrollTop} offsetX={0}>
                {frozenColumnCells}
                {frozenColumnMergedCellAreas}
              </Group>
              <Group offsetY={scrollTop} offsetX={0} listening={false}>
                {selectionAreasFrozenColumns}
              </Group>
              <Group offsetY={0} offsetX={0}>
                {frozenIntersectionCells}
                {frozenIntersectionMergedCells}
              </Group>
              <Group offsetY={0} offsetX={0} listening={false}>
                {selectionAreasIntersection}
              </Group>
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

export default Grid;
