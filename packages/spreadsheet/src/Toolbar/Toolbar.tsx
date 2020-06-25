import React, { useState, useEffect, useCallback } from "react";
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
  MdBorderInner,
  MdBorderHorizontal,
  MdBorderBottom,
  MdBorderVertical,
  MdBorderOuter,
  MdBorderLeft,
  MdBorderRight,
  MdBorderTop,
  MdBorderClear,
  MdEdit,
  MdFormatColorReset
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
  Select,
  FormControl,
  FormLabel
} from "@chakra-ui/core";
import { StyledToolbar, Rect, Separator, PercentIcon } from "./../styled";
import { DARK_MODE_COLOR } from "./../constants";
import {
  FORMATTING_TYPE,
  CellFormatting,
  VERTICAL_ALIGNMENT,
  HORIZONTAL_ALIGNMENT,
  BORDER_VARIANT
} from "./../types";
import { translations } from "../translations";
import { CellConfig } from "../Spreadsheet";
import { CirclePicker, ColorResult } from "react-color";
import useDidUpdate from "./../hooks/useDidUpdate";

export interface ToolbarProps extends CellConfig {
  onFormattingChange?: (
    type: keyof CellFormatting,
    value: any,
    options?: Record<string, any>
  ) => void;
  onClearFormatting?: () => void;
  onMergeCells?: () => void;
  onFrozenColumnChange?: (num: number) => void;
  onFrozenRowChange?: (num: number) => void;
  frozenRows?: number;
  frozenColumns?: number;
  onBorderChange?: (
    color: string | undefined,
    variant?: BORDER_VARIANT
  ) => void;
  canRedo?: boolean;
  canUndo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  enableDarkMode?: boolean;
}
interface ColorPickerProps {
  resetLabel?: string;
  color?: string;
  onChange: (value: string | undefined) => void;
}
const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  resetLabel = "Reset"
}) => {
  return (
    <Box pb={2}>
      <Button
        variant="ghost"
        isFullWidth
        justifyContent="left"
        size="sm"
        mb={2}
        onClick={() => onChange(undefined)}
      >
        <Box mr={2}>
          <MdFormatColorReset />
        </Box>
        {resetLabel}
      </Button>
      <CirclePicker
        color={color}
        onChangeComplete={(e: ColorResult) => onChange(e.hex)}
        circleSpacing={5}
        circleSize={20}
        width="230px"
      />
    </Box>
  );
};

const Toolbar: React.FC<ToolbarProps> = props => {
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
    onFrozenColumnChange,
    onFrozenRowChange,
    frozenRows = 0,
    frozenColumns = 0,
    onBorderChange,
    canUndo,
    canRedo,
    onRedo,
    onUndo,
    enableDarkMode
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
  const foregroundColor = isLightMode ? DARK_MODE_COLOR : "white";
  return (
    <StyledToolbar
      pr={2}
      pl={2}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      color={foregroundColor}
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
            isDisabled={!canUndo}
            onClick={onUndo}
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
            isDisabled={!canRedo}
            onClick={onRedo}
          />
        </Tooltip>

        {/* <Tooltip
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
        </Tooltip> */}

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

        <Popover usePortal placement="top-start">
          {({ onClose }) => {
            return (
              <>
                <PopoverTrigger>
                  <Box>
                    <Tooltip
                      hasArrow
                      aria-label={translations.text_color}
                      label={translations.text_color}
                    >
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
                    </Tooltip>
                  </Box>
                </PopoverTrigger>
                <PopoverContent width={250}>
                  <PopoverArrow />
                  <PopoverBody>
                    <ColorPicker
                      color={color}
                      onChange={(value: string | undefined) => {
                        onFormattingChange?.(FORMATTING_TYPE.COLOR, value);
                        onClose?.();
                      }}
                    />
                  </PopoverBody>
                </PopoverContent>
              </>
            );
          }}
        </Popover>

        <Separator borderColor={borderColor} />

        <Popover usePortal placement="top-start">
          {({ onClose }) => {
            return (
              <>
                <PopoverTrigger>
                  <Box>
                    <Tooltip
                      hasArrow
                      aria-label={translations.fill_color}
                      label={translations.fill_color}
                    >
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
                    </Tooltip>
                  </Box>
                </PopoverTrigger>
                <PopoverContent width={250}>
                  <PopoverArrow />
                  <PopoverBody>
                    <ColorPicker
                      color={fill}
                      onChange={(value: string | undefined) => {
                        onFormattingChange?.(FORMATTING_TYPE.FILL, value);
                        onClose?.();
                      }}
                    />
                  </PopoverBody>
                </PopoverContent>
              </>
            );
          }}
        </Popover>

        <Tooltip
          hasArrow
          aria-label={translations.borders}
          label={translations.borders}
        >
          <BorderSelection
            onBorderChange={onBorderChange}
            iconColor={iconColor}
            activeIconColor={activeIconColor}
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

        <Popover usePortal placement="top-start">
          {({ onClose }) => {
            return (
              <>
                <PopoverTrigger>
                  <Box>
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
                  </Box>
                </PopoverTrigger>
                <PopoverContent width={220}>
                  <PopoverArrow />
                  <PopoverBody>
                    <FormControl mb={1}>
                      <FormLabel fontSize={14}>
                        {translations.freeze_rows}
                      </FormLabel>
                      <Select
                        size="sm"
                        value={frozenRows}
                        onChange={e =>
                          onFrozenRowChange?.(Number(e.target.value))
                        }
                      >
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                      </Select>
                    </FormControl>

                    <FormControl mb={1}>
                      <FormLabel fontSize={14}>
                        {translations.freeze_columns}
                      </FormLabel>
                      <Select
                        size="sm"
                        value={frozenColumns}
                        onChange={e =>
                          onFrozenColumnChange?.(Number(e.target.value))
                        }
                      >
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                      </Select>
                    </FormControl>
                  </PopoverBody>
                </PopoverContent>
              </>
            );
          }}
        </Popover>

        <Separator borderColor={borderColor} />

        <Popover usePortal placement="top-start">
          {({ onClose }) => {
            return (
              <>
                <PopoverTrigger>
                  <Box>
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
                  </Box>
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

        <Popover usePortal placement="top-start">
          {({ onClose }) => {
            return (
              <>
                <PopoverTrigger>
                  <Box>
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
                  </Box>
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
      </Flex>
      <Flex alignItems="flex-end">
        {enableDarkMode && (
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
        )}
      </Flex>
    </StyledToolbar>
  );
};

export interface BorderProps {
  iconColor: string;
  activeIconColor: string;
  onBorderChange?: (
    color: string | undefined,
    variant?: BORDER_VARIANT
  ) => void;
}
const BorderSelection: React.FC<BorderProps> = ({
  iconColor,
  activeIconColor,
  onBorderChange
}) => {
  const [borderColor, setBorderColor] = useState<string | undefined>("#000000");
  const [borderVariant, setBorderVariant] = useState<BORDER_VARIANT>();
  const handleChangeColor = (value: string | undefined) => {
    setBorderColor(value);
    onBorderChange?.(value, borderVariant);
  };
  const handleChangeVariant = (value: BORDER_VARIANT) => {
    setBorderVariant(value);
    onBorderChange?.(borderColor, value);
  };

  return (
    <Popover usePortal placement="top-start">
      <PopoverTrigger>
        <Box>
          <Tooltip
            hasArrow
            aria-label={translations.borders}
            label={translations.borders}
            placement="bottom-start"
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
        </Box>
      </PopoverTrigger>
      <PopoverContent width={240}>
        <PopoverArrow />
        <Box display="flex">
          <Box flex={1} display="flex" p={2} flexWrap="wrap" width={180}>
            <IconButton
              aria-label={translations.border_all}
              variant={borderVariant === BORDER_VARIANT.ALL ? "solid" : "ghost"}
              color={
                borderVariant === BORDER_VARIANT.ALL
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.ALL)}
              isDisabled
              icon={MdBorderAll}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_inner}
              variant={
                borderVariant === BORDER_VARIANT.INNER ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.INNER
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.INNER)}
              icon={MdBorderInner}
              fontSize={20}
              size="sm"
              isDisabled
            />
            <IconButton
              aria-label={translations.border_horizontal}
              variant={
                borderVariant === BORDER_VARIANT.HORIZONTAL ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.HORIZONTAL
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.HORIZONTAL)}
              icon={MdBorderHorizontal}
              fontSize={20}
              size="sm"
              isDisabled
            />
            <IconButton
              aria-label={translations.border_vertical}
              variant={
                borderVariant === BORDER_VARIANT.VERTICAL ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.VERTICAL
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.VERTICAL)}
              icon={MdBorderVertical}
              fontSize={20}
              size="sm"
              isDisabled
            />
            <IconButton
              aria-label={translations.border_outer}
              variant={
                borderVariant === BORDER_VARIANT.OUTER ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.OUTER
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.OUTER)}
              icon={MdBorderOuter}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_left}
              variant={
                borderVariant === BORDER_VARIANT.LEFT ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.LEFT
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.LEFT)}
              icon={MdBorderLeft}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_right}
              variant={
                borderVariant === BORDER_VARIANT.RIGHT ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.RIGHT
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.RIGHT)}
              icon={MdBorderRight}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_top}
              variant={borderVariant === BORDER_VARIANT.TOP ? "solid" : "ghost"}
              color={
                borderVariant === BORDER_VARIANT.TOP
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.TOP)}
              icon={MdBorderTop}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_bottom}
              variant={
                borderVariant === BORDER_VARIANT.BOTTOM ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.BOTTOM
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.BOTTOM)}
              icon={MdBorderBottom}
              fontSize={20}
              size="sm"
            />
            <IconButton
              aria-label={translations.border_none}
              variant={
                borderVariant === BORDER_VARIANT.NONE ? "solid" : "ghost"
              }
              color={
                borderVariant === BORDER_VARIANT.NONE
                  ? activeIconColor
                  : iconColor
              }
              onClick={() => handleChangeVariant(BORDER_VARIANT.NONE)}
              icon={MdBorderClear}
              fontSize={20}
              size="sm"
            />
          </Box>
          <Box
            p={2}
            borderLeft="gray.300"
            borderLeftWidth={1}
            borderLeftStyle="solid"
          >
            <Popover placement="top-start">
              {({ onClose }) => {
                return (
                  <>
                    <PopoverTrigger>
                      <Button
                        size="sm"
                        color={iconColor}
                        variant="ghost"
                        pl={0}
                        pr={0}
                        flexDirection="column"
                        aria-label={translations.border_color}
                      >
                        <MdEdit />
                        <Rect color={borderColor} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent width={250}>
                      <PopoverArrow />
                      <PopoverBody>
                        <ColorPicker
                          color={borderColor}
                          onChange={value => {
                            handleChangeColor(value);
                            onClose?.();
                          }}
                          resetLabel="No borders"
                        />
                      </PopoverBody>
                    </PopoverContent>
                  </>
                );
              }}
            </Popover>
          </Box>
        </Box>
      </PopoverContent>
    </Popover>
  );
};

export default Toolbar;
