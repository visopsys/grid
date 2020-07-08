# Read/Write excel and csv files

Used alongside `@rowsncolumns/spreadsheet`

## Usage

### Reading excel/csv files

```js
import { parse } from '@rowsncolumns/export'

const sheets = parse({ file })
```

### Downloading excel/csv files

```js
import { download } from '@rowsncolumns/export'

await download({ sheets, type: 'csv|excel' })
```