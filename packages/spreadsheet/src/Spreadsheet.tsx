import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Toolbar from './Toolbar'
import Formulabar from './Formulabar'
import Workbook from './Workbook'
import { theme, ThemeProvider, ColorModeProvider, CSSReset, Flex } from "@chakra-ui/core"
import { Global, css } from "@emotion/core"
import { RendererProps, CellInterface, SelectionArea, ScrollCoords } from '@rowsncolumns/grid'
import useControllableState from './useControllableState'
import { createNewSheet, uuid } from './constants'
import { FORMATTING_TYPE, DATATYPE, VERTICAL_ALIGNMENT, HORIZONTAL_ALIGNMENT, CellFormatting } from './types'
import { useImmer } from 'use-immer'
import { WorkbookGridRef } from './Grid/Grid'
import { KeyCodes, Direction } from '@rowsncolumns/grid/dist/types'

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
  showToolbar?: boolean;
  formatter?: (cell: CellConfig) => string
}

export interface Sheet {
  id: string;
  name: string,
  cells: Cells;
  activeCell: CellInterface | null;
  selections: SelectionArea []
  scrollState: ScrollCoords
}

export type Cells = Record<string, Cell>
export type Cell = Record<string, CellConfig>
export interface CellConfig extends CellFormatting {
  text?: string;
}

/**
 * Spreadsheet component
 * TODO
 * 1. Reduce scroll jump
 * @param props 
 */
const defaultActiveSheet = uuid()
const defaultSheets: Sheet[] = [
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
          fill: 'green',
          color: 'red',
          bold: true,
          italic: true,
          verticalAlignment: VERTICAL_ALIGNMENT.MIDDLE,
          horizontalAlignment: HORIZONTAL_ALIGNMENT.LEFT,
          strike: true,
          underline: true,
          percent: true,
          decimals: 4
        },
        2: {
          text: '2',
          datatype: DATATYPE.NUMBER,
          // Prevent nested properties: Re-rendering onchange is hard
          // formatting: {
          //   percent: true,
          //   // decimals: 2
          // }
        }
      }
    },
    scrollState: { scrollTop: 0, scrollLeft: 0}
  }
]
const Spreadsheet = (props: SpreadSheetProps) => {
  const { initialSheets = defaultSheets, sheets: controlledSheets, onChange, showFormulabar = true, minColumnWidth, minRowHeight, CellRenderer, HeaderCellRenderer, initialActiveSheet = defaultActiveSheet, activeSheet, onChangeSelectedSheet, onChangeSheets, showToolbar = true } = props
  const [ selectedSheet, setSelectedSheet ] = useControllableState<string>({
    defaultValue: initialActiveSheet,
    value: activeSheet,
    onChange: onChangeSelectedSheet
  })
  const currentGrid = useRef<WorkbookGridRef>()
  const [ sheets, setSheets ] = useImmer<Sheet[]>(initialSheets)
  const [ formulaInput, setFormulaInput ] = useState('')

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
    setSheets(draft => {
      (draft as Sheet[]).push(newSheet)
    })
    setSelectedSheet(newSheet.id)
  }, [ sheets ])

  const handleChange = useCallback((id: string, changes: Cells) => {    
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id)
      if (sheet) {
        for (const row in changes) {
          if (!(row in sheet.cells)) sheet.cells[row] = {}
          for (const col in changes[row]) {
            if (!(col in sheet.cells[row])) sheet.cells[row][col] = {}
            const cur = sheet.cells[row][col]
            sheet.cells[row][col] = {
              ...cur,
              ...changes[row][col]
            }
          }
        }
      }
    })
    onChange?.(id, changes)
  }, [])

  const handleSheetAttributesChange = useCallback((id: string, changes: any) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id)
      if (sheet) {
        for (const key in changes) {
          sheet[key as keyof Sheet] = changes[key]
        }
      }
    })
  }, [])

  const handleChangeSheetName = useCallback((id: string, name: string) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id)
      if (sheet) sheet.name = name
    })
  }, [])

  const handleDeleteSheet = useCallback((id: string) => {
    if (sheets.length === 1) return
    const index = sheets.findIndex(sheet => sheet.id === id)
    const newSheets = sheets.filter(sheet => sheet.id !== id)
    setSelectedSheet(prev => {
      if (prev === id) return newSheets[Math.max(0, index - 1)].id
      return prev
    })
    setSheets(draft => {
      draft.splice(index, 1)
    })
  }, [ sheets ])

  const handleDuplicateSheet = useCallback((id: string) => {
    const newSheetId = uuid()
    setSheets(draft => {
      const index = draft.findIndex(sheet => sheet.id === id)
      if (index === -1) return
      const currentSheet = { ...draft[index], id: newSheetId }
      const newSheet = {
        ...currentSheet,
        name: `Copy of ${currentSheet.name}`
      }
      draft.splice(index + 1, 0, newSheet)
    })
    setSelectedSheet(newSheetId)
  }, [])

  /**
   * When cell or selection formatting change
   */
  const handleFormattingChange = useCallback((type, value) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === selectedSheet)
      if (sheet) {
        const { activeCell, selections, cells } = sheet
        if (selections.length) {
          selections.forEach(sel => {
            const { bounds } = sel
            for (let i = bounds.top; i <= bounds.bottom; i++) {
              if (!(i in cells)) cells[i] = {}
              for (let j = bounds.left; j <= bounds.right; j++) {
                if (!(j in cells[i])) cells[i][j] = {}              
                cells[i][j][type as keyof CellFormatting] = value
              }
            }
          })
        } else if (activeCell) {
          const { rowIndex, columnIndex} = activeCell
          if (!(rowIndex in cells)) cells[rowIndex] = {}
          if (!(columnIndex in cells[rowIndex])) cells[rowIndex][columnIndex] = {}   
          cells[rowIndex][columnIndex][type as keyof CellFormatting] = value
        }
      }
    })
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

  const handleActiveCellChange = useCallback((cell: CellInterface | null, value) => {    
    if (!cell) return
    setFormulaInput(value || '')
  }, [])

  const handleActiveCellValueChange = useCallback(value => {
    setFormulaInput(value)
  }, [])

  /**
   * Formula bar focus event
   */
  const handleFormulabarFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target
    // TODO
    if (activeCell) {
      currentGrid.current?.makeEditable(activeCell, input.value, false)
      requestAnimationFrame(() => input?.focus())
    }    
  }, [activeCell])

  /**
   * When formula input changes
   */
  const handleFormulabarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCell) return
    const value = e.target.value    
    setFormulaInput(value)
    currentGrid.current?.setEditorValue(value, activeCell)    
  }, [ activeCell, selectedSheet ])
  
  /**
   * Imperatively submits the editor
   * @param value 
   * @param activeCell 
   */
  const submitEditor = (value: string, activeCell: CellInterface, direction: Direction = Direction.Down) => {
    const nextActiveCell = currentGrid.current?.getNextFocusableCell(activeCell, direction)
    currentGrid.current?.submitEditor(value, activeCell, nextActiveCell)
  }
  /**
   * When user presses Enter on formula input
   */
  const handleFormulabarKeydown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!activeCell) return
    
    if (e.which === KeyCodes.Enter) {
      submitEditor(formulaInput, activeCell)
    }
    if (e.which === KeyCodes.Escape) {
      currentGrid.current?.cancelEditor()
      setFormulaInput(activeCellConfig?.text || '')
    }
    if (e.which === KeyCodes.Tab) {
      submitEditor(formulaInput, activeCell, Direction.Right)
      e.preventDefault()
    }
  }, [ activeCell, formulaInput, activeCellConfig ])

  /**
   * Handle fill
   */
  const handleFill = useCallback((id: string, activeCell: CellInterface, fillSelection: SelectionArea | null, allSelections: SelectionArea []) => {
    if (!fillSelection) return;
  /* Check if user is trying to extend a selection */
    const { bounds } = fillSelection;
    const changes: Cells = {}
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id)
      if (sheet) {
        const { cells } = sheet
        const currentValue = cells[activeCell.rowIndex]?.[activeCell.columnIndex]
        for (let i = bounds.top; i <= bounds.bottom; i++) {
          if (!(i in cells)) cells[i] = {};
          if (!(i in changes)) changes[i] = {}
          for (let j = bounds.left; j <= bounds.right; j++) {
            if  (i === activeCell.rowIndex && j === activeCell.columnIndex) continue
            if (!(j in cells[i])) cells[i][j] = {};
            if (!(j in changes[i])) changes[i][j] = {};
            cells[i][j] = currentValue;
            changes[i][j] = currentValue
          }
        }
      }
    })

    onChange?.(id, changes)

  }, [])

  /**
   * Delete cell values
   */
  const handleDelete = useCallback((id: string, activeCell: CellInterface, selections: SelectionArea[]) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id)
      if (sheet) {
        const { cells } = sheet
        if (selections.length) {
          selections.forEach((sel) => {
            const { bounds } = sel
            for (let i = bounds.top; i <= bounds.bottom; i++) {
              if (!(i in cells)) continue
              for (let j = bounds.left; j <= bounds.right; j++) {
                if (!(j in cells[i]) || cells[i][j] === void 0) continue
                cells[i][j].text = ''
              }
            }
          })
        } else {
          const { rowIndex, columnIndex } = activeCell
          if (cells[rowIndex]?.[columnIndex]) {
            cells[rowIndex][columnIndex].text = ''
          }
        }
      }
    })
    /* Clear formula input */
    setFormulaInput('')
  }, [])

  const handleClearFormatting = useCallback(() => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === selectedSheet)
      if (sheet) {
        const { activeCell, selections, cells } = sheet
        if (selections.length) {
          selections.forEach(sel => {
            const { bounds } = sel
            for (let i = bounds.top; i <= bounds.bottom; i++) {
              if (!(i in cells)) continue
              for (let j = bounds.left; j <= bounds.right; j++) {
                if (!(j in cells[i])) continue
                for (const type in FORMATTING_TYPE) {
                  // @ts-ignore
                  const key: string = FORMATTING_TYPE[type]
                  // @ts-ignore
                  delete cells[i][j][key]
                }
              }
            }
          })
        } else if (activeCell) {
          const { rowIndex, columnIndex} = activeCell
          for (const type in FORMATTING_TYPE) {
            // @ts-ignore
            const key: string = FORMATTING_TYPE[type]
            // @ts-ignore
            delete cells[rowIndex]?.[columnIndex]?.[key]
          }
        }
      }
    })
  }, [sheets, selectedSheet])
  
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
          {showToolbar
            ? <Toolbar
                fill={activeCellConfig?.fill}
                bold={activeCellConfig?.bold}
                italic={activeCellConfig?.italic}
                strike={activeCellConfig?.strike}
                underline={activeCellConfig?.underline}
                color={activeCellConfig?.color}
                onFormattingChange={handleFormattingChange}
                onClearFormatting={handleClearFormatting}
              />
            : null
          }
          {showFormulabar
            ? <Formulabar value={formulaInput} onChange={handleFormulabarChange} onKeyDown={handleFormulabarKeydown} onFocus={handleFormulabarFocus} />
            : null
          }
          <Workbook
            ref={currentGrid}
            onDelete={handleDelete}
            onFill={handleFill}
            onActiveCellValueChange={handleActiveCellValueChange}
            onActiveCellChange={handleActiveCellChange}
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
