import React, { useCallback, useState, useRef, useEffect } from "react";
import { ViewPortProps, GridRef, CellInterface, ItemSizer } from "./../Grid";
import { debounce } from "./../helpers";
import invariant from "tiny-invariant";

export interface IProps {
  /**
   * Used to access grid functions
   */
  gridRef: React.MutableRefObject<GridRef>;
  /**
   * Value getter for a cell
   */
  getValue: (cell: CellInterface) => any;
  /**
   * Visible rows when the grid is first visible, Since we do not know how many rows  can fit
   */
  initialVisibleRows?: number;
  /**
   * Restrict column width by this number
   */
  minColumnWidth?: number;
  /**
   * Cell padding, used for width calculation
   */
  cellSpacing?: number;
  /**
   * Scroll timeout
   */
  timeout?: number;
  /**
   * Calculate width and resize the grid on scroll
   */
  resizeOnScroll?: boolean;
  /**
   * Font used to calculate width
   */
  font?: string;
  /**
   * Strategy used to calculate column width
   * lazy = visible rows
   * full = all rows
   *
   * columns are always lazy
   */
  resizeStrategy?: ResizeStrategy;
  /**
   * No of rows in teh grid
   */
  rowCount?: number;
  /**
   * Enable autoresize
   */
  autoResize?: boolean;
}

export enum ResizeStrategy {
  "lazy" = "lazy",
  "full" = "full",
}

export interface AutoResizerResults {
  /**
   * Column width function consumed by the grid
   */
  columnWidth?: ItemSizer;
  /**
   * Callback when viewport is changed
   */
  onViewChange: (cells: ViewPortProps) => void;
  /**
   * Resize a column by index
   */
  resizeColumn: (columnIndex: number) => void;
  /**
   * Text size getter
   */
  getTextMetrics: (text: string) => TextMetrics | undefined;
}

/**
 * Auto sizer hook
 * @param param
 *
 * TODO
 * Dynamically resize columns after user has scrolled down/view port changed ?
 */
const useAutoSizer = ({
  gridRef,
  getValue,
  initialVisibleRows = 20,
  cellSpacing = 10,
  minColumnWidth = 60,
  timeout = 300,
  resizeStrategy = ResizeStrategy.lazy,
  rowCount,
  resizeOnScroll = true,
  font = "12px Arial",
  autoResize = true,
}: IProps): AutoResizerResults => {
  invariant(
    !(resizeStrategy === ResizeStrategy.full && rowCount === void 0),
    "Row count should be specified if resize stragtegy is full"
  );

  const autoSizer = useRef(AutoSizerCanvas(font));
  const [viewport, setViewport] = useState<ViewPortProps>({
    rowStartIndex: 0,
    rowStopIndex: 0,
    columnStartIndex: 0,
    columnStopIndex: 0,
  });
  const isMounted = useRef(false);
  const debounceResizer = useRef(
    debounce(
      ({ rowIndex, columnIndex }: CellInterface) =>
        gridRef.current.resetAfterIndices({ rowIndex, columnIndex }),
      timeout
    )
  );

  useEffect(() => {
    isMounted.current = true;
  }, []);

  /* Update any styles, fonts if necessary */
  useEffect(() => {
    autoSizer.current.setFont(font);
  }, [font]);

  const getTextMetrics = (text: string) => {
    return autoSizer.current.measureText(text);
  };

  const getColumnWidth = useCallback(
    (columnIndex: number) => {
      const { rowStartIndex, rowStopIndex } = viewport;
      const visibleRows =
        resizeStrategy === ResizeStrategy.full
          ? (rowCount as number)
          : rowStopIndex || initialVisibleRows;
      let start = resizeStrategy === ResizeStrategy.full ? 0 : rowStartIndex;
      let maxWidth = minColumnWidth;
      while (start < visibleRows) {
        const value =
          getValue({
            rowIndex: start,
            columnIndex,
          }) ?? null;
        if (value !== null) {
          const metrics = autoSizer.current.measureText(value);
          if (metrics) {
            const width = Math.ceil(metrics.width) + cellSpacing;
            if (width > maxWidth) maxWidth = width;
          }
        }
        start++;
      }
      return maxWidth;
    },
    [viewport, getValue, initialVisibleRows]
  );

  const handleResizeColumn = useCallback((columnIndex: number) => {
    const width = getColumnWidth(columnIndex);
    gridRef.current.resizeColumns([columnIndex]);
  }, []);

  const handleViewChange = useCallback(
    (cells: ViewPortProps) => {
      /* Update viewport cells */
      setViewport(cells);

      /* Check if viewport has changed */
      if (
        resizeStrategy === ResizeStrategy.full ||
        !resizeOnScroll ||
        (cells.rowStartIndex === viewport.rowStartIndex &&
          cells.columnStartIndex === viewport.columnStartIndex)
      )
        return;
      if (gridRef.current) {
        /* During first mount, column width is calculated. Do not re-calculate */
        if (!isMounted.current) return;
        debounceResizer.current({
          rowIndex: cells.rowStartIndex,
          columnIndex: cells.columnStartIndex,
        });
      }
    },
    [resizeOnScroll, viewport, resizeStrategy]
  );

  return {
    columnWidth: autoResize ? getColumnWidth : undefined,
    resizeColumn: handleResizeColumn,
    onViewChange: handleViewChange,
    getTextMetrics,
  };
};

/* Canvas element */
const AutoSizerCanvas = (defaultFont: string) => {
  const canvas = <HTMLCanvasElement>document.createElement("canvas");
  const context = canvas.getContext("2d");
  const setFont = (font: string = defaultFont) => {
    if (context) context.font = font;
  };
  const measureText = (text: string) => context?.measureText(text);
  /* Set font in constructor */
  setFont(defaultFont);

  return {
    context,
    measureText,
    setFont,
  };
};

export default useAutoSizer;
