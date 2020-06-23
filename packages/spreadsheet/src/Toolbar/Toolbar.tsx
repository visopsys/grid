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
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdVerticalAlignBottom,
  MdWbSunny,
  MdFormatUnderlined,
  MdTextFields,
  MdFormatClear,
  MdVerticalAlignCenter,
  MdVerticalAlignTop,
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
  PopoverContext,
  Box,
} from "@chakra-ui/core";
import { StyledToolbar, Rect, Separator, PercentIcon } from "./../styled";
import { DARK_MODE_COLOR } from "./../constants";
import {
  FORMATTING_TYPE,
  CellFormatting,
  VERTICAL_ALIGNMENT,
  HORIZONTAL_ALIGNMENT,
} from "./../types";
import { translations } from "../translations";
import { CellConfig } from "../Spreadsheet";
import { SketchPicker } from "react-color";

export interface ToolbarProps extends CellConfig {
  onFormattingChange?: (
    type: keyof CellFormatting,
    value: any,
    options?: Record<string, any>
  ) => void;
  onClearFormatting?: () => void;
  onMergeCells?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    bold,
    italic,
    fill,
    underline,
    strike,
    color,
    verticalAlign,
    horizontalAlign,
    onFormattingChange,
    onClearFormatting,
    percent,
    currency,
    onMergeCells,
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
          placement="bottom-start"
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
          placement="bottom-start"
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
            variant={currency ? "solid" : "ghost"}
            color={currency ? activeIconColor : iconColor}
            icon={MdAttachMoney}
            size="sm"
            onClick={() =>
              onFormattingChange?.(FORMATTING_TYPE.CURRENCY, !currency)
            }
          />
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.format_as_percent}
          label={translations.format_as_percent}
        >
          <IconButton
            aria-label={translations.format_as_percent}
            variant={percent ? "solid" : "ghost"}
            color={percent ? activeIconColor : iconColor}
            fontSize={10}
            icon={PercentIcon}
            size="sm"
            onClick={() =>
              onFormattingChange?.(FORMATTING_TYPE.PERCENT, !percent)
            }
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
          <Popover usePortal placement="top-start">
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
                      onChange={(e) => {
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
          <Popover usePortal placement="top-start">
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
                      onChange={(e) => {
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
            onClick={() => onMergeCells?.()}
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
          <Popover usePortal placement="top-start">
            {({ onClose }) => {
              return (
                <>
                  <PopoverTrigger>
                    <IconButton
                      aria-label={translations.horizontal_align}
                      variant="ghost"
                      color={iconColor}
                      icon={MdFormatAlignLeft}
                      fontSize={20}
                      size="sm"
                    />
                  </PopoverTrigger>
                  <PopoverContent width="auto">
                    <PopoverArrow />
                    <Box display="flex">
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.LEFT
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.LEFT
                            ? activeIconColor
                            : iconColor
                        }
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.HORIZONTAL_ALIGN,
                            HORIZONTAL_ALIGNMENT.LEFT
                          )
                        }
                        icon={MdFormatAlignLeft}
                        fontSize={20}
                        size="sm"
                      />
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.CENTER
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.CENTER
                            ? activeIconColor
                            : iconColor
                        }
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.HORIZONTAL_ALIGN,
                            HORIZONTAL_ALIGNMENT.CENTER
                          )
                        }
                        icon={MdFormatAlignCenter}
                        fontSize={20}
                        size="sm"
                      />
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.RIGHT
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          horizontalAlign === HORIZONTAL_ALIGNMENT.RIGHT
                            ? activeIconColor
                            : iconColor
                        }
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.HORIZONTAL_ALIGN,
                            HORIZONTAL_ALIGNMENT.RIGHT
                          )
                        }
                        icon={MdFormatAlignRight}
                        fontSize={20}
                        size="sm"
                      />
                    </Box>
                  </PopoverContent>
                </>
              );
            }}
          </Popover>
        </Tooltip>

        <Tooltip
          hasArrow
          aria-label={translations.vertical_align}
          label={translations.vertical_align}
        >
          <Popover usePortal placement="top-start">
            {({ onClose }) => {
              return (
                <>
                  <PopoverTrigger>
                    <IconButton
                      aria-label={translations.vertical_align}
                      variant="ghost"
                      color={iconColor}
                      icon={MdVerticalAlignBottom}
                      fontSize={20}
                      size="sm"
                    />
                  </PopoverTrigger>
                  <PopoverContent width="auto">
                    <PopoverArrow />
                    <Box display="flex">
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          verticalAlign === VERTICAL_ALIGNMENT.TOP
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          verticalAlign === VERTICAL_ALIGNMENT.TOP
                            ? activeIconColor
                            : iconColor
                        }
                        icon={MdVerticalAlignTop}
                        fontSize={20}
                        size="sm"
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.VERTICAL_ALIGN,
                            VERTICAL_ALIGNMENT.TOP
                          )
                        }
                      />
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          verticalAlign === VERTICAL_ALIGNMENT.MIDDLE
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          verticalAlign === VERTICAL_ALIGNMENT.MIDDLE
                            ? activeIconColor
                            : iconColor
                        }
                        icon={MdVerticalAlignCenter}
                        fontSize={20}
                        size="sm"
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.VERTICAL_ALIGN,
                            VERTICAL_ALIGNMENT.MIDDLE
                          )
                        }
                      />
                      <IconButton
                        aria-label={translations.horizontal_align}
                        variant={
                          verticalAlign === VERTICAL_ALIGNMENT.BOTTOM
                            ? "solid"
                            : "ghost"
                        }
                        color={
                          verticalAlign === VERTICAL_ALIGNMENT.BOTTOM
                            ? activeIconColor
                            : iconColor
                        }
                        icon={MdVerticalAlignBottom}
                        fontSize={20}
                        size="sm"
                        onClick={() =>
                          onFormattingChange?.(
                            FORMATTING_TYPE.VERTICAL_ALIGN,
                            VERTICAL_ALIGNMENT.BOTTOM
                          )
                        }
                      />
                    </Box>
                  </PopoverContent>
                </>
              );
            }}
          </Popover>
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
