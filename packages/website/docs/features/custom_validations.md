---
title: Custom Validation
---
import { useCallback } from 'react'
import SpreadSheet, { format as defaultFormatter, DefaultCell, validate as defaultValidation } from "@rowsncolumns/spreadsheet";
import { Rect, Text } from 'react-konva'


SpreadSheet Grid supports validation for the following datatypes

1. List (static)
2. Number
3. Boolean
4. Custom validation rules
5. Formula (coming soon)

:::note
`onValidate` is called everytime a cell value is changed by the user.
:::

## Adding a custom validation (sync)

```jsx
const handleValidate = async (value, sheet, cell, cellConfig) => {
  if (value !== 'hello') return {
    valid: false,
    message: 'We only accept hello... Sorry'
  }
  return defaultValidation(value, sheet, cell, cellConfig)
}
return (
  <SpreadSheet onValidate={handleValidate} />
)
```

## Demo

Cells only accepts `hello`. Anything else is invalid

export const App = () => {
  const handleValidate = async (value, sheet, cell, cellConfig) => {
    if (value !== 'hello') return {
      valid: false,
      message: 'We only accept hello... Sorry'
    }
    return defaultValidation(value, sheet, cell, cellConfig)
  }
  return (
    <SpreadSheet onValidate={handleValidate} />
  )
}

<App />

## Async validation

```jsx
const handleValidate = async (value, sheet, cell, cellConfig) => {
  if (cellConfig.type === 'email') {
    const resp = fetch('/validate_email', { body: value })
    if (resp.ok) {
      return {
        valid: true
      }
    } else {
      return {
        valid: false,
        message: 'Invalid email'
      }
    }
  }
  return defaultValidation(value, sheet, cell, cellConfig)
}
return (
  <SpreadSheet onValidate={handleValidate} />
)
```
