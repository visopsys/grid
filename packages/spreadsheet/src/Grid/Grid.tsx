import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  memo,
  useImperativeHandle,
  forwardRef
} from "react";
import Grid, {
  RendererProps,
  useSelection,
  GridRef,
  useEditable,
  useCopyPaste,
  CellInterface,
  SelectionArea,
  ScrollCoords,
  AreaProps,
  StylingProps
} from "@rowsncolumns/grid";
import { debounce } from "@rowsncolumns/grid/dist/helpers";
import {
  ThemeProvider,
  ColorModeProvider,
  useColorMode
} from "@chakra-ui/core";
import {
  COLUMN_HEADER_WIDTH,
  DEFAULT_COLUMN_WIDTH,
  ROW_HEADER_HEIGHT,
  DEFAULT_ROW_HEIGHT,
  DARK_MODE_COLOR_LIGHT
} from "./../constants";
import HeaderCell from "./../HeaderCell";
import Cell from "./../Cell";
import { GridWrapper, ThemeType } from "./../styled";
import { Cells, CellConfig, SizeType } from "../Spreadsheet";
import { Direction } from "@rowsncolumns/grid/dist/types";
import { DATATYPE, CellDataFormatting, AXIS } from "../types";
import useAutoSizer from "@rowsncolumns/grid/dist/hooks/useSizer";

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
  onFill?: (
    activeCell: CellInterface,
    currentSelection: SelectionArea | null,
    selections: SelectionArea[]
  ) => void;
  activeCell: CellInterface | null;
  selections: SelectionArea[];
  onSheetChange: (props: any) => void;
  selectedSheet: string;
  onScroll: (state: ScrollCoords) => void;
  scrollState: ScrollCoords;
  onActiveCellChange: (cell: CellInterface | null, value?: string) => void;
  onActiveCellValueChange: (value: string) => void;
  onDelete?: (activeCell: CellInterface, selections: SelectionArea[]) => void;
  format?: (
    value: string,
    datatype?: DATATYPE,
    formatting?: CellDataFormatting
  ) => string;
  onResize?: (axis: AXIS, index: number, dimension: number) => void;
  columnSizes?: SizeType;
  rowSizes?: SizeType;
  mergedCells?: AreaProps[];
  borderStyles?: StylingProps;
  frozenRows?: number;
  frozenColumns?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface RowColSelection {
  rows: number[];
  cols: number[];
}

export type RefAttributeGrid = {
  ref?: React.MutableRefObject<WorkbookGridRef | null>;
};

export type WorkbookGridRef = {
  getNextFocusableCell: (
    cell: CellInterface,
    direction: Direction
  ) => CellInterface;
  setActiveCell: (cell: CellInterface | null) => void;
  focus: () => void;
  makeEditable: (cell: CellInterface, value?: string, focus?: boolean) => void;
  setEditorValue: (value: string, activeCell: CellInterface) => void;
  hideEditor: () => void;
  submitEditor: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface
  ) => void;
  cancelEditor: () => void;
  resizeColumns?: (indices: number[]) => void;
  resizeRows?: (indices: number[]) => void;
  getCellBounds?: (coords: CellInterface) => AreaProps;
  getScrollPosition?: () => ScrollCoords;
};

/**
 * Grid component
 * @param props
 */
const SheetGrid: React.FC<SheetGridProps & RefAttributeGrid> = memo(
  forwardRef((props, forwardedRef) => {
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
      onFill,
      onSheetChange,
      activeCell: initialActiveCell,
      selections: initialSelections = [],
      selectedSheet,
      onScroll,
      scrollState,
      onActiveCellChange,
      onActiveCellValueChange,
      onDelete,
      format,
      onResize,
      columnSizes = {},
      rowSizes = {},
      mergedCells,
      borderStyles,
      frozenRows = 0,
      frozenColumns = 0,
      onKeyDown
    } = props;
    const gridRef = useRef<GridRef | null>(null);
    const { colorMode } = useColorMode();
    const isLightMode = colorMode === "light";
    const onSheetChangeRef = useRef(debounce(onSheetChange, 100));
    const actualFrozenRows = Math.max(1, frozenRows + 1);
    const actualFrozenColumns = Math.max(1, frozenColumns + 1);

    useImperativeHandle(forwardedRef, () => {
      return {
        getNextFocusableCell,
        setActiveCell,
        focus: () => gridRef.current?.focus(),
        resetAfterIndices: gridRef.current?.resetAfterIndices,
        makeEditable,
        setEditorValue: setValue,
        hideEditor,
        submitEditor,
        cancelEditor,
        resizeColumns: gridRef.current?.resizeColumns,
        resizeRows: gridRef.current?.resizeRows,
        getCellBounds: gridRef.current?.getCellBounds,
        getScrollPosition: gridRef.current?.getScrollPosition
      };
    });

    /**
     * Get cell value or text
     */
    const getValue = useCallback(
      (cell: CellInterface | null, obj = false) => {
        if (!cell) return void 0;
        const { rowIndex, columnIndex } = cell;
        return rowIndex in cells
          ? obj
            ? cells[rowIndex][columnIndex]
            : cells[rowIndex][columnIndex]?.text
          : void 0;
      },
      [cells]
    );

    /**
     * Column resizer
     */
    const { getColumnWidth } = useAutoSizer({
      gridRef,
      minColumnWidth,
      getValue,
      columnSizes,
      autoResize: false,
      resizeOnScroll: false
    });

    /**
     * Selection
     */
    const {
      selections,
      activeCell,
      setActiveCell,
      setSelections,
      modifySelection,
      newSelection,
      clearLastSelection,
      ...selectionProps
    } = useSelection({
      initialActiveCell,
      initialSelections,
      gridRef,
      rowCount,
      columnCount,
      onFill
    });

    /**
     * Check if selections are in
     */
    useEffect(() => {
      onActiveCellChange?.(
        activeCell,
        getValue(activeCell) as string | undefined
      );
    }, [activeCell]);

    /**
     * If grid changes, lets restore the state
     */
    useEffect(() => {
      if (scrollState) gridRef.current?.scrollTo(scrollState);
      setActiveCell(initialActiveCell);
      setSelections(initialSelections);
      const rowIndices = Object.keys(rowSizes).map(Number);
      const colIndices = Object.keys(columnSizes).map(Number);
      gridRef.current?.resetAfterIndices?.({
        rowIndex: rowIndices.length ? Math.min(...rowIndices) : 0,
        columnIndex: colIndices.length ? Math.min(...colIndices) : 0
      });
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
        const previousCell = getValue(cell, true);
        const changes = {
          [rowIndex]: {
            [columnIndex]: {
              text: value
            }
          }
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
    const {
      editorComponent,
      isEditInProgress,
      nextFocusableCell,
      makeEditable,
      setValue,
      hideEditor,
      submitEditor,
      cancelEditor,
      editingCell,
      showEditor,
      ...editableProps
    } = useEditable({
      frozenRows: actualFrozenRows,
      frozenColumns: actualFrozenColumns,
      gridRef,
      selections,
      activeCell,
      onSubmit: handleSubmit,
      getValue,
      onChange: onActiveCellValueChange,
      canEdit: (cell: CellInterface) => {
        if (cell.rowIndex === 0 || cell.columnIndex === 0) return false;
        return true;
      },
      onDelete: onDelete
    });

    const getNextFocusableCell = useCallback(
      (cell: CellInterface, direction: Direction): CellInterface => {
        return nextFocusableCell(cell, direction);
      },
      []
    );

    /**
     * Copy paste
     */
    useCopyPaste({
      gridRef,
      getValue,
      selections
    });

    /* Width calculator */
    const columnWidth = useCallback(
      (columnIndex: number) => {
        if (columnIndex === 0) return COLUMN_HEADER_WIDTH;
        return columnSizes[columnIndex] || minColumnWidth;
      },
      [minColumnWidth, columnSizes, selectedSheet]
    );
    const rowHeight = useCallback(
      (rowIndex: number) => {
        if (rowIndex === 0) return ROW_HEADER_HEIGHT;
        return rowSizes[rowIndex] || minRowHeight;
      },
      [minColumnWidth, rowSizes, selectedSheet]
    );
    const contextWrapper = useCallback(
      children => {
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

    /**
     * Adjusts a column
     */
    const handleAdjustColumn = useCallback(
      (columnIndex: number) => {
        const width = getColumnWidth(columnIndex);
        onResize?.(AXIS.X, columnIndex, width);
      },
      [cells]
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
          return (
            <HeaderCellRenderer
              {...props}
              isActive={isHeaderActive}
              onResize={onResize}
              onAdjustColumn={handleAdjustColumn}
            />
          );
        return (
          <CellRenderer
            {...props}
            {...(getValue(cell, true) as CellConfig)}
            format={format}
          />
        );
      },
      [cells, selectedRowsAndCols, activeCell]
    );

    const handleScroll = useCallback(
      (scrollState: ScrollCoords) => {
        editableProps.onScroll?.(scrollState);
        // Save scroll state in sheet
        // onScroll?.(scrollState);
      },
      [selectedSheet]
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
          width={width}
          height={height}
          itemRenderer={itemRenderer}
          wrapper={contextWrapper}
          selections={selections}
          activeCell={activeCell}
          fillhandleBorderColor={fillhandleBorderColor}
          showFillHandle={!isEditInProgress}
          mergedCells={mergedCells}
          borderStyles={borderStyles}
          frozenRows={actualFrozenRows}
          frozenColumns={actualFrozenColumns}
          {...selectionProps}
          {...editableProps}
          onScroll={handleScroll}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            selectionProps.onMouseDown(e);
            editableProps.onMouseDown(e);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            selectionProps.onKeyDown(e);
            editableProps.onKeyDown(e);
            onKeyDown?.(e);
          }}
        />
        {editorComponent}
      </GridWrapper>
    );
  })
);

export default SheetGrid;
