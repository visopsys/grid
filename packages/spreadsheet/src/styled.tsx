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
  PopoverContentProps,
  useColorMode,
  MenuItem as ChakraMenuItem,
  MenuItemProps,
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
const Toolbar: React.FC<ToolbarProps> = (props) => <Box {...props} />;
export const StyledToolbar = styled(Toolbar)`
  min-height: 40px;
  border-color: ${(props) => props.borderColor};
  border-style: solid;
  background: ${(props) => props.backgroundColor};
  border-width: 1px 0;
  display: flex;
  align-items: center;
  min-width: 0;
  border-bottom-width: 0;
`;

type SeparatorProps = {
  className?: string;
  borderColor: string;
};
const SeparatorComponent: React.FC<SeparatorProps> = (props) => (
  <div className={props.className}>{props.children}</div>
);
export const Separator = styled(SeparatorComponent)`
  border-color: ${(props) => props.borderColor};
  border-width: 0 1px 0 0;
  height: 24px;
  border-style: solid;
  margin: 0 ${(props) => props.theme.space[1]};
`;

export const Rect = styled(Box)`
  height: 2px;
  background: ${(props) => props.color};
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

/* Increase decimal places */
export const IncreaseDecimalIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 -6 24 24"
      aria-hidden="true"
      focusable="false"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,7 L1.99632026,7 L1.99632026,9 L0,9 L0,7 Z M10,12 L15,12 L15,14 L10,14 L10,12 Z M16.9694527,11.9570946 L18,13.0188246 L16.9734025,14.0389803 L15,16 L15,10 L16.9694527,11.9570946 Z M2.99264052,2.99686968 C2.99264052,1.34174426 4.33709312,-1.59872116e-14 5.98804084,-1.59872116e-14 C7.64235476,-1.59872116e-14 8.98344117,1.34739093 8.98344117,2.99686968 L8.98344117,6.00313032 C8.98344117,7.65825574 7.63898856,9 5.98804084,9 C4.33372692,9 2.99264052,7.65260907 2.99264052,6.00313032 L2.99264052,2.99686968 Z M4.5,2.99857602 L4.5,6.00142398 C4.5,6.83497024 5.17157288,7.5 6,7.5 C6.83420277,7.5 7.5,6.82906466 7.5,6.00142398 L7.5,2.99857602 C7.5,2.16502976 6.82842712,1.5 6,1.5 C5.16579723,1.5 4.5,2.17093534 4.5,2.99857602 Z M9.99264052,2.99686968 C9.99264052,1.34174426 11.3370931,-1.59872116e-14 12.9880408,-1.59872116e-14 C14.6423548,-1.59872116e-14 15.9834412,1.34739093 15.9834412,2.99686968 L15.9834412,6.00313032 C15.9834412,7.65825574 14.6389886,9 12.9880408,9 C11.3337269,9 9.99264052,7.65260907 9.99264052,6.00313032 L9.99264052,2.99686968 Z M11.5,2.99857602 L11.5,6.00142398 C11.5,6.83497024 12.1715729,7.5 13,7.5 C13.8342028,7.5 14.5,6.82906466 14.5,6.00142398 L14.5,2.99857602 C14.5,2.16502976 13.8284271,1.5 13,1.5 C12.1657972,1.5 11.5,2.17093534 11.5,2.99857602 Z"></path>
    </svg>
  );
};

/* Decrease decimal places */
export const DecreaseDecimalIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 -6 24 24"
      aria-hidden="true"
      focusable="false"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.0119846,13 L16,13 L16,15 L11.0119846,15 L11.0119846,16.9944804 L9.03685276,15.0409865 L7.98433567,14 L9.03289155,12.9629313 L11.0119846,11.0055196 L11.0119846,13 Z M1,8 L2.99632026,8 L2.99632026,10 L1,10 L1,8 Z M3.99264052,3.99686968 C3.99264052,2.34174426 5.33709312,1 6.98804084,1 C8.64235476,1 9.98344117,2.34739093 9.98344117,3.99686968 L9.98344117,7.00313032 C9.98344117,8.65825574 8.63898856,10 6.98804084,10 C5.33372692,10 3.99264052,8.65260907 3.99264052,7.00313032 L3.99264052,3.99686968 Z M5.5,3.99857602 L5.5,7.00142398 C5.5,7.83497024 6.17157288,8.5 7,8.5 C7.83420277,8.5 8.5,7.82906466 8.5,7.00142398 L8.5,3.99857602 C8.5,3.16502976 7.82842712,2.5 7,2.5 C6.16579723,2.5 5.5,3.17093534 5.5,3.99857602 Z"></path>
    </svg>
  );
};

export const WrapClipIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 -6 24 24"
      aria-hidden="true"
      focusable="false"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,0 L2,0 L2,14 L0,14 L0,0 Z M12,0 L14,0 L14,14 L12,14 L12,0 Z M4,6 L12,6 L12,8 L4,8 L4,6 Z" />
    </svg>
  );
};

export const WrapIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 -6 24 24"
      aria-hidden="true"
      focusable="false"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14,0 L0,0 L0,2 L14,2 L14,0 Z M0,12 L4,12 L4,10 L0,10 L0,12 Z M11.5,5 L0,5 L0,7 L11.75,7 C12.58,7 13.25,7.67 13.25,8.5 C13.25,9.33 12.58,10 11.75,10 L9,10 L9,8 L6,11 L9,14 L9,12 L11.5,12 C13.43,12 15,10.43 15,8.5 C15,6.57 13.43,5 11.5,5 Z" />
    </svg>
  );
};

export const IconButton = forwardRef((props: IconButtonProps, ref) => {
  return (
    <ChakraIconButtonButton
      ref={ref}
      css={css`
        font-family: ${SYSTEM_FONT};
        line-height: 1.2;
        // background-color: transparent;
        cursor: pointer;
        line-height: inherit;
        overflow: visible;
        text-transform: none;
        border-style: none;
      `}
      background="none"
      {...props}
    />
  );
});

export const PopoverContent = forwardRef((props: PopoverContentProps, ref) => {
  const { colorMode } = useColorMode();
  return (
    <ChakraPopoverContent
      ref={ref}
      css={css`
        font-family: ${SYSTEM_FONT};
        color: ${colorMode === "light" ? "#333" : "white"};
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
        font-weight: normal;
        cursor: pointer;
        text-transform: none;
        border-style: none;
        text-overflow: ellipsis;
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

export const MenuItem = forwardRef((props: MenuItemProps, ref) => {
  return (
    <ChakraMenuItem
      css={css`
        font-family: ${SYSTEM_FONT};
        line-height: 1.2;
        background: transparent;
        cursor: pointer;
        line-height: inherit;
        overflow: visible;
        text-transform: none;
        border-style: none;
      `}
      ref={ref}
      {...props}
    />
  );
});
