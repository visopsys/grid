import React, { useState, useCallback, useEffect, useMemo } from 'react'
import Toolbar from './Toolbar'
import Formulabar from './Formulabar'
import Workbook from './Workbook'
import { theme, ThemeProvider, ColorModeProvider, CSSReset, Flex } from "@chakra-ui/core"
import { Global, css } from "@emotion/core"
import { RendererProps, CellInterface, SelectionArea, ScrollCoords } from '@rowsncolumns/grid'
import useControllableState from './useControllableState'
import { createNewSheet, FORMATTING, uuid } from './constants'

export interface SpreadSheetProps {
  minColumnWidth?: number
  minRowHeight?: number
  rowCount?: number
  columnCount?: number;
  CellRenderer?: React.FC<RendererProps>
  HeaderCellRenderer?: React.FC<RendererProps>;
  sheets?: Sheet[];
  initialSheets?: Sheet[];
  onNewSheet?: () => void;
  activeSheet?: string;
  initialActiveSheet?: string;
  onChange?: (id: string, changes: Cells) => void
  onChangeSelectedSheet?: (id: string) => void
  onChangeSheets?: (sheets: Sheet[]) => void;
  showFormulabar?: boolean
}

export interface Sheet {
  id: string;
  name: string,
  cells: Cells;
  activeCell: CellInterface | null;
  selections: SelectionArea []
  scrollState: ScrollCoords
}

export type Cells = Record<number, Cell>
export type Cell = Record<number, any>

/**
 * Spreadsheet component
 * @param props 
 */
const defaultActiveSheet = uuid()
const defaultSheets = [
  {
    id: defaultActiveSheet,
    name: 'Sheet1',
    activeCell: {
      rowIndex: 1,
      columnIndex: 1
    },
    selections: [],
    cells: {
      1: {
        1: {
          text: 'Hello world',
          fill: 'green'
        }
      }
    },
    scrollState: { scrollTop: 0, scrollLeft: 0}
  }
]
const Spreadsheet = (props: SpreadSheetProps) => {
  const { initialSheets = defaultSheets, sheets: controlledSheets, onChange, showFormulabar = true, minColumnWidth, minRowHeight, CellRenderer, HeaderCellRenderer, initialActiveSheet = defaultActiveSheet, activeSheet, onChangeSelectedSheet, onChangeSheets } = props
  const [ selectedSheet, setSelectedSheet ] = useControllableState<string>({
    defaultValue: initialActiveSheet,
    value: activeSheet,
    onChange: onChangeSelectedSheet
  })  
  const [ sheets, setSheets ] = useControllableState<Sheet[]>({
    defaultValue: initialSheets,
    value: controlledSheets
  })
  /* Callback when sheets is changed */
  useEffect(() => {
    onChangeSheets?.(sheets)
  }, [ sheets ])

  /**
   * Handle add new sheet
   */
  const handleNewSheet = useCallback(() => {
    const count = sheets.length
    const newSheet = createNewSheet({ count: count + 1 })
    setSheets(prev => prev.concat(newSheet))
    setSelectedSheet(newSheet.id)
  }, [ sheets ])

  const handleChange = useCallback((id: string, changes: Cells) => {
    setSheets(prev => {
      return prev.map((sheet, idx) => {
        if (id === sheet.id) {
          const { cells } = sheet
          for (const row in changes) {
            if (!(row in sheet.cells)) sheet.cells[row] = {}
            for (const col in changes[row]) {
              if (!(col in sheet.cells[row])) sheet.cells[row][col] = {}
              const curChanges = changes[row][col]
              for (const key in curChanges) {
                sheet.cells[row][col][key] = curChanges[key]
              }              
            }
          }
          return sheet
        }
        return sheet
      })
    })
  }, [])

  const handleSheetAttributesChange = useCallback((id: string, changes: any) => {
    setSheets(prev => {
      return prev.map((sheet, idx) => {
        if (id === sheet.id) {
          return {
            ...sheet,
            ...changes
          }
        }
        return sheet
      })
    })
  }, [])

  const handleChangeSheetName = useCallback((id: string, name: string) => {
    setSheets(prev => {
      return prev.map((sheet, idx) => {
        if (id === sheet.id) {
          return {
            ...sheet,
            name,
          }
        }
        return sheet
      })
    })
  }, [])

  const handleDeleteSheet = useCallback((id: string) => {
    const index = sheets.findIndex(sheet => sheet.id === id)
    const newSheets = sheets.filter(sheet => sheet.id !== id)
    setSelectedSheet(prev => {
      if (prev === id) return newSheets[Math.max(0, index - 1)].id
      return prev
    })
    setSheets(newSheets)
  }, [ sheets ])

  const handleDuplicateSheet = useCallback((id: string) => {
    const newSheetId = uuid()
    setSheets(prev => {
      const index = prev.findIndex(sheet => sheet.id === id)
      if (index === -1) return prev
      const insertIndex = index + 1
      const currentSheet = { ...prev[index], id: newSheetId }
      return [
        ...prev.slice(0, insertIndex),
        {
          ...currentSheet,
          name: `Copy of ${currentSheet.name}`
        },
        ...prev.slice(insertIndex)
      ]
    })
    setSelectedSheet(newSheetId)
  }, [])


  const handleFormattingChange = useCallback((type, value) => {
    const currentSheet = sheets.find(sheet => sheet.id === selectedSheet)
    if (!currentSheet) return
    const { activeCell, selections, cells } = currentSheet
    if (!activeCell) return
    const { rowIndex, columnIndex } = activeCell
    const changes: Cell = {}
    if (selections.length) {
      const { bounds } = selections[selections.length - 1]
      for (let i = bounds.top; i <= bounds.bottom; i++) {
        if (!(i in changes)) changes[i] = {}
        for (let j = bounds.left; j <= bounds.right; j++) {
          changes[i][j] = cells[i]?.[j] ?? {}
        }
      }
    } else {
      if (!(rowIndex in changes)) changes[rowIndex] = {}
      changes[rowIndex][columnIndex] = cells[rowIndex]?.[columnIndex] ?? {}
    }    
    switch (type) {
      case FORMATTING.FONT_STYLE:
      case FORMATTING.FONT_WEIGHT:
      case FORMATTING.TEXT_DECORATION:
        for (const row in changes) {
          for (const col in changes[row]) {
            changes[row][col][type] = value
          }
        }
        break
    }
    
    handleChange(selectedSheet, changes)
  }, [sheets, selectedSheet])

  /**
   * Pass active cell config back to toolbars
   */
  const currentSheet = useMemo(() => {
    return sheets.find(sheet => sheet.id === selectedSheet) as Sheet
  }, [sheets, selectedSheet])

  const { activeCell, cells } = currentSheet || {}
  const activeCellConfig = activeCell
    ? cells?.[activeCell.rowIndex]?.[activeCell.columnIndex]
    : null

  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Global
        styles={css`
          .rowsncolumns-grid-container:focus{
            outline: none;
          }
        `}
      />
      <ColorModeProvider>
        <Flex flexDirection='column' flex={1}>
          <Toolbar
            fill={activeCellConfig?.fill}
            fontWeight={activeCellConfig?.fontWeight}
            fontStyle={activeCellConfig?.fontStyle}
            textDecoration={activeCellConfig?.textDecoration}
            onFormattingChange={handleFormattingChange}
          />
          <Formulabar />
          <Workbook
            currentSheet={currentSheet}
            selectedSheet={selectedSheet}
            onChangeSelectedSheet={setSelectedSheet}
            onNewSheet={handleNewSheet}
            theme={theme}            
            sheets={sheets}
            onChange={handleChange}
            onSheetChange={handleSheetAttributesChange}
            minColumnWidth={minColumnWidth}
            minRowHeight={minRowHeight}
            CellRenderer={CellRenderer}
            HeaderCellRenderer={HeaderCellRenderer}
            onChangeSheetName={handleChangeSheetName}
            onDeleteSheet={handleDeleteSheet}
            onDuplicateSheet={handleDuplicateSheet}
          />
        </Flex>
      </ColorModeProvider>
    </ThemeProvider>
  )
}

export default Spreadsheet
