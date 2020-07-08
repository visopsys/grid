import React, { useState, useCallback } from "react";
import Spreadsheet, { Sheet, defaultSheets } from "@rowsncolumns/spreadsheet";
import { parse, download } from '@rowsncolumns/export'

export default {
  title: "Spreadsheet",
  component: Spreadsheet
};

// @ts-ignore
const newSheet = ({ count }: { count: number }): Sheet => ({
  name: `Sheet${count}`,
  cells: {}
});

export const Default = () => {
  const App = () => {
    return (
      <div
        style={{
          margin: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: 800
        }}
      >
        <Spreadsheet
          // rowCount={80}
          // columnCount={20}
          // sheets={sheets}
          // onNewSheet={handleNewSheet}
          onChange={(...args) => {
            // console.log('called', args)
          }}
        />
      </div>
    );
  };
  return <App />;
};


export const Import = () => {
  const App = () => {
    const [ sheets, setSheets] = useState(defaultSheets)
    const handleChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const getSheets = async (file) => {
        const newSheets = await parse({ file })
        setSheets(newSheets.sheets)
      }
      getSheets(e.target.files[0])
    }, [])
    return (
      <div
        style={{
          margin: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: 800
        }}
      >
        <form id="testForm">
          <input type="file" name="test" id="testFile" onChange={handleChangeFile} />
        </form>
        <Spreadsheet
          sheets={sheets}
        />
      </div>
    );
  };
  return <App />; 
}

Import.story = {
  name: 'Import excel file'
}

export const ExportToExcel = () => {
  const App = () => {
    const [ sheets, setSheets] = useState(defaultSheets)
    const handleExport = useCallback(({ sheets }) => {
      download({
        sheets,
        filename: 'Report'
      })
    }, [])
    return (
      <>
        <br />
        <button onClick={() => handleExport({ sheets })}>Export to excel</button>
        <div
          style={{
            margin: 10,
            display: "flex",
            flexDirection: "column",
            minHeight: 600
          }}
        >        
          <Spreadsheet
            sheets={sheets}
            onChange={setSheets}
          />
        </div>
      </>
    );
  };
  return <App />; 
}

ExportToExcel.story = {
  name: 'Export excel file'
}