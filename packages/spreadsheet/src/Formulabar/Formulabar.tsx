import React from "react";
import {
  InputGroup,
  InputLeftAddon,
  Input,
  useColorMode,
  useTheme
} from "@chakra-ui/core";
import { COLUMN_HEADER_WIDTH, DARK_MODE_COLOR } from "./../constants";
import { KeyCodes } from "@rowsncolumns/grid/dist/types";

interface FormulabarProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string;
}
const Formulabar: React.FC<FormulabarProps> = ({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur
}) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const isLightMode = colorMode === "light";
  const backgroundColor = isLightMode ? "white" : DARK_MODE_COLOR;
  const color = isLightMode ? DARK_MODE_COLOR : "white";
  const borderColor = isLightMode
    ? theme.colors.gray[300]
    : theme.colors.gray[600];
  return (
    <InputGroup
      size="sm"
      borderBottomWidth={1}
      borderBottomColor={borderColor}
      height={6}
    >
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
        height={6}
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
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        height={"auto"}
        lineHeight={1}
        fontSize={12}
        _focus={{
          boxShadow: "none"
        }}
      />
    </InputGroup>
  );
};

export default Formulabar;
