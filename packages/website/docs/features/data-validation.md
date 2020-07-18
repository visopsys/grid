---
title: Data Validation
---
import SpreadSheet from "@rowsncolumns/spreadsheet";

SpreadSheet Grid supports the following cell level data Validation

1. List (static)
1. List (formula range) - Coming soon
1. Date - Coming soon
1. Decimal - Coming soon

## List (static)

```jsx
const sheets = [
  {
    name: "Sheet 1",
    id: 0,
    cells: {
      2: {
        2: {
          text: "",
          valid: false,
          dataValidation: {
            prompt: "Enter a country",
            type: 'list',
            formulae: ['Singapore', 'Japan', 'China']
          },
        },
      },
    },
  },
];

<Spreadsheet sheets={sheets}  />
```

### Demo 

export const Demo1 = ()  => {
  const sheets = [
    {
      name: 'Sheet 1',
      id: 1,
      cells: {
        2: {
        2: {
            text: 'Select a country',
            valid: false,
            dataValidation: {
              prompt: "Enter a country",
              type: 'list',
              formulae: ['Singapore', 'Japan', 'China']
            }
          }
        }
      }
    }
  ]
  return (
    <SpreadSheet
      sheets={sheets}
    />
  )
}

<Demo1 />