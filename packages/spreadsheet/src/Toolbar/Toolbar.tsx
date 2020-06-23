import React from "react";
import {
  MdUndo,
  MdRedo,
  MdPrint,
  MdAttachMoney,
  MdFormatBold,
  MdFormatItalic,
  MdStrikethroughS,
  MdBorderAll,
  MdFormatAlignLeft,
  MdVerticalAlignBottom,
  MdWbSunny,
  MdFormatUnderlined,
  MdTextFields,
  MdFormatClear
} from "react-icons/md";
import { AiOutlineMergeCells } from "react-icons/ai";
import { BsColumns } from "react-icons/bs";
import { IoMdColorFill, IoMdMoon } from "react-icons/io";
import {
  IconButton,
  Tooltip,
  Button,
  Flex,
  useColorMode,
  useTheme,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverContext
} from "@chakra-ui/core";
import { StyledToolbar, Rect, Separator, PercentIcon } from "./../styled";
import { DARK_MODE_COLOR } from "./../constants";
import { FORMATTING_TYPE, CellFormatting } from "./../types";
import { translations } from "../translations";
import { CellConfig } from "../Spreadsheet";
import { SketchPicker } from "react-color";

export interface ToolbarProps extends CellConfig {
  onFormattingChange?: (
    type: keyof CellFormatting,
    value: any,
    options?: Record<string, any>
  ) => void;
  onClearFormatting?: () => void
}

const Toolbar: React.FC<ToolbarProps> = props => {
  const {
    bold,
    italic,
    fill,
    underline,
    strike,
    color,
    onFormattingChange,
    onClearFormatting
  } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isLightMode = colorMode === "light";
  const activeIconColor = theme.colors.teal[500];
  const iconColor = isLightMode
    ? theme.colors.gray[600]
    : theme.colors.gray[50];
  const borderColor = isLightMode
    ? theme.colors.gray[300]
    : theme.colors.gray[600];
  const backgroundColor = isLightMode ? "white" : DARK_MODE_COLOR;
  return (
    <StyledToolbar
      pr={2}
      pl={2}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
    >
      <Flex flex={1} alignItems="center">
        <Tooltip
          hasArrow
          aria-label={translations.undo}
          label={translations.undo}
        >
          <IconButton
            aria-label={translations.undo}
            variant="ghost"
            color={iconColor}
            icon={MdUndo}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.redo}
          label={translations.redo}
        >
          <IconButton
            aria-label={translations.redo}
            variant="ghost"
            color={iconColor}
            icon={MdRedo}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.print}
          label={translations.print}
        >
          <IconButton
            aria-label={translations.print}
            variant="ghost"
            color={iconColor}
            icon={MdPrint}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.clear_formatting}
          label={translations.clear_formatting}
        >
          <IconButton
            aria-label={translations.clear_formatting}
            variant="ghost"
            color={iconColor}
            icon={MdFormatClear}
            size="sm"
            onClick={() => onClearFormatting?.()}
          />
        </Tooltip>

        <Separator borderColor={borderColor} />

        <Tooltip
          hasArrow
          aria-label={translations.format_as_currency}
          label={translations.format_as_currency}
        >
          <IconButton
            aria-label={translations.format_as_currency}
            variant="ghost"
            color={iconColor}
            icon={MdAttachMoney}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.format_as_percent}
          label={translations.format_as_percent}
        >
          <IconButton
            aria-label={translations.format_as_percent}
            variant="ghost"
            color={iconColor}
            fontSize={10}
            icon={PercentIcon}
            size="sm"
          />
        </Tooltip>

        <Separator borderColor={borderColor} />

        <Tooltip
          hasArrow
          aria-label={translations.bold}
          label={translations.bold}
        >
          <IconButton
            aria-label={translations.bold}
            variant={bold ? "solid" : "ghost"}
            color={bold ? activeIconColor : iconColor}
            icon={MdFormatBold}
            fontSize={20}
            size="sm"
            onClick={() => onFormattingChange?.(FORMATTING_TYPE.BOLD, !bold)}
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.italic}
          label={translations.italic}
        >
          <IconButton
            aria-label={translations.italic}
            variant={italic ? "solid" : "ghost"}
            color={italic ? activeIconColor : iconColor}
            icon={MdFormatItalic}
            fontSize={20}
            size="sm"
            onClick={() =>
              onFormattingChange?.(FORMATTING_TYPE.ITALIC, !italic)
            }
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.underline}
          label={translations.underline}
        >
          <IconButton
            aria-label={translations.underline}
            variant={underline ? "solid" : "ghost"}
            color={underline ? activeIconColor : iconColor}
            icon={MdFormatUnderlined}
            fontSize={20}
            size="sm"
            onClick={() =>
              onFormattingChange?.(FORMATTING_TYPE.UNDERLINE, !underline)
            }
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.strikethrough}
          label={translations.strikethrough}
        >
          <IconButton
            aria-label={translations.strikethrough}
            variant={strike ? "solid" : "ghost"}
            color={strike ? activeIconColor : iconColor}
            icon={MdStrikethroughS}
            fontSize={20}
            size="sm"
            onClick={() =>
              onFormattingChange?.(FORMATTING_TYPE.STRIKE, !strike)
            }
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.text_color}
          label={translations.text_color}
        >
          <Popover usePortal>
            {({ onClose }) => {
              return (
                <>
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      color={iconColor}
                      variant="ghost"
                      p={0}
                      w={8}
                      flexDirection="column"
                      aria-label={translations.text_color}
                    >
                      <MdTextFields />
                      <Rect color={color} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent width={220}>
                    <PopoverArrow />
                    <SketchPicker
                      onChange={e => {
                        onFormattingChange?.(FORMATTING_TYPE.COLOR, e.hex);
                        // onClose?.();
                      }}
                    />
                  </PopoverContent>
                </>
              );
            }}
          </Popover>
        </Tooltip>

        <Separator borderColor={borderColor} />

        <Tooltip
          hasArrow
          aria-label={translations.fill_color}
          label={translations.fill_color}
        >
          <Popover usePortal>
            {({ onClose }) => {
              return (
                <>
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      color={iconColor}
                      variant="ghost"
                      p={0}
                      w={8}
                      flexDirection="column"
                      aria-label={translations.fill_color}
                    >
                      <IoMdColorFill />
                      <Rect color={fill} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent width={220}>
                    <PopoverArrow />
                    <SketchPicker
                      onChange={e => {
                        onFormattingChange?.(FORMATTING_TYPE.FILL, e.hex);
                        // onClose?.();
                      }}
                    />
                  </PopoverContent>
                </>
              );
            }}
          </Popover>
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.borders}
          label={translations.borders}
        >
          <IconButton
            aria-label={translations.borders}
            variant="ghost"
            color={iconColor}
            icon={MdBorderAll}
            fontSize={20}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.merge_cells}
          label={translations.merge_cells}
        >
          <IconButton
            aria-label={translations.merge_cells}
            variant="ghost"
            color={iconColor}
            icon={AiOutlineMergeCells}
            fontSize={20}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.freeze}
          label={translations.freeze}
        >
          <IconButton
            aria-label={translations.freeze}
            variant="ghost"
            color={iconColor}
            icon={BsColumns}
            fontSize={20}
            size="sm"
          />
        </Tooltip>

        <Separator borderColor={borderColor} />

        <Tooltip
          hasArrow
          aria-label={translations.horizontal_align}
          label={translations.horizontal_align}
        >
          <IconButton
            aria-label={translations.horizontal_align}
            variant="ghost"
            color={iconColor}
            icon={MdFormatAlignLeft}
            fontSize={20}
            size="sm"
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.vertical_align}
          label={translations.vertical_align}
        >
          <IconButton
            aria-label={translations.vertical_align}
            variant="ghost"
            color={iconColor}
            icon={MdVerticalAlignBottom}
            fontSize={20}
            size="sm"
          />
        </Tooltip>
      </Flex>
      <Flex alignItems="flex-end">
        <Tooltip
          hasArrow
          aria-label={
            isLightMode
              ? translations.switch_dark_mode
              : translations.switch_light_mode
          }
          label={
            isLightMode
              ? translations.switch_dark_mode
              : translations.switch_light_mode
          }
        >
          <IconButton
            aria-label={
              isLightMode
                ? translations.switch_dark_mode
                : translations.switch_light_mode
            }
            variant="ghost"
            color={iconColor}
            icon={isLightMode ? IoMdMoon : MdWbSunny}
            fontSize={20}
            size="sm"
            onClick={toggleColorMode}
          />
        </Tooltip>
      </Flex>
    </StyledToolbar>
  );
};

export default Toolbar;
