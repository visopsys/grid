import React, { useState, useCallback } from "react";
import Spreadsheet, {
  Sheet,
  defaultSheets,
  DATATYPE,
} from "@rowsncolumns/spreadsheet";
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
        hiddenRows: [],
        activeCell: null,
        selections: [],
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
          4: {
            1: {
              text: "EMara",
            },
            2: {
              text: "Hashimoto",
            },
            3: {
              text: "Male",
            },
          },
          5: {
            5: {
              text: "First name",
            },
            6: {
              text: "Last name",
            },
            7: {
              text: "Gender",
            },
          },
          6: {
            5: {
              text: "EMara",
            },
            6: {
              text: "Hashimoto",
            },
            7: {
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
          {
            bounds: {
              top: 5,
              bottom: 8,
              left: 5,
              right: 7,
            },
          },
        ],
      },
    ];
    return <Spreadsheet sheets={initialSheets} />;
  };

  return <App />;
};

const initialValidationSheet: Sheet[] = [
  {
    name: "Sheet 1",
    id: 0,
    activeCell: null,
    selections: [],
    cells: {
      2: {
        2: {
          text: "",
          valid: false,
          dataValidation: {
            prompt: "Enter a country",
            type: "list",
            formulae: ["Singapore", "Japan", "China"],
          },
        },
      },
      3: {
        2: {
          text: "",
          valid: false,
          dataValidation: {
            prompt: "Something went wrong",
            allowBlank: true,
            formulae: [10, 100],
            operator: "between",
            type: "decimal",
          },
        },
      },
      4: {
        2: {
          text: "TRUE",
          datatype: DATATYPE.Boolean,
          dataValidation: {
            allowBlank: true,
            type: "boolean",
            formulae: ["TRUE", "FALSE"],
          },
        },
      },
      5: {
        2: {
          datatype: DATATYPE.Hyperlink,
          text: "Hello world",
          color: "#1155CC",
          underline: true,
          hyperlink: "http://google.com",
        },
      },
    },
  },
];
export const DataValidation = () => {
  const App = () => {
    const [sheets, setSheets] = useState<Sheet[]>(initialValidationSheet);
    return (
      <>
        <div
          style={{
            margin: 10,
            display: "flex",
            flexDirection: "column",
            minHeight: 800,
          }}
        >
          <Spreadsheet sheets={sheets} onChange={setSheets} />
        </div>
      </>
    );
  };
  return <App />;
};
