import React, { useCallback, useRef, useEffect } from "react";
import { useMeasure } from "react-use";
import Grid from "./../Grid";
import { Flex, useColorMode, theme } from "@chakra-ui/core";
import { BottomPanel, ThemeType } from "./../styled";
import Tabs from "./../Tabs";
import { SpreadSheetProps, Sheet, Cells } from "../Spreadsheet";
import { GridRef } from "@rowsncolumns/grid";

export interface WorkbookProps extends SpreadSheetProps {
  currentSheet: Sheet;
  theme: ThemeType;
  sheets: Sheet[];
  selectedSheet: string;
  onChangeSelectedSheet: (id: string) => void;
  onNewSheet?: () => void;
  onSheetChange?: (id: string, props: any) => void;
  onChangeSheetName?: (id: string, value: string) => void;
  onDeleteSheet?: (id: string) => void;
  onDuplicateSheet?: (id: string) => void;
}

/**
 * Workbook displays a list of sheets
 * @param props
 */
const Workbook: React.FC<WorkbookProps> = (props) => {
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
  } = props;
  const gridRef = useRef(null);
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
  const handleSheetChange = useCallback((args: any) => {
    if (!selectedSheetRef.current) return;
    onSheetChange?.(selectedSheetRef.current, args);
  }, []);
  const handleScroll = useCallback((scrollState) => {
    if (!selectedSheetRef.current) return;
    onSheetChange?.(selectedSheetRef.current, { scrollState });
  }, []);
  return (
    <>
      <Flex flex={1} ref={containerRef}>
        <Grid
          selectedSheet={selectedSheet}
          activeCell={activeCell}
          selections={selections}
          scrollState={scrollState}
          width={width}
          height={height}
          cells={cells}
          onChange={handleChange}
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
};

export default Workbook;
