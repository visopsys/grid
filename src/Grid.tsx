import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  createElement,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useReducer,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  FastLayer,
  Group,
} from "react-konva/lib/ReactKonvaCore";

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
  frozenRows: number;
  frozenColumns: number;
}

type TScrollCoords = {
  scrollTop: number;
  scrollLeft: number;
};

type TForceUpdate = {
  shouldForceUpdate: boolean;
};

const defaultProps = {
  width: 800,
  height: 800,
  rowCount: 200,
  columnCount: 200,
  rowHeight: () => 20,
  columnWidth: () => 100,
  scrollbarSize: 17,
  showScrollbar: true,
  selectionBackgroundColor: "rgba(66, 133, 244, 0.3)",
  selectionBorderColor: "rgba(66, 133, 244, 1)",
  selections: [],
  frozenRows: 0,
  frozenColumns: 0,
};

type RenderComponent = React.FC<IChildrenProps>;

export interface IChildrenProps extends ICell {
  x: number;
  y: number;
  width: number;
  height: number;
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

const DEFAULT_ESTIMATED_ITEM_SIZE = 50;

/**
 * Grid component using React Konva
 * @param props
 */
const Grid: React.FC<IProps> = forwardRef((props, forwardedRef) => {
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
    children,
    onScroll,
    showScrollbar,
    selectionBackgroundColor,
    selectionBorderColor,
    selections,
    frozenRows,
    frozenColumns,
  } = props;
  /* Expose some methods in ref */
  useImperativeHandle(forwardedRef, () => {
    return {
      scrollTo,
      stage: stageRef.current,
      resetAfterIndices,
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

  const rowStartIndex = getRowStartIndexForOffset({
    itemType: "row",
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
    itemType: "column",
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

  const cells = [];
  if (columnCount > 0 && rowCount) {
    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
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
        cells.push(
          createElement(children, {
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

  const frozenRowCells = [];
  for (let rowIndex = 0; rowIndex < frozenRows; rowIndex++) {
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
        createElement(children, {
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

  const frozenColumnCells = [];
  for (let columnIndex = 0; columnIndex < frozenColumns; columnIndex++) {
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
        createElement(children, {
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

  const frozenIntersectionCells = [];
  for (let rowIndex = 0; rowIndex < frozenRows; rowIndex++) {
    for (let columnIndex = 0; columnIndex < frozenColumns; columnIndex++) {
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
        createElement(children, {
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

  const selectionAreas = useMemo(() => {
    const areas = [];
    if (selections.length) {
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
            strokeHitEnabled={false}
          />
        );
      }
    }

    return areas;
  }, [selections]);

  return (
    <div style={{ position: "relative", width: containerWidth }}>
      <div onWheel={handleWheel} tabIndex={-1}>
        <Stage width={containerWidth} height={containerHeight} ref={stageRef}>
          <Layer clearBeforeDraw={false}>
            <Group offsetY={scrollTop} offsetX={scrollLeft}>
              {cells}
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
          <FastLayer
            listening={false}
            offsetY={scrollTop}
            offsetX={scrollLeft}
            hitGraphEnabled={false}
          >
            {selectionAreas}
          </FastLayer>
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
});

Grid.defaultProps = defaultProps;

export default Grid;
