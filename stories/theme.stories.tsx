import React, { createContext, useContext, useState } from "react";
import Grid, { Cell } from "../src";

export default {
  title: "Themes",
  component: Grid,
};

const darkTheme = {
  cellColor: "#ccc",
  cellBackground: "#333",
};
const lightTheme = {
  cellColor: "#333",
  cellBackground: "white",
};
const ThemeContext = createContext(lightTheme);

export const ThemedGrid = () => {
  const rowCount = 100;
  const columnCount = 100;
  const [theme, setTheme] = useState(lightTheme);
  const switchTheme = () => {
    setTheme((prev) => {
      return prev === lightTheme ? darkTheme : lightTheme;
    });
  };
  const App = () => {
    return (
      <>
        <button type="button" onClick={switchTheme}>
          Switch to {theme === lightTheme ? "Dark" : "Light"}
        </button>
        <Grid
          rowCount={rowCount}
          columnCount={columnCount}
          itemRenderer={(props) => <ThemedCell {...props} />}
          wrapper={(children) => {
            /**
             * Since We are using a custom canvas renderer (Konva), we have to create a bridge
             * between Top context to Konva Context
             * Hence we have to wrap the children with context again
             */
            return (
              <ThemeContext.Provider value={theme}>
                {children}
              </ThemeContext.Provider>
            );
          }}
        />
      </>
    );
  };
  return <App />;
};

const ThemedCell = (props) => {
  const theme = useContext(ThemeContext);
  return (
    <Cell
      {...props}
      value={`${props.rowIndex} x ${props.columnIndex}`}
      fill={theme.cellBackground}
      textColor={theme.cellColor}
    />
  );
};

ThemedGrid.story = {
  name: "Dark mode",
};
