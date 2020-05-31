import React, { useCallback, useState, useRef, useEffect } from "react";
import { ViewPortProps, GridRef, CellInterface, ItemSizer } from "./../Grid";
import { debounce } from "./../helpers";

interface IProps {
  gridRef: React.MutableRefObject<GridRef>;
  getValue: (cell: CellInterface) => any;
  initialVisibleRows?: number;
  minColumnWidth?: number;
  cellSpacing?: number;
  timeout?: number;
  resizeOnScroll?: boolean;
}

interface AutoResizerResults {
  columnWidth: ItemSizer;
  onViewChange: (cells: ViewPortProps) => void;
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
  minColumnWidth = 40,
  timeout = 300,
  resizeOnScroll = true,
}: IProps): AutoResizerResults => {
  const autoSizer = useRef(AutoSizerCanvas());
  const [viewport, setViewport] = useState<ViewPortProps>({
    rowStartIndex: 0,
    rowStopIndex: 0,
    columnStartIndex: 0,
    columnStopIndex: 0,
  });
  const debounceResizer = useRef(
    debounce(
      ({ rowIndex, columnIndex }: CellInterface) =>
        gridRef.current.resetAfterIndices({ rowIndex, columnIndex }),
      timeout
    )
  );

  /* Update any styles, fonts if necessary */
  useEffect(() => {
    autoSizer.current.setFont();
  }, []);

  const getValueRef = useRef(getValue);
  /* Keep it in sync */
  getValueRef.current = getValue;

  const getColumnWidth = useCallback(
    (columnIndex: number) => {
      const { rowStartIndex, rowStopIndex } = viewport;
      const visibleRows = rowStopIndex || initialVisibleRows;
      let start = rowStartIndex;
      let maxWidth = minColumnWidth;
      while (start < visibleRows) {
        const value: string =
          getValueRef.current({
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
    [viewport, initialVisibleRows]
  );

  const handleViewChange = useCallback(
    (cells: ViewPortProps) => {
      if (!resizeOnScroll) return;
      setViewport(cells);
      if (gridRef.current) {
        debounceResizer.current({
          rowIndex: cells.rowStartIndex,
          columnIndex: cells.columnStartIndex,
        });
      }
    },
    [resizeOnScroll]
  );

  return {
    columnWidth: getColumnWidth,
    onViewChange: handleViewChange,
  };
};

/* Canvas element */
const AutoSizerCanvas = (defaultFont = "12px Arial") => {
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
