import React, { useState, useEffect, forwardRef } from "react";
import {
  MdUndo,
  MdRedo,
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
  MdFormatColorReset,
  MdLineStyle
} from "react-icons/md";
import { AiOutlineMergeCells, AiOutlineFieldBinary } from "react-icons/ai";
import { BsColumns } from "react-icons/bs";
import { IoMdColorFill, IoMdMoon } from "react-icons/io";
import {
  Flex,
  useColorMode,
  useTheme,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverArrow,
  Box,
  Select,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  Icon,
  MenuDivider
} from "@chakra-ui/core";
import {
  StyledToolbar,
  IconButton,
  Button,
  Tooltip,
  Rect,
  Separator,
  PercentIcon,
  PopoverContent,
  MenuItem
} from "./../styled";
import {
  DARK_MODE_COLOR,
  FONT_SIZES,
  DEFAULT_FONT_SIZE,
  FONT_FAMILIES,
  DEFAULT_FONT_FAMILY,
  AVAILABLE_FORMATS,
  AVAILABLE_CURRENCY_FORMATS
} from "./../constants";
import {
  FORMATTING_TYPE,
  CellFormatting,
  VERTICAL_ALIGNMENT,
  HORIZONTAL_ALIGNMENT,
  BORDER_VARIANT,
  BORDER_STYLE
} from "./../types";
import { translations } from "../translations";
import { CellConfig } from "../Spreadsheet";
import { CirclePicker, ColorResult } from "react-color";
import { Global, css } from "@emotion/core";
import SelectDropdown from "./../Select";

export interface ToolbarProps extends CellConfig {
  onFormattingChange?: (
    type: keyof CellFormatting,
    value: any,
    options?: Record<string, any>
  ) => void;
  onFormattingChangeAuto?: () => void;
  onFormattingChangePlain?: () => void;
  onClearFormatting?: () => void;
  onMergeCells?: () => void;
  onFrozenColumnChange?: (num: number) => void;
  onFrozenRowChange?: (num: number) => void;
  frozenRows?: number;
  frozenColumns?: number;
  onBorderChange?: (
    color: string | undefined,
    borderStyle: BORDER_STYLE,
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
      <Global
        styles={css`
          .circle-picker div[title="#efefef"],
          .circle-picker div[title="#f3f3f3"],
          .circle-picker div[title="#ffffff"] {
            border: 1px solid #dadce0;
            border-radius: 50%;
          }
        `}
      />
      <Button
        variant="ghost"
        isFullWidth
        justifyContent="left"
        size="sm"
        mb={2}
        onClick={() => onChange(undefined)}
        background="none"
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
        width="260px"
        colors={[
          "#000000",
          "#434343",
          "#666666",
          "#999999",
          "#b7b7b7",
          "#cccccc",
          "#d9d9d9",
          "#efefef",
          "#f3f3f3",
          "#ffffff",
          "#980000",
          "#ff0000",
          "#ff9900",
          "#ffff00",
          "#00ff00",
          "#00ffff",
          "#4a86e8",
          "#0000ff",
          "#9900ff",
          "#ff00ff",
          "#e6b8af",
          "#f4cccc",
          "#fce5cd",
          "#fff2cc",
          "#d9ead3",
          "#d0e0e3",
          "#c9daf8",
          "#cfe2f3",
          "#d9d2e9",
          "#ead1dc",
          "#dd7e6b",
          "#ea9999",
          "#f9cb9c",
          "#ffe599",
          "#b6d7a8",
          "#a2c4c9",
          "#a4c2f4",
          "#9fc5e8",
          "#b4a7d6",
          "#d5a6bd",
          "#cc4125",
          "#e06666",
          "#f6b26b",
          "#ffd966",
          "#93c47d",
          "#76a5af",
          "#6d9eeb",
          "#6fa8dc",
          "#8e7cc3",
          "#c27ba0",
          "#a61c00",
          "#cc0000",
          "#e69138",
          "#f1c232",
          "#6aa84f",
          "#45818e",
          "#3c78d8",
          "#3d85c6",
          "#674ea7",
          "#a64d79",
          "#85200c",
          "#990000",
          "#b45f06",
          "#bf9000",
          "#38761d",
          "#134f5c",
          "#1155cc",
          "#0b5394",
          "#351c75",
          "#741b47",
          "#5b0f00",
          "#660000",
          "#783f04",
          "#7f6000",
          "#274e13",
          "#0c343d",
          "#1c4587",
          "#073763",
          "#20124d",
          "#4c1130"
        ]}
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
    enableDarkMode,
    fontSize = DEFAULT_FONT_SIZE,
    fontFamily = DEFAULT_FONT_FAMILY,
    format,
    onFormattingChangeAuto,
    onFormattingChangePlain,
    plaintext
  } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isLight = colorMode === "light";
  const activeIconColor = theme.colors.teal[500];
  const iconColor = isLight ? theme.colors.gray[600] : theme.colors.gray[50];
  const borderColor = isLight ? theme.colors.gray[300] : theme.colors.gray[600];
  const backgroundColor = isLight ? "white" : DARK_MODE_COLOR;
  const foregroundColor = isLight ? DARK_MODE_COLOR : "white";
  return (
    <StyledToolbar
      pr={2}
      pl={2}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      color={foregroundColor}
    >
      <Flex flex={1} alignItems="center" flexWrap="wrap" minWidth={1}>
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

        <Menu>
          <MenuButton
            color={foregroundColor}
            as={Button}
            size="sm"
            flexShrink={0}
            paddingLeft={1}
            paddingRight={1}
            background="none"
          >
            <AiOutlineFieldBinary fontSize={18} />
            <Icon name="chevron-down" fontSize={16} />
          </MenuButton>
          <MenuList placement="top-start" minWidth={250}>
            <MenuItem
              onClick={() => {
                onFormattingChangeAuto?.();
              }}
            >
              <Box width="24px">
                {format === void 0 && !plaintext && (
                  <Icon name="check" mr={1} />
                )}
              </Box>
              Automatic
            </MenuItem>
            <MenuItem
              onClick={() => {
                onFormattingChangePlain?.();
              }}
            >
              <Box width="24px">
                {plaintext && <Icon name="check" mr={1} />}
              </Box>
              Plain
            </MenuItem>
            <MenuDivider borderColor={borderColor} />
            {AVAILABLE_FORMATS.map((item, idx) => {
              return (
                <MenuItem
                  display="flex"
                  onClick={() => {
                    onFormattingChange?.(
                      FORMATTING_TYPE.CUSTOM_FORMAT,
                      item.value
                    );
                  }}
                  key={idx}
                >
                  <Box width="24px">
                    {format === item.value && !plaintext && (
                      <Icon name="check" mr={1} />
                    )}
                  </Box>
                  <Box flex={1}>{item.label}</Box>
                  <Box textAlign="right" color="gray.500">
                    {item.sample}
                  </Box>
                </MenuItem>
              );
            })}
            <MenuDivider borderColor={borderColor} />
            {AVAILABLE_CURRENCY_FORMATS.map((item, idx) => {
              return (
                <MenuItem
                  display="flex"
                  onClick={() => {
                    onFormattingChange?.(
                      FORMATTING_TYPE.CUSTOM_FORMAT,
                      item.value
                    );
                  }}
                  key={idx}
                >
                  <Box width="24px">
                    {format === item.value && !plaintext && (
                      <Icon name="check" mr={1} />
                    )}
                  </Box>
                  <Box flex={1}>{item.label}</Box>
                  <Box textAlign="right" color="gray.500">
                    {item.sample}
                  </Box>
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>

        <Separator borderColor={borderColor} />

        <Menu>
          <MenuButton
            paddingLeft={1}
            paddingRight={1}
            as={Button}
            background="none"
            fontSize={12}
            fontWeight="normal"
            size="sm"
            width={100}
            textAlign="left"
            display="flex"
            whiteSpace="nowrap"
            minWidth={0}
            flexShrink={0}
            color={foregroundColor}
          >
            <Box
              whiteSpace="nowrap"
              overflow="hidden"
              flex={1}
              // @ts-ignore
              textOverflow="ellipsis"
            >
              {fontFamily}
            </Box>
            <Icon name="chevron-down" fontSize={16} />
          </MenuButton>
          <MenuList placement="top-start">
            {FONT_FAMILIES.map((font, idx) => {
              return (
                <MenuItem
                  onClick={() => {
                    onFormattingChange?.(FORMATTING_TYPE.FONT_FAMILY, font);
                  }}
                  key={idx}
                >
                  <Box width="24px">
                    {font === fontFamily && <Icon name="check" mr={1} />}
                  </Box>
                  {font}
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>

        <Separator borderColor={borderColor} />

        <SelectDropdown
          options={FONT_SIZES.map(size => ({ label: size, value: size }))}
          onChange={item => {
            onFormattingChange?.(FORMATTING_TYPE.FONT_SIZE, item?.value);
          }}
          value={{ value: fontSize, label: fontSize }}
          format={value => parseInt(value)}
        />

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
                        background="none"
                      >
                        <MdTextFields />
                        <Rect color={color} />
                      </Button>
                    </Tooltip>
                  </Box>
                </PopoverTrigger>
                <PopoverContent
                  width={280}
                  borderColor={isLight ? undefined : DARK_MODE_COLOR}
                >
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
                        background="none"
                      >
                        <IoMdColorFill />
                        <Rect color={fill} />
                      </Button>
                    </Tooltip>
                  </Box>
                </PopoverTrigger>
                <PopoverContent
                  width={280}
                  borderColor={isLight ? undefined : DARK_MODE_COLOR}
                >
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

        <BorderSelection
          onBorderChange={onBorderChange}
          iconColor={iconColor}
          activeIconColor={activeIconColor}
          isLight={isLight}
        />

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
          {() => {
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
                <PopoverContent
                  width={220}
                  borderColor={
                    isLight ? theme.colors.gray[500] : DARK_MODE_COLOR
                  }
                >
                  <PopoverArrow />
                  <PopoverBody color={foregroundColor}>
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
                        borderColor={
                          isLight
                            ? theme.colors.gray[300]
                            : "rgba(255,255,255,0.04)"
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
                        borderColor={
                          isLight
                            ? theme.colors.gray[300]
                            : "rgba(255,255,255,0.04)"
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
          {() => {
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
                <PopoverContent
                  width="auto"
                  borderColor={isLight ? undefined : DARK_MODE_COLOR}
                >
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
          {() => {
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
                <PopoverContent
                  width="auto"
                  borderColor={isLight ? undefined : DARK_MODE_COLOR}
                >
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
              isLight
                ? translations.switch_dark_mode
                : translations.switch_light_mode
            }
            label={
              isLight
                ? translations.switch_dark_mode
                : translations.switch_light_mode
            }
          >
            <IconButton
              aria-label={
                isLight
                  ? translations.switch_dark_mode
                  : translations.switch_light_mode
              }
              variant="ghost"
              color={iconColor}
              icon={isLight ? IoMdMoon : MdWbSunny}
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
    borderStyle: BORDER_STYLE,
    variant?: BORDER_VARIANT
  ) => void;
  isLight?: boolean;
}
const BorderSelection: React.FC<BorderProps> = ({
  iconColor,
  activeIconColor,
  onBorderChange,
  isLight
}) => {
  const [borderColor, setBorderColor] = useState<string | undefined>("#000000");
  const [borderVariant, setBorderVariant] = useState<BORDER_VARIANT>();
  const [borderStyle, setBorderStyle] = useState<BORDER_STYLE>(
    BORDER_STYLE.THIN
  );
  const handleChangeColor = (value: string | undefined) => {
    setBorderColor(value);
    onBorderChange?.(value, borderStyle, borderVariant);
  };
  const handleChangeVariant = (value: BORDER_VARIANT) => {
    setBorderVariant(value);
    onBorderChange?.(borderColor, borderStyle, value);
  };
  const handleChangeBorderStyle = (value: BORDER_STYLE) => {
    setBorderStyle(value);
    onBorderChange?.(borderColor, value, borderVariant);
  };

  return (
    <Popover
      usePortal
      placement="auto-start"
      onClose={() => {
        setBorderVariant(undefined);
      }}
    >
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
      <PopoverContent
        width={240}
        borderColor={isLight ? undefined : DARK_MODE_COLOR}
      >
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
            flexDirection="column"
            display="flex"
          >
            <Popover placement="top-start">
              {({ onClose }) => {
                return (
                  <>
                    <PopoverTrigger>
                      <Box>
                        <Tooltip
                          hasArrow
                          aria-label={translations.border_color}
                          label={translations.border_color}
                        >
                          <Button
                            size="sm"
                            color={iconColor}
                            variant="ghost"
                            pl={0}
                            pr={0}
                            flexDirection="column"
                            aria-label={translations.border_color}
                            background="none"
                          >
                            <MdEdit />
                            <Rect color={borderColor} />
                          </Button>
                        </Tooltip>
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      zIndex={1}
                      width={280}
                      borderColor={isLight ? undefined : DARK_MODE_COLOR}
                    >
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
            <Popover placement="top-start">
              {({ onClose }) => {
                return (
                  <>
                    <PopoverTrigger>
                      <Box>
                        <Tooltip
                          hasArrow
                          aria-label={translations.border_style}
                          label={translations.border_style}
                        >
                          <IconButton
                            aria-label={translations.border_style}
                            variant="ghost"
                            color={iconColor}
                            icon={MdLineStyle}
                            fontSize={20}
                            size="sm"
                          />
                        </Tooltip>
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      width={100}
                      borderColor={isLight ? undefined : DARK_MODE_COLOR}
                    >
                      <PopoverArrow />
                      <PopoverBody>
                        <Button
                          background="none"
                          variant={
                            borderStyle === BORDER_STYLE.THIN
                              ? "solid"
                              : "ghost"
                          }
                          color={
                            borderStyle === BORDER_STYLE.THIN
                              ? activeIconColor
                              : iconColor
                          }
                          size="sm"
                          onClick={() => {
                            handleChangeBorderStyle(BORDER_STYLE.THIN);
                            onClose?.();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="1"
                            style={{ userSelect: "none" }}
                          >
                            <line
                              x1="0"
                              y1="0.5"
                              x2="50"
                              y2="0.5"
                              strokeWidth="1"
                              stroke="black"
                              style={{ userSelect: "none" }}
                            ></line>
                          </svg>
                        </Button>
                        <Button
                          background="none"
                          variant={
                            borderStyle === BORDER_STYLE.MEDIUM
                              ? "solid"
                              : "ghost"
                          }
                          color={
                            borderStyle === BORDER_STYLE.MEDIUM
                              ? activeIconColor
                              : iconColor
                          }
                          size="sm"
                          onClick={() => {
                            handleChangeBorderStyle(BORDER_STYLE.MEDIUM);
                            onClose?.();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="2"
                            style={{ userSelect: "none" }}
                          >
                            <line
                              x1="0"
                              y1="1.0"
                              x2="50"
                              y2="1.0"
                              strokeWidth="2"
                              stroke="black"
                              style={{ userSelect: "none" }}
                            ></line>
                          </svg>
                        </Button>
                        <Button
                          background="none"
                          variant={
                            borderStyle === BORDER_STYLE.THICK
                              ? "solid"
                              : "ghost"
                          }
                          color={
                            borderStyle === BORDER_STYLE.THICK
                              ? activeIconColor
                              : iconColor
                          }
                          size="sm"
                          onClick={() => {
                            handleChangeBorderStyle(BORDER_STYLE.THICK);
                            onClose?.();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="3"
                            style={{ userSelect: "none" }}
                          >
                            <line
                              x1="0"
                              y1="1.5"
                              x2="50"
                              y2="1.5"
                              strokeWidth="3"
                              stroke="black"
                              style={{ userSelect: "none" }}
                            ></line>
                          </svg>
                        </Button>
                        <Button
                          background="none"
                          variant={
                            borderStyle === BORDER_STYLE.DASHED
                              ? "solid"
                              : "ghost"
                          }
                          color={
                            borderStyle === BORDER_STYLE.DASHED
                              ? activeIconColor
                              : iconColor
                          }
                          size="sm"
                          onClick={() => {
                            handleChangeBorderStyle(BORDER_STYLE.DASHED);
                            onClose?.();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="1"
                            style={{ userSelect: "none" }}
                          >
                            <line
                              x1="0"
                              y1="0.5"
                              x2="50"
                              y2="0.5"
                              strokeWidth="1"
                              stroke="black"
                              strokeDasharray="2"
                              style={{ userSelect: "none" }}
                            ></line>
                          </svg>
                        </Button>
                        <Button
                          background="none"
                          variant={
                            borderStyle === BORDER_STYLE.DOTTED
                              ? "solid"
                              : "ghost"
                          }
                          color={
                            borderStyle === BORDER_STYLE.DOTTED
                              ? activeIconColor
                              : iconColor
                          }
                          size="sm"
                          onClick={() => {
                            handleChangeBorderStyle(BORDER_STYLE.DOTTED);
                            onClose?.();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="1"
                            style={{ userSelect: "none" }}
                          >
                            <line
                              x1="0"
                              y1="0.5"
                              x2="50"
                              y2="0.5"
                              strokeWidth="1"
                              stroke="black"
                              strokeDasharray="1"
                              style={{ userSelect: "none" }}
                            ></line>
                          </svg>
                        </Button>
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
