import React from "react";
import Layout from "@theme/Layout";
import { ThemeProvider, ColorModeProvider, CSSReset, theme } from "@chakra-ui/core";
import { GlobalCSS, css } from "@emotion/core";

export default function NewLayout(props) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      {/* <GlobalCSS
        style={css`
          .rowsncolumns-grid {
            border-right-width: 1px;
            border-right-style: solid;
            border-right-color: ${colorMode === 'light' ? CELL_BORDER_COLOR : theme?.colors.gray[600]}
          }
        `}
      /> */}
      <Layout {...props} />
    </ThemeProvider>
  );
}
