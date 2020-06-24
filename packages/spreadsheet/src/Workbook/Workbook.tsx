import React, { useCallback, useRef, useEffect, memo, forwardRef } from "react";
import { useMeasure } from "react-use";
import Grid from "./../Grid";
import { Flex, useColorMode } from "@chakra-ui/core";
import { BottomPanel, ThemeType } from "./../styled";
import Tabs from "./../Tabs";
import { SpreadSheetProps, Sheet, Cells, SizeType } from "../Spreadsheet";
import { CellInterface, SelectionArea } from "@rowsncolumns/grid";
import { WorkbookGridRef } from "../Grid/Grid";
import { AXIS } from "../types";
import { DARK_MODE_COLOR_LIGHT } from "../constants";

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
  onChangeSheetName?: (id: string, value: string) => void;
  onDeleteSheet?: (id: string) => void;
  onDuplicateSheet?: (id: string) => void;
  onResize?: (id: string, axis: AXIS, index: number, dimension: number) => void;
  onActiveCellValueChange: (value: string) => void;
  rowSizes?: SizeType;
  columnSizes?: SizeType;
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
      frozenColumns,
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
    const handleScroll = useCallback((scrollState) => {
      if (!selectedSheetRef.current) return;
      onSheetChange?.(selectedSheetRef.current, { scrollState });
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
    return (
      <>
        <Flex
          flex={1}
          ref={containerRef}
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
          </BottomPanel>
        </Flex>
      </>
    );
  })
);
export default Workbook;
