import React from "react";
import {
  InputGroup,
  InputLeftAddon,
  Input,
  useColorMode,
  useTheme,
} from "@chakra-ui/core";
import { COLUMN_HEADER_WIDTH, DARK_MODE_COLOR } from "./../constants";

const Formulabar = () => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const isLightMode = colorMode === "light";
  const backgroundColor = isLightMode ? "white" : DARK_MODE_COLOR;
  const color = isLightMode ? DARK_MODE_COLOR : "white";
  const borderColor = isLightMode
    ? theme.colors.gray[300]
    : theme.colors.gray[600];
  return (
    <InputGroup size="sm" borderBottomWidth={1} borderBottomColor={borderColor}>
      <InputLeftAddon
        width={COLUMN_HEADER_WIDTH}
        justifyContent="center"
        bg={backgroundColor}
        color={color}
        fontSize={12}
        fontStyle="italic"
        borderTopWidth={0}
        borderBottomWidth={0}
        size="sm"
        borderRadius={0}
        children="fx"
      />
      <Input
        borderTopWidth={0}
        borderBottomWidth={0}
        size="sm"
        borderRadius={0}
        pl={2}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        color={color}
        focusBorderColor={borderColor}
        _focus={{
          boxShadow: "none",
        }}
      />
    </InputGroup>
  );
};

export default Formulabar;
