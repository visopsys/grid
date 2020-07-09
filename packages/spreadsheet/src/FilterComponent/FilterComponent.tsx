import React, { useState, useCallback } from "react";
import {
  Box,
  Menu,
  MenuList,
  MenuDivider,
  useColorMode,
  useTheme,
  InputGroup,
  InputLeftElement,
  Icon,
  Input,
  Checkbox,
} from "@chakra-ui/core";
import { DARK_MODE_COLOR } from "../constants";
import { MenuItem, Button } from "./../styled";
import { CellPosition, FilterDefinition } from "@rowsncolumns/grid";

export interface FilterComponentProps {
  position: CellPosition;
  onChange?: (
    filterIndex: number,
    columnIndex: number,
    filter: FilterDefinition
  ) => void;
  onCancel?: () => void;
  values: React.ReactText[];
  filter: FilterDefinition;
  columnIndex?: number;
  index: number;
  width: number;
}

const FilterComponent = ({
  position,
  onChange,
  onCancel,
  values = [],
  filter,
  columnIndex,
  index,
  width,
}: FilterComponentProps) => {
  if (!columnIndex) return null;
  const [filterText, setFilterText] = useState("");
  const { values: selectedValues = [] } = filter || {};
  const [userValues, setUserValues] = useState(
    filter ? selectedValues : values
  );
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";
  const color = isLight ? DARK_MODE_COLOR : theme.colors.white;
  const borderColor = isLight ? theme.colors.gray[300] : DARK_MODE_COLOR;
  const bgColor = isLight ? theme.colors.white : theme.colors.gray[700];
  let { x = 0, y } = position;
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setUserValues((prev) => prev.concat(value));
    } else {
      setUserValues((prev) => prev.filter((v) => v !== value));
    }
  }, []);
  const handleSubmit = useCallback(() => {
    onChange?.(index, columnIndex, {
      values: userValues,
      operator: filter?.operator,
    });
  }, [userValues]);
  const isSelectAll = values.length === userValues.length;
  const isIndeterminate = !isSelectAll && userValues.length > 0;
  return (
    <Box
      left={0}
      top={0}
      position="absolute"
      zIndex={1}
      transform={`translate(${x}px, ${y}px)`}
    >
      <Box shadow="md" bg={bgColor} width={width}>
        <Box padding={3}>
          <Button
            onClick={() => setUserValues(values)}
            variant="link"
            fontSize={12}
            mr={2}
            background="none"
            size="sm"
          >
            Select all
          </Button>
          <Button
            onClick={() => setUserValues([])}
            variant="link"
            fontSize={12}
            background="none"
            size="sm"
          >
            Clear
          </Button>
          <InputGroup size="sm" mt={2}>
            <InputLeftElement
              children={<Icon name="search" color="gray.300" />}
            />
            <Input
              type="text"
              size="sm"
              borderColor={borderColor}
              value={filterText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFilterText(e.target.value);
              }}
            />
          </InputGroup>
          <Box overflow="auto" maxHeight={100} mt={2} mb={2} pl={1} pr={1}>
            {values
              .filter((value) =>
                new RegExp(filterText, "gi").test(value.toString())
              )
              .map((value, idx) => {
                const valueItem = value || "";
                const isChecked = userValues.indexOf(valueItem) !== -1;
                const label = value || "(Blanks)";
                return (
                  <Box fontSize={12} key={idx}>
                    <Checkbox
                      onChange={handleChange}
                      value={valueItem}
                      size="sm"
                      borderColor={borderColor}
                      isChecked={isChecked}
                    >
                      {label}
                    </Checkbox>
                  </Box>
                );
              })}
          </Box>
          <Box pt={2}>
            <Button
              size="sm"
              variantColor="green"
              variant="solid"
              onClick={handleSubmit}
              mr={1}
            >
              Done
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FilterComponent;
