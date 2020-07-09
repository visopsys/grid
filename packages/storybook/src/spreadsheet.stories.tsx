import React, { useState, useCallback } from "react";
import Spreadsheet, { Sheet, defaultSheets } from "@rowsncolumns/spreadsheet";
import { parse, download } from "@rowsncolumns/export";

export default {
  title: "Spreadsheet",
  component: Spreadsheet,
};

// @ts-ignore
const newSheet = ({ count }: { count: number }): Sheet => ({
  name: `Sheet${count}`,
  cells: {},
});

export const Default = () => {
  const App = () => {
    return (
      <div
        style={{
          margin: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: 800,
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
    const [sheets, setSheets] = useState(defaultSheets);
    const handleChangeFile = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const getSheets = async (file) => {
          const newSheets = await parse({ file });
          setSheets(newSheets.sheets);
        };
        getSheets(e.target.files[0]);
      },
      []
    );
    return (
      <div
        style={{
          margin: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: 800,
        }}
      >
        <div>
          <form id="testForm">
            <input
              type="file"
              name="test"
              id="testFile"
              onChange={handleChangeFile}
            />
          </form>
          <button onClick={() => download({ sheets, filename: "Hello" })}>
            Download Excel
          </button>
          <button
            onClick={() => download({ sheets, filename: "Hello", type: "csv" })}
          >
            Download CSV
          </button>
        </div>
        <Spreadsheet sheets={sheets} />
      </div>
    );
  };
  return <App />;
};

Import.story = {
  name: "Import excel file",
};

export const ExportToExcel = () => {
  const App = () => {
    const [sheets, setSheets] = useState(defaultSheets);
    const handleExport = useCallback(({ sheets }) => {
      download({
        sheets,
        filename: "Report",
      });
    }, []);
    return (
      <>
        <br />
        <button onClick={() => handleExport({ sheets })}>
          Export to excel
        </button>
        <div
          style={{
            margin: 10,
            display: "flex",
            flexDirection: "column",
            minHeight: 600,
          }}
        >
          <Spreadsheet sheets={sheets} onChange={setSheets} />
        </div>
      </>
    );
  };
  return <App />;
};

ExportToExcel.story = {
  name: "Export excel file",
};

export const FilterViews = () => {
  const App = () => {
    const initialSheets = [
      {
        name: "Sheet 1",
        id: 0,
        frozenRows: 1,
        frozenColumns: 1,
        cells: {
          1: {
            1: {
              text: "First Name",
            },
            2: {
              text: "Last Name",
            },
            3: {
              text: "Gender",
            },
          },
          2: {
            1: {
              text: "Dulce",
            },
            2: {
              text: "Abril",
            },
            3: {
              text: "Female",
            },
          },
          3: {
            1: {
              text: "Mara",
            },
            2: {
              text: "Hashimoto",
            },
            3: {
              text: "Male",
            },
          },
        },
        filterViews: [
          {
            bounds: {
              top: 1,
              bottom: 5,
              left: 1,
              right: 3,
            },
          },
        ],
      },
    ];
    return <Spreadsheet sheets={initialSheets} />;
  };

  return <App />;
};
