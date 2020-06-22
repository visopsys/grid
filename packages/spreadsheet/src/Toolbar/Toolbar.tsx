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
} from "react-icons/md";
import { AiOutlineMergeCells } from "react-icons/ai";
import { IoMdColorFill, IoMdMoon } from "react-icons/io";
import {
  IconButton,
  Tooltip,
  Button,
  Flex,
  useColorMode,
  useTheme,
} from "@chakra-ui/core";
import { StyledToolbar, Rect, Separator } from "./../styled";
import {
  DARK_MODE_COLOR,
  FORMATTING,
  FONT_WEIGHT,
  FONT_STYLE,
  TEXT_DECORATION,
} from "./../constants";

const PercentIcon = () => <>%</>;

export interface ToolbarProps {
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  fill?: string;
  onFormattingChange?: (
    type: FORMATTING,
    value: any,
    options?: Record<string, any>
  ) => void;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    fontWeight,
    fontStyle,
    fill,
    textDecoration,
    onFormattingChange,
  } = props;
  const isBold = fontWeight === FONT_WEIGHT.BOLD;
  const isItalic = fontStyle === FONT_STYLE.ITALIC;
  const isStrike = textDecoration === TEXT_DECORATION.STRIKE;
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
    <StyledToolbar borderColor={borderColor} backgroundColor={backgroundColor}>
      <Flex flex={1} alignItems="center">
        <IconButton
          aria-label="Undo"
          variant="ghost"
          color={iconColor}
          icon={MdUndo}
          size="sm"
        />

        <IconButton
          aria-label="Redo"
          variant="ghost"
          color={iconColor}
          icon={MdRedo}
          size="sm"
        />

        <IconButton
          aria-label="Print"
          variant="ghost"
          color={iconColor}
          icon={MdPrint}
          size="sm"
        />

        <Separator borderColor={borderColor} />

        <IconButton
          aria-label="Format as currency"
          variant="ghost"
          color={iconColor}
          icon={MdAttachMoney}
          size="sm"
        />

        <IconButton
          aria-label="Format as percent"
          variant="ghost"
          color={iconColor}
          fontSize={10}
          icon={PercentIcon}
          size="sm"
        />

        <Separator borderColor={borderColor} />

        <IconButton
          aria-label="Bold"
          variant={isBold ? "solid" : "ghost"}
          color={isBold ? activeIconColor : iconColor}
          icon={MdFormatBold}
          fontSize={20}
          size="sm"
          onClick={() =>
            onFormattingChange?.(
              FORMATTING.FONT_WEIGHT,
              isBold ? FONT_WEIGHT.NORMAL : FONT_WEIGHT.BOLD
            )
          }
        />
        <IconButton
          aria-label="Italic"
          variant={isItalic ? "solid" : "ghost"}
          color={isItalic ? activeIconColor : iconColor}
          icon={MdFormatItalic}
          fontSize={20}
          size="sm"
          onClick={() =>
            onFormattingChange?.(
              FORMATTING.FONT_STYLE,
              isItalic ? FONT_STYLE.NORMAL : FONT_STYLE.ITALIC
            )
          }
        />

        <IconButton
          aria-label="Strikethrough"
          variant={isStrike ? "solid" : "ghost"}
          color={isStrike ? activeIconColor : iconColor}
          icon={MdFormatUnderlined}
          fontSize={20}
          size="sm"
          onClick={() =>
            onFormattingChange?.(
              FORMATTING.TEXT_DECORATION,
              isStrike ? TEXT_DECORATION.NONE : TEXT_DECORATION.STRIKE
            )
          }
        />

        <IconButton
          aria-label="Strikethrough"
          variant={isStrike ? "solid" : "ghost"}
          color={isStrike ? activeIconColor : iconColor}
          icon={MdStrikethroughS}
          fontSize={20}
          size="sm"
          onClick={() =>
            onFormattingChange?.(
              FORMATTING.TEXT_DECORATION,
              isStrike ? TEXT_DECORATION.NONE : TEXT_DECORATION.STRIKE
            )
          }
        />

        <Separator borderColor={borderColor} />

        <Button
          size="sm"
          color={iconColor}
          variant="ghost"
          p={0}
          w={8}
          flexDirection="column"
        >
          <IoMdColorFill />
          <Rect color={fill} />
        </Button>

        <IconButton
          aria-label="Border"
          variant="ghost"
          color={iconColor}
          icon={MdBorderAll}
          fontSize={20}
          size="sm"
        />

        <IconButton
          aria-label="Border"
          variant="ghost"
          color={iconColor}
          icon={AiOutlineMergeCells}
          fontSize={20}
          size="sm"
        />

        <Separator borderColor={borderColor} />

        <IconButton
          aria-label="Border"
          variant="ghost"
          color={iconColor}
          icon={MdFormatAlignLeft}
          fontSize={20}
          size="sm"
        />
        <IconButton
          aria-label="Border"
          variant="ghost"
          color={iconColor}
          icon={MdVerticalAlignBottom}
          fontSize={20}
          size="sm"
        />
      </Flex>
      <Flex alignItems="flex-end">
        <IconButton
          aria-label="Switch to dark mode"
          variant="ghost"
          color={iconColor}
          icon={isLightMode ? IoMdMoon : MdWbSunny}
          fontSize={20}
          size="sm"
          onClick={toggleColorMode}
        />
      </Flex>
    </StyledToolbar>
  );
};

export default Toolbar;
