import React, { useState, useCallback } from 'react'
import Spreadsheet, { Sheet } from '@rowsncolumns/spreadsheet'

export default {
  title: 'Spreadsheet',
  component: Spreadsheet
}

const newSheet = ({ count }: { count: number}): Sheet => ({
  name: `Sheet${count}`,
  cells: {}
})
const defaultSheets = [
  {
    name: 'Sheet1',
    cells: {
      2: {
        1: {
          text: 'Hello world'
        }
      }
    }
  }
]

export const Default = () => {
  const App = () => {
    return (
      <div style={{margin: 10, display: 'flex', flexDirection: 'column', minHeight: 800}}>
        <Spreadsheet
          // sheets={sheets}
          // onNewSheet={handleNewSheet}
          onChange={(...args) => {
            console.log('called', args)
          }}
        />
      </div>
    )
  }
  return <App />
}