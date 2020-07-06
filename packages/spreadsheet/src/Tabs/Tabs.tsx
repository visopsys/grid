import React, { useState } from "react";
import { Sheet } from "../Spreadsheet";
import { GoPlus } from "react-icons/go";
import { MdMenu, MdCheck } from "react-icons/md";
import {
  // IconButton,
  Flex,
  Box,
  useTheme,
  useColorMode,
  // Tooltip,
} from "@chakra-ui/core";
import { COLUMN_HEADER_WIDTH, DARK_MODE_COLOR } from "../constants";
import { IconButton, Tooltip, Button } from "./../styled";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/core";
import TabItem from "./TabItem";
import { translations } from "../translations";

interface TabProps {
  selectedSheet: string;
  sheets: Sheet[];
  onSelect?: (id: string) => void;
  onNewSheet?: () => void;
  onChangeSheetName?: (id: string, value: string) => void;
  onDeleteSheet?: (id: string) => void;
  onDuplicateSheet?: (id: string) => void;
}

const Tabs: React.FC<TabProps> = (props) => {
  const {
    sheets,
    onSelect,
    onNewSheet,
    selectedSheet,
    onChangeSheetName,
    onDeleteSheet,
    onDuplicateSheet,
  } = props;
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";
  const color = isLight ? theme.colors.gray[900] : theme.colors.gray[300];
  return (
    <Flex pl={COLUMN_HEADER_WIDTH} alignItems="center" minWidth={0} flex={1}>
      <Tooltip
        placement="top-start"
        hasArrow
        aria-label={translations.add_sheet}
        label={translations.add_sheet}
      >
        <IconButton
          aria-label={translations.add_sheet}
          icon={GoPlus}
          onClick={onNewSheet}
          variant="ghost"
          color={color}
        />
      </Tooltip>
      <Popover placement="top">
        <PopoverTrigger>
          <Box>
            <Tooltip
              placement="top-start"
              hasArrow
              aria-label={translations.all_sheets}
              label={translations.all_sheets}
            >
              <IconButton
                aria-label={translations.all_sheets}
                icon={MdMenu}
                variant="ghost"
                color={color}
              />
            </Tooltip>
          </Box>
        </PopoverTrigger>
        <PopoverContent
          width={200}
          borderColor={isLight ? undefined : DARK_MODE_COLOR}
        >
          <PopoverArrow />
          <PopoverBody overflow="auto" maxHeight={400}>
            {sheets.map((sheet, idx) => {
              const isActive = selectedSheet === sheet.id;
              return (
                <Button
                  key={idx}
                  fontWeight="normal"
                  size="sm"
                  variant="ghost"
                  isFullWidth
                  textAlign="left"
                  justifyContent="left"
                  borderRadius={0}
                  onClick={() => onSelect?.(sheet.id)}
                >
                  <Box
                    as={MdCheck}
                    mr={2}
                    visibility={isActive ? "visible" : "hidden"}
                  />
                  {sheet.name}
                </Button>
              );
            })}
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Box overflow="auto" display="flex" pl={1} pr={1}>
        {sheets.map((sheet, idx) => {
          const isActive = selectedSheet === sheet.id;
          return (
            <TabItem
              key={idx}
              id={sheet.id}
              name={sheet.name}
              isLight={isLight}
              onSelect={onSelect}
              isActive={isActive}
              onChangeSheetName={onChangeSheetName}
              onDeleteSheet={onDeleteSheet}
              onDuplicateSheet={onDuplicateSheet}
            />
          );
        })}
      </Box>
    </Flex>
  );
};

export default Tabs;
