import React, { useCallback, useRef, useEffect, memo, forwardRef } from "react";
import { useMeasure } from "react-use";
import Grid from "./../Grid";
import { Flex, useColorMode, useTheme } from "@chakra-ui/core";
import { BottomPanel, ThemeType } from "./../styled";
import Tabs from "./../Tabs";
import { SpreadSheetProps, Sheet, Cells, SizeType } from "../Spreadsheet";
import { CellInterface, SelectionArea, ScrollCoords } from "@rowsncolumns/grid";
import { WorkbookGridRef } from "../Grid/Grid";
import { AXIS } from "../types";
import QuickInfo from "./../QuickInfo";
import { DARK_MODE_COLOR_LIGHT, DARK_MODE_COLOR } from "../constants";

export interface WorkbookProps extends SpreadSheetProps {
  currentSheet: Sheet;
  theme: ThemeType;
  sheets: Sheet[];
  selectedSheet: string;
  onFill?: (
    id: string,
    activeCell: CellInterface,
    currentSelection: SelectionArea | null,
    selections: SelectionArea[]
  ) => void;
  onDelete?: (
    id: string,
    activeCell: CellInterface,
    selections: SelectionArea[]
  ) => void;
  onActiveCellChange: (cell: CellInterface | null, value?: string) => void;
  onChangeSelectedSheet: (id: string) => void;
  onNewSheet?: () => void;
  onSheetChange?: (id: string, props: any) => void;
  onScroll?: (id: string, scrollState: ScrollCoords) => void;
  onChangeSheetName?: (id: string, value: string) => void;
  onDeleteSheet?: (id: string) => void;
  onDuplicateSheet?: (id: string) => void;
  onResize?: (id: string, axis: AXIS, index: number, dimension: number) => void;
  onActiveCellValueChange: (value: string) => void;
  rowSizes?: SizeType;
  columnSizes?: SizeType;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  hiddenRows?: number[];
  hiddenColumns?: number[];
  onPaste?: (
    id: string,
    rows: (string | null)[][],
    activeCell: CellInterface | null
  ) => void;
  onCut?: (id: string, selection: SelectionArea) => void;
  onInsertRow?: (
    id: string,
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onDeleteRow?: (
    id: string,
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onInsertColumn?: (
    id: string,
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onDeleteColumn?: (
    id: string,
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
}

export type RefAttributeWorkbook = {
  ref?: React.MutableRefObject<WorkbookGridRef | null | undefined>;
};

/**
 * Workbook displays a list of sheets
 * @param props
 */
const Workbook: React.FC<WorkbookProps & RefAttributeWorkbook> = memo(
  forwardRef((props, forwardedRef) => {
    const {
      selectedSheet,
      onChangeSelectedSheet,
      sheets,
      onChange,
      minColumnWidth,
      minRowHeight,
      CellRenderer,
      HeaderCellRenderer,
      onNewSheet,
      onSheetChange,
      theme,
      onChangeSheetName,
      onDeleteSheet,
      onDuplicateSheet,
      currentSheet,
      onActiveCellChange,
      onActiveCellValueChange,
      onFill,
      onDelete,
      format,
      onResize,
      onScroll,
      onKeyDown,
      hiddenRows,
      hiddenColumns,
      onPaste,
      onCut,
      onInsertRow,
      onInsertColumn,
      onDeleteColumn,
      onDeleteRow,
      rowCount,
      columnCount
    } = props;

    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";
    const [containerRef, { width, height }] = useMeasure();
    const {
      cells,
      activeCell,
      selections,
      scrollState,
      columnSizes = {},
      rowSizes = {},
      mergedCells,
      borderStyles,
      frozenRows,
      frozenColumns
    } = currentSheet;
    const selectedSheetRef = useRef(selectedSheet);
    useEffect(() => {
      selectedSheetRef.current = selectedSheet;
    });
    const handleChange = useCallback((changes: Cells) => {
      if (!selectedSheetRef.current) return;
      onChange?.(selectedSheetRef.current, changes);
    }, []);
    const handleFill = useCallback(
      (
        cell: CellInterface,
        currentSelection: SelectionArea | null,
        selections: SelectionArea[]
      ) => {
        onFill?.(selectedSheetRef.current, cell, currentSelection, selections);
      },
      []
    );
    const handleSheetChange = useCallback((args: any) => {
      if (!selectedSheetRef.current) return;
      onSheetChange?.(selectedSheetRef.current, args);
    }, []);
    const handleScroll = useCallback((scrollState: ScrollCoords) => {
      if (!selectedSheetRef.current) return;
      onScroll?.(selectedSheetRef.current, scrollState);
    }, []);
    const handleDelete = useCallback(
      (activeCell: CellInterface, selections: SelectionArea[]) => {
        if (!selectedSheetRef.current) return;
        onDelete?.(selectedSheetRef.current, activeCell, selections);
      },
      []
    );

    const handleResize = useCallback(
      (axis: AXIS, index: number, dimension: number) => {
        if (!selectedSheetRef.current) return;
        onResize?.(selectedSheetRef.current, axis, index, dimension);
      },
      []
    );

    const handlePaste = useCallback((rows, activeCell) => {
      onPaste?.(selectedSheetRef.current, rows, activeCell);
    }, []);

    const handleCut = useCallback((selection: SelectionArea) => {
      onCut?.(selectedSheetRef.current, selection);
    }, []);

    const handleInsertRow = useCallback(
      (cell: CellInterface | null, selections: SelectionArea[]) => {
        onInsertRow?.(selectedSheetRef.current, cell, selections);
      },
      []
    );

    const handleInsertColumn = useCallback(
      (cell: CellInterface | null, selections: SelectionArea[]) => {
        onInsertColumn?.(selectedSheetRef.current, cell, selections);
      },
      []
    );

    const handleDeleteRow = useCallback(
      (cell: CellInterface | null, selections: SelectionArea[]) => {
        onDeleteRow?.(selectedSheetRef.current, cell, selections);
      },
      []
    );

    const handleDeleteColumn = useCallback(
      (cell: CellInterface | null, selections: SelectionArea[]) => {
        onDeleteColumn?.(selectedSheetRef.current, cell, selections);
      },
      []
    );

    return (
      <>
        <Flex
          flex={1}
          ref={containerRef}
          background={isLight ? "white" : DARK_MODE_COLOR_LIGHT}
        >
          <Grid
            // @ts-ignore
            ref={forwardedRef}
            onResize={handleResize}
            onDelete={handleDelete}
            onActiveCellValueChange={onActiveCellValueChange}
            onActiveCellChange={onActiveCellChange}
            selectedSheet={selectedSheet}
            activeCell={activeCell}
            selections={selections}
            scrollState={scrollState}
            width={width}
            height={height}
            cells={cells}
            onChange={handleChange}
            onFill={handleFill}
            minColumnWidth={minColumnWidth}
            minRowHeight={minRowHeight}
            CellRenderer={CellRenderer}
            HeaderCellRenderer={HeaderCellRenderer}
            onSheetChange={handleSheetChange}
            onScroll={handleScroll}
            format={format}
            columnSizes={columnSizes}
            rowSizes={rowSizes}
            mergedCells={mergedCells}
            borderStyles={borderStyles}
            frozenRows={frozenRows}
            frozenColumns={frozenColumns}
            onKeyDown={onKeyDown}
            hiddenRows={hiddenRows}
            hiddenColumns={hiddenColumns}
            onPaste={handlePaste}
            onCut={handleCut}
            onInsertRow={handleInsertRow}
            onInsertColumn={handleInsertColumn}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            theme={theme}
            rowCount={rowCount}
            columnCount={columnCount}
          />
        </Flex>
        <Flex>
          <BottomPanel
            background={isLight ? "#f1f3f4" : theme.colors.gray[800]}
            borderTopColor={isLight ? "#e8eaed" : theme?.colors.gray[600]}
            borderTopWidth={1}
            borderTopStyle="solid"
          >
            <Tabs
              sheets={sheets}
              selectedSheet={selectedSheet}
              onNewSheet={onNewSheet}
              onSelect={onChangeSelectedSheet}
              onChangeSheetName={onChangeSheetName}
              onDeleteSheet={onDeleteSheet}
              onDuplicateSheet={onDuplicateSheet}
            />
            <QuickInfo selections={selections} cells={cells} />
          </BottomPanel>
        </Flex>
      </>
    );
  })
);

export default Workbook;
