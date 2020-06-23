import React, {
  useCallback,
  useRef,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle
} from "react";
import { useMeasure } from "react-use";
import Grid from "./../Grid";
import { Flex, useColorMode } from "@chakra-ui/core";
import { BottomPanel, ThemeType } from "./../styled";
import Tabs from "./../Tabs";
import { SpreadSheetProps, Sheet, Cells } from "../Spreadsheet";
import { CellInterface, SelectionArea, GridRef } from "@rowsncolumns/grid";
import { WorkbookGridRef, RefAttributeGrid } from "../Grid/Grid";

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
  onActiveCellValueChange: (value: string) => void;
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
      onDelete
    } = props;

    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";
    const [containerRef, { width, height }] = useMeasure();
    const { cells, name, activeCell, selections, scrollState } = currentSheet;
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
    const handleScroll = useCallback(scrollState => {
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

    return (
      <>
        <Flex flex={1} ref={containerRef}>
          <Grid
            // @ts-ignore
            ref={forwardedRef}
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
