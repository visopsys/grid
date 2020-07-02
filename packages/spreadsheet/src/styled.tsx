import React, { forwardRef } from "react";
import defaultStyled, { CreateStyled } from "@emotion/styled";
import {
  theme,
  IconButton as ChakraIconButtonButton,
  Button as ChakraButton,
  Tooltip as ChakraTooltip,
  PopoverContent as ChakraPopoverContent,
  ButtonProps,
  IconButtonProps,
  PopoverContentProps
} from "@chakra-ui/core";
import { Box } from "@chakra-ui/core";
import { SYSTEM_FONT } from "./constants";
import { css } from "@emotion/core";

export type ThemeType = typeof theme;
const styled = defaultStyled as CreateStyled<ThemeType>;
export default styled;

type ToolbarProps = {
  borderColor: string;
  color?: string;
  className?: string;
  backgroundColor: string;
  pr?: number;
  pl?: number;
};
const Toolbar: React.FC<ToolbarProps> = props => <Box {...props} />;
export const StyledToolbar = styled(Toolbar)`
  min-height: 40px;
  border-color: ${props => props.borderColor};
  border-style: solid;
  background: ${props => props.backgroundColor};
  border-width: 1px 0;
  display: flex;
  align-items: center;
  min-width: 0;
`;

type SeparatorProps = {
  className?: string;
  borderColor: string;
};
const SeparatorComponent: React.FC<SeparatorProps> = props => (
  <div className={props.className}>{props.children}</div>
);
export const Separator = styled(SeparatorComponent)`
  border-color: ${props => props.borderColor};
  border-width: 0 1px 0 0;
  height: 24px;
  border-style: solid;
  margin: 0 ${props => props.theme.space[1]};
`;

export const Rect = styled(Box)`
  height: 2px;
  background: ${props => props.color};
  width: 20px;
  margin-top: 3px;
`;

export const BottomPanel = styled(Box)`
  display: flex;
  flex: 1;
  min-width: 0;
  height: 40px;
`;

export const GridWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const PercentIcon = () => <>%</>;

export const IconButton = forwardRef((props: IconButtonProps, ref) => {
  return (
    <ChakraIconButtonButton
      ref={ref}
      css={css`
        font-family: ${SYSTEM_FONT};
        line-height: 1.2;
        background: transparent;
        cursor: pointer;
        line-height: inherit;
        color: inherit;
        overflow: visible;
        text-transform: none;
        border-style: none;
      `}
      {...props}
    />
  );
});

export const PopoverContent = forwardRef((props: PopoverContentProps, ref) => {
  return (
    <ChakraPopoverContent
      ref={ref}
      css={css`
        font-family: ${SYSTEM_FONT};
      `}
      {...props}
    />
  );
});

export const Button = forwardRef((props: ButtonProps, ref) => {
  return (
    <ChakraButton
      ref={ref}
      css={css`
        font-family: ${SYSTEM_FONT};
        line-height: 1.2;
        background: transparent;
        cursor: pointer;
        line-height: inherit;
        color: inherit;
        overflow: visible;
        text-transform: none;
        border-style: none;
      `}
      {...props}
    />
  );
});
export const Tooltip = styled(ChakraTooltip)`
  font-family: ${SYSTEM_FONT};
  line-height: 1.2;
  font-size: 0.8rem;
  padding-top: 4px;
  padding-bottom: 4px;
`;
