import React, { useCallback, useRef, useMemo, useEffect } from "react";
import Grid, {
  RendererProps,
  useSelection,
  GridRef,
  useEditable,
  useCopyPaste,
  useUndo,
  CellInterface,
  SelectionProps,
  SelectionArea,
  ScrollCoords,
} from "@rowsncolumns/grid";
import { debounce } from "@rowsncolumns/grid/dist/helpers";
import {
  ThemeProvider,
  ColorModeProvider,
  useTheme,
  useColorMode,
} from "@chakra-ui/core";
import {
  COLUMN_HEADER_WIDTH,
  DEFAULT_COLUMN_WIDTH,
  ROW_HEADER_HEIGHT,
  DEFAULT_ROW_HEIGHT,
  DARK_MODE_COLOR_LIGHT,
} from "./../constants";
import HeaderCell from "./../HeaderCell";
import Cell from "./../Cell";
import { GridWrapper, ThemeType } from "./../styled";
import { Cells } from "../Spreadsheet";

export interface SheetGridProps {
  theme?: ThemeType;
  minColumnWidth?: number;
  minRowHeight?: number;
  rowCount?: number;
  columnCount?: number;
  CellRenderer?: React.FC<RendererProps>;
  HeaderCellRenderer?: React.FC<RendererProps>;
  width?: number;
  height?: number;
  cells: Cells;
  onChange: (changes: Cells) => void;
  activeCell: CellInterface | null;
  selections: SelectionArea[];
  onSheetChange: (props: any) => void;
  selectedSheet: string;
  onScroll: (state: ScrollCoords) => void;
  scrollState: ScrollCoords;
}

export interface RowColSelection {
  rows: number[];
  cols: number[];
}

/**
 * Grid component
 * @param props
 */
const SheetGrid: React.FC<SheetGridProps> = (props) => {
  const {
    theme,
    minColumnWidth = DEFAULT_COLUMN_WIDTH,
    minRowHeight = DEFAULT_ROW_HEIGHT,
    rowCount = 1000,
    columnCount = 1000,
    width,
    height,
    CellRenderer = Cell,
    HeaderCellRenderer = HeaderCell,
    cells,
    onChange,
    onSheetChange,
    activeCell: initialActiveCell,
    selections: initialSelections = [],
    selectedSheet,
    onScroll,
    scrollState,
  } = props;
  const gridRef = useRef<GridRef | null>(null);
  const { colorMode } = useColorMode();
  const isLightMode = colorMode === "light";
  const onSheetChangeRef = useRef(debounce(onSheetChange, 300));

  /**
   * Get cell value or text
   */
  const getValue = useCallback(
    ({ rowIndex, columnIndex }: CellInterface, obj = false) => {
      return rowIndex in cells
        ? obj
          ? cells[rowIndex][columnIndex]
          : cells[rowIndex][columnIndex]?.text
        : undefined;
    },
    [cells]
  );

  /**
   * Selection
   */
  const {
    selections,
    activeCell,
    setActiveCell,
    setSelections,
    ...selectionProps
  } = useSelection({
    initialActiveCell,
    initialSelections,
    gridRef,
    rowCount,
    columnCount,
    onFill: (activeCell, fillSelection, allSelections) => {
      if (!fillSelection) return;
      /* Check if user is trying to extend a selection */
      const { bounds } = fillSelection;
      const changes: Cells = {};
      const previousChanges = {};
      const value = getValue(activeCell, true);
      for (let i = bounds.top; i <= bounds.bottom; i++) {
        for (let j = bounds.left; j <= bounds.right; j++) {
          if (!(i in changes)) changes[i] = {};
          changes[i][j] = value;
        }
      }
      onChange?.(changes);
    },
  });

  /**
   * If grid changes, lets restore the state
   */
  useEffect(() => {
    if (scrollState) gridRef.current?.scrollTo(scrollState);
    setActiveCell(initialActiveCell);
    setSelections(initialSelections);
  }, [selectedSheet]);

  /**
   * Save it back to sheet
   */
  useEffect(() => {
    onSheetChangeRef.current?.({ activeCell, selections });
  }, [activeCell, selections]);

  const handleSubmit = useCallback(
    (
      value: string,
      cell: CellInterface,
      nextActiveCell?: CellInterface | null
    ) => {
      const { rowIndex, columnIndex } = cell;
      const changes = {
        [rowIndex]: {
          [columnIndex]: {
            text: value,
          },
        },
      };

      onChange?.(changes);

      /* Focus on next active cell */
      if (nextActiveCell) setActiveCell(nextActiveCell);
    },
    [cells]
  );

  /**
   * Editable
   */
  const { editorComponent, isEditInProgress, ...editableProps } = useEditable({
    gridRef,
    selections,
    activeCell,
    onSubmit: handleSubmit,
    getValue,
  });

  /**
   * Copy paste
   */
  useCopyPaste({
    gridRef,
    getValue,
    selections,
  });
  /**
   * Undo/redo
   */
  const { undo, redo, add, canUndo, canRedo, ...undoProps } = useUndo();

  /* Width calculator */
  const columnWidth = useCallback(
    (columnIndex: number) => {
      if (columnIndex === 0) return COLUMN_HEADER_WIDTH;
      return minColumnWidth;
    },
    [minColumnWidth]
  );
  const rowHeight = useCallback(
    (rowIndex: number) => {
      if (rowIndex === 0) return ROW_HEADER_HEIGHT;
      return minRowHeight;
    },
    [minColumnWidth]
  );
  const contextWrapper = useCallback(
    (children) => {
      return (
        <ThemeProvider theme={theme}>
          <ColorModeProvider>{children}</ColorModeProvider>
        </ThemeProvider>
      );
    },
    [theme]
  );
  const selectedRowsAndCols: RowColSelection = useMemo(
    () =>
      selections.reduce(
        (acc, { bounds }) => {
          for (let i = bounds.left; i <= bounds.right; i++) {
            acc.cols.push(i);
          }
          for (let i = bounds.top; i <= bounds.bottom; i++) {
            acc.rows.push(i);
          }
          return acc;
        },
        { rows: [], cols: [] } as RowColSelection
      ),
    [selections]
  );

  const itemRenderer = useCallback(
    (props: RendererProps) => {
      const { rowIndex, columnIndex } = props;
      const isRowHeader = rowIndex === 0;
      const isColumnHeader = columnIndex === 0;
      const isHeaderActive =
        isRowHeader || isColumnHeader
          ? isRowHeader
            ? activeCell?.columnIndex === columnIndex ||
              selectedRowsAndCols.cols.includes(columnIndex)
            : activeCell?.rowIndex === rowIndex ||
              selectedRowsAndCols.rows.includes(rowIndex)
          : false;
      const cell = { rowIndex, columnIndex };
      if (rowIndex === 0 || columnIndex === 0)
        return <HeaderCellRenderer {...props} isActive={isHeaderActive} />;
      return <CellRenderer {...props} {...getValue(cell, true)} />;
    },
    [CellRenderer, HeaderCellRenderer, cells, selectedRowsAndCols, activeCell]
  );
  const fillhandleBorderColor = isLightMode ? "white" : DARK_MODE_COLOR_LIGHT;

  return (
    <GridWrapper>
      <Grid
        ref={gridRef}
        rowCount={rowCount}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        frozenColumns={1}
        frozenRows={1}
        width={width}
        height={height}
        itemRenderer={itemRenderer}
        wrapper={contextWrapper}
        selections={selections}
        activeCell={activeCell}
        fillhandleBorderColor={fillhandleBorderColor}
        showFillHandle={!isEditInProgress}
        {...selectionProps}
        {...editableProps}
        onScroll={(scrollState: ScrollCoords) => {
          editableProps.onScroll(scrollState);
          onScroll(scrollState);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          selectionProps.onKeyDown(e);
          editableProps.onKeyDown(e);
          undoProps.onKeyDown(e);
        }}
      />
      {editorComponent}
    </GridWrapper>
  );
};

export default SheetGrid;
